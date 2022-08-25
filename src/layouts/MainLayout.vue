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
                </q-input>.
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

                <q-input dense v-model="vault_cache_path" label="Vault Cache Path*" stack-label
                         lazy-rules
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                >
                </q-input>
<!--                <q-input dense v-model="launcher_path" label="Uneral Launcher Path" stack-label-->
<!--                         lazy-rules-->
<!--                         :rules="[ val => val && val.length > 0 || 'Please type something']"-->
<!--                >-->
<!--                  <q-checkbox v-model="launch_unreal" label="auto launch"/>-->
<!--                </q-input>-->
<!--                The Unreal Launcher Path is not required. In order for the sniffer to get the auth token-->
<!--                you need to click on your running instance of your launcher or exit and restart the launcher.-->
<!--                By enable this feature the program tries to launch unreal in an automated process.-->
<!--                <br>-->
                <br>
                <b>Note: you need to have your SSL certificates installed first by clicking Install Sniffer SSL Certificates.
                This is a one time install.</b>
                <br>
                After you click the button Get Token wait until you see the word flows in the new window.  Then open your launcher.  If the flows window does not close
                in a few seconds, exit and reopen launcher.
                <q-btn class="q-pt-none" dense @click="getToken()" color="primary"
                       label="Get Token"></q-btn>
                <br>
                <q-btn class="q-pt-none" dense @click="saveUserSettings()" color="positive"
                       label="Save settings"></q-btn>
                <br>
                You need to run this once before clicking Get Token.  Two windows will open and
                close.  You self signed ssl certs should be installed.
                <q-btn class="q-pt-none" dense @click="installMtimSSL()" color="primary"
                       label="Install Sniffer SSL Certificates"></q-btn>
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
import {useQuasar, Notify} from 'quasar'
import SideNav from 'components/side-nav.vue';
import {db} from '../db'
import {color_palette} from '../quasar-color-palatte.js'

export default {
  components: {
    SideNav
  },
  setup() {
    const $q = useQuasar()
    return {
      qt: $q,
      vault_cache_path: ref(''),
      launcher_path: ref(''),
      isPwd: ref(true),
      launch_unreal: ref(false),
      selectedTab: ref('vault'),
      unreal_token: ref(''),
      account_number: ref('')
    }
  },

  mounted: async function () {

    window.myNodeApi.receive("fromMain", (data) => {
      if (data.event === 'update-downloaded') {
        let actions = [
          {
            label: 'Restart Now?', color: 'white', handler: () => {
              window.myNodeApi.restart();
            }
          }
        ]
        this.showNotify('Update downloaded, ready to restart and install.', 'info', 'top', 'announcement', actions)
      }
    });
    await this.loadColorPalette()
    await this.loadData()
  },
  methods: {
    async loadColorPalette() {
      for (let color of color_palette) {
        await db.color_palette.put({
          label: color,
          value: color
        })
      }
    },

    async installMtimSSL() {
      await window.myNodeApi.installMitmSSL()
    },
    async getToken() {
      let data = await window.myNodeApi.launchSniffer()

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
      await this.loadData()
    },
    // if(this.account_number)
    async saveUserSettings() {
      await db.user_settings.put({
        id: 1,
        account_number: this.account_number,
        unreal_token: this.unreal_token,
       // launcher_path: this.launcher_path,
        vault_cache_path: this.vault_cache_path,
        launch_unreal: this.launch_unreal
      })
    },
    showNotify(msg, color, position, icon, actions) {
      this.qt.notify({
        message: msg,
        color: color,
        position: position,
        icon: icon,
        actions: actions
      })
    },
    async loadData() {
      let user_settings = await db.user_settings.where("id").equals(1).first();
      if (user_settings !== null && user_settings !== undefined) {
        this.unreal_token = user_settings.unreal_token
        this.account_number = user_settings.account_number
     //   this.launcher_path = user_settings.launcher_path
        this.vault_cache_path = user_settings.vault_cache_path
        // this.launch_unreal = user_settings.launch_unreal
      } else {
        // this.showNotify('Please verify your settings tab information', 'negative', 'top', 'report_problem')
      }
    }
  }
}
</script>
