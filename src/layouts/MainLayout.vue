<template>
  <q-layout view="lHr lpr lfr">
    <q-header dense elevated class="bg-primary text-white" height-hint="98">
    </q-header>

    <!--    <q-drawer dense show-if-above v-model="drawerLeft" side="left" class="no-margin no-padding">-->
    <!--      <div class="row  q-pa-xs full-height">-->
    <!--        <q-card class="col q-pl-xs">-->
    <!--          &lt;!&ndash; drawer content &ndash;&gt;-->
    <!--&lt;!&ndash;          <side-nav></side-nav>&ndash;&gt;-->
    <!--        </q-card>-->
    <!--      </div>-->
    <!--    </q-drawer>-->
    <q-page-container>
      <q-page class="row no-margin q-pa-sm">
        <q-card class="col">
          <q-tabs
              dense
              v-model="selectedTab"
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
          >
            <!--            <q-btn dense flat @click="changeDrawer" round icon="menu"/>-->
            <q-tab dense name="vault" label="Vault"/>
            <q-tab dense name="settings" label="Settings"/>
            <q-btn dense flat round
                   @click="$q.dark.toggle()"
                   :icon="$q.dark.isActive ? 'nights_stay' : 'wb_sunny'"
            />
          </q-tabs>
          <q-separator/>
          <q-tab-panels class="q-pa-none q-ma-none" keep-alive v-model="selectedTab" animated>
            <q-tab-panel name="vault" class="row q-pl-xs q-pt-xs q-pb-none q-ma-none"
                         style="width: 100%; height: calc(100vh - 65px)">
              <vault-grid class="col" ref="vaultGrid"></vault-grid>
            </q-tab-panel>
            <q-tab-panel class="row q-pl-xs q-pt-xs q-pb-none q-ma-none" name="settings">
              <div class="q-md column" style="min-width: 600px;">
                <q-input dense v-model="account_number" label="Account Number*" filled
                         lazy-rules
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                >
                </q-input>
                <q-input dense v-model="unreal_token" label="Unreal Launcher Token *" filled
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

let db
import {ref} from 'vue'

// import SideNav from '../components/side-nav.vue'
import VaultGrid from '../components/vault-grid.vue'
import {useQuasar} from 'quasar'


export default {
  components: {
    VaultGrid
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
        const metadata = db.createObjectStore('vault-item-userdata', {
          // The 'id' property of the object will be the key.
          //  keyPath: 'catalogItemId'
        });
        // Create an index on the 'date' property of the objects.
        // store.createIndex('date', 'date');
      },
    });
    await this.loadData()
  },
  methods: {
    async saveUserSettings() {
      db.put('vault-item-userdata', this.unreal_token, 'unreal_token');
      db.put('vault-item-userdata', this.account_number, 'account_number');
    },
    async loadData() {
      // let cors_proxy_server =
      this.unreal_token = await db.get('vault-item-userdata', 'unreal_token');
      this.account_number = await db.get('vault-item-userdata', 'account_number')
    }
    // changeDrawer() {
    //   this.drawerLeft = !this.drawerLeft
    // }

  }
}
</script>
