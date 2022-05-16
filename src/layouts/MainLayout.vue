<template>
  <q-layout view="lhr lpr lfr">
    <q-header dense elevated class="bg-primary text-white" height-hint="98">
    </q-header>
    <q-page-container>

      <q-page class="row no-margin q-pa-xs">
        <q-card class="col-2">
          <!-- drawer content -->
          <side-nav></side-nav>
        </q-card>
        <q-card class="col-10">
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
                <q-input dense v-model="account_number" label="Account Number*" stack-label
                         lazy-rules
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                >
                </q-input>
                <q-input dense v-model="unreal_token" label="Unreal Launcher Token *" stack-label
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
                <q-input dense v-model="launcher_path" label="Uneral Launcher Path*" stack-label
                         lazy-rules
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                >
                </q-input>
                <q-input dense v-model="sniffer_path" label="Sniffer Path*" stack-label
                         lazy-rules
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                >
                </q-input>
                <q-input dense v-model="vault_cache_path" label="Vault Cache Path*" stack-label
                         lazy-rules
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                >
                </q-input>
                <q-btn class="q-pt-none" dense @click="getToken()" color="primary"
                       label="GetToken"></q-btn>

                <q-btn class="q-pt-none" dense @click="saveUserSettings()" color="positive"
                       label="Save settings"></q-btn>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </q-page>
    </q-page-container>
    <!--End Content Page-->

  </q-layout>
</template>

<script>

import {ref} from 'vue'
import {useQuasar} from 'quasar'
import SideNav from 'components/side-nav.vue';
import {db} from '../db'

let refresh_grid_options = {}

export default {
  components: {
    SideNav
  },
  setup() {
    const $q = useQuasar()
    return {
      launcher_path: ref(''),
      vault_cache_path: ref(''),
      sniffer_path: ref(''),
      isPwd: ref(true),
      selectedTab: ref('vault'),
      unreal_token: ref(''),
      account_number: ref('')
    }
  },

  mounted: async function () {
    await this.loadColorPalette()
    await this.loadData()
  },
  methods: {
    async loadColorPalette() {
      let path = 'src/quasar-color-palatte.txt'
      let arryColors = await window.myNodeApi.loadColorPalette(path)
      for (let color of arryColors) {
        await db.color_palette.put({
          label: color.label,
          value: color.value
        })
      }
    },
    async getToken() {
      // let snifferPath = 'Fiddler.exe'
      // let launcherPath = 'F:\Program Files (x86)\Epic Games\Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe'
      let data = await window.myNodeApi.launchSniffer(this.sniffer_path, this.launcher_path)

      const dataArray = data.split(",");
      this.unreal_token = dataArray[0].toString()
      let url = dataArray[1].toString()

      if (url !== 'none') {
        this.account_number = url.substring(
          url.lastIndexOf("v1/") + 3,
          url.lastIndexOf("/settings")
        );
      }
      await this.saveUserSettings()
    },
    // if(this.account_number)
    async saveUserSettings() {

      await db.user_settings.put({
        id: 1,
        account_number: this.account_number,
        unreal_token: this.unreal_token,
        sniffer_path: this.sniffer_path,
        launcher_path: this.launcher_path,
        vault_cache_path: this.vault_cache_path
      })
    },
    async loadData() {
      let user_settings = await db.user_settings.where("id").equals(1).first();
      if (user_settings !== null && user_settings !== undefined) {
        this.unreal_token = user_settings.unreal_token
        this.account_number = user_settings.account_number
        this.launcher_path = user_settings.launcher_path
        this.sniffer_path = user_settings.sniffer_path
        this.vault_cache_path = user_settings.vault_cache_path
      }
    }
  }
}
</script>
