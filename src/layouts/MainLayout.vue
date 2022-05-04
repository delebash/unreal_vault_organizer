<template>
  <q-layout view="lHr lpr lfr">
    <q-header dense elevated class="bg-primary text-white" height-hint="98">
    </q-header>
    <q-page-container>

      <q-page class="row no-margin q-pa-xs">
        <q-card class="col-3">
          <!-- drawer content -->
          <side-nav></side-nav>
        </q-card>
        <q-card class="col-9">
          <q-tabs
              dense
              v-model="selectedTab"
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
          >

            <q-tab dense name="vault" label="Vault"/>
            <q-tab dense name="settings" label="Settings"/>

          </q-tabs>
          <q-separator/>
          <q-tab-panels class="q-pa-none q-ma-none" keep-alive v-model="selectedTab" animated>
            <q-tab-panel name="vault" class="row q-pl-xs q-pt-xs q-pb-none q-ma-none"
                         style="width: 100%; height: calc(100vh - 65px)">
              <vault-grid class="col" ref="vaultGrid"></vault-grid>
            </q-tab-panel>
            <q-tab-panel class="row q-pl-xs q-pt-xs q-pb-none q-ma-none" name="settings">
              <div class="q-md column" style="min-width: 600px;">
                <q-input dense v-model="account_number"  label="Account Number*" stack-label
                         lazy-rules
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                >
                </q-input>
                <q-input dense v-model="unreal_token"  label="Unreal Launcher Token *" stack-label
                         :type="isPwd ? 'password' : 'text'"
                         lazy-rules
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                >

                  <template v-slot:append>
                    <q-icon dense
                            :name="isPwd ? 'visibility_off' : 'visibility'"
                            class="cursor-pointer"
                            @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>

                <q-btn class="q-pt-none" dense @click="getToken()" color="primary"
                       label="GetToken"></q-btn>

                <q-btn class="q-pt-none" dense @click="saveUserSettings()" color="secondary"
                       label="Save settings"></q-btn>

              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import {openDB} from "idb";
import {ref} from 'vue'
import SideNav from '../components/side-nav.vue'
import VaultGrid from '../components/vault-grid.vue'
import {useQuasar} from 'quasar'

let db

export default {
  components: {
    VaultGrid,
    SideNav
  },
  setup() {
    const $q = useQuasar()
    return {
      data_path: '',
      isPwd: ref(true),
      selectedTab: ref('vault'),
      unreal_token: ref(''),
      account_number: ref('')
      // drawerLeft: ref(false)
    }
  },

  mounted: async function () {
    db = await openDB('Unreal-Vault', 1, {
      upgrade(db) {
        // Create a store of objects
        const vault = db.createObjectStore('vault', {
          // The 'id' property of the object will be the key.
          //  keyPath: 'catalogItemId'
        });
        const vault_user_data = db.createObjectStore('vault_user_data', {
          // The 'id' property of the object will be the key.
          //  keyPath: 'catalogItemId'
        });
        const tags = db.createObjectStore('tags', {
          // The 'id' property of the object will be the key.
          keyPath: 'id',
          autoIncrement: true
        });
      },
    });
    await this.loadData()
  },
  methods: {

    async getToken() {
      let snifferPath = 'Fiddler.exe'
      let launchaerPath = 'F:\\Program Files (x86)\\Epic Games\\Launcher\\Portal\\Binaries\\Win64\\EpicGamesLauncher.exe'
      let data = await window.myNodeApi.launchSniffer(snifferPath, launchaerPath)

      const dataArray = data.split(",");
      let token = dataArray[0].toString()
      let url = dataArray[1].toString()
      let tmpStr = url.match("v1/(.*)/s");
      let account_number = tmpStr[1];
      this.account_number = account_number
      this.unreal_token = token
      await db.put('vault', token, 'unreal_token');
      await db.put('vault', account_number, 'account_number');

    },
    async saveUserSettings() {
      db.put('vault', this.unreal_token, 'unreal_token');
      db.put('vault', this.account_number, 'account_number');
    },
    async loadData() {
      this.unreal_token = await db.get('vault', 'unreal_token');
      this.account_number = await db.get('vault', 'account_number')
    }
  }
}
</script>
