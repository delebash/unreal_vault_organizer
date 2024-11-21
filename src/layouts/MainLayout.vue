
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
                <a :href="`${getAuthUrl}`" target="_blank">Login to your Epic Account here and
                  enter your authorization code after successful in the field below. Then click get authorization token.
                  You will
                  only need to do this step when your UE Auth Token Expires every so often</a>
                <q-input dense v-model="authorizationCode" label="Authorization Code *" stack-label>
                </q-input>

                <q-input dense v-model="unreal_token" label="Unreal Access Token *" stack-label
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
                <q-input dense v-model="account_number" label="Account Number" stack-label
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

                <br>
                <q-btn class="q-pt-none" dense @click="getAuthToken" color="primary"
                       label="Get UE Authorization Token"></q-btn>
                <br>
                <q-btn class="q-pt-none" dense @click="saveUserSettings" color="positive"
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

<script setup>

import {computed, ref, toRaw} from 'vue'
import {useQuasar, Notify} from 'quasar'
import SideNav from 'components/side-nav.vue';
import {db} from '../db.js'
import {color_palette} from '../quasar-color-palatte.js'
import {ENDPOINTS, VARS} from "../globals.js";


const $q = useQuasar()

const authorizationCode = ref('')
const vault_cache_path = ref('')
const isPwd = ref(true)
const selectedTab = ref('vault')
const unreal_token = ref('')
const account_number = ref('')
const auth = ref('')


const getAuthUrl = computed(() => {
  return ENDPOINTS.authenticate(VARS.client_id)
})


//  window.myNodeApi.receive("fromMain", () > {
// //   console.log(data.event)
// // if (data.event === 'update-downloaded') {
//   // let actions = [
//   //   {
//   //     label: 'Restart Now?', color: 'white', handler: () => {
//   //       window.myNodeApi.send("toMain", {event: 'restart', msg: ''});
//   //     }
//   //   }
//   // ]
//   // showNotify('Update downloaded, ready to restart and install.', 'info', 'top', 'announcement', actions, 'white')
// // }
// )}


await loadColorPalette()
await loadData()

async function loadColorPalette() {
  for (let color of color_palette) {
    await db.color_palette.put({
      label: color,
      value: color
    })
  }
}

async function getAuthToken() {
  if (authorizationCode.value !== '') {
    console.log('get auth')
    auth.value = await window.myNodeApi.get_ue_access_token(authorizationCode.value)

    console.log(auth.value)
    await saveAuth()
    await loadData()
    authorizationCode.value = ''
  } else {
    console.log('no auth')
  }
}

async function saveAuth() {
  await db.auth.put({
    id: 1,
    auth: toRaw(auth.value)
  })
  unreal_token.value = auth.value.access_token
  account_number.value = auth.value.account_id
  await saveUserSettings()
}

async function getUserSettings(id) {
  return db.user_settings.get(id)
}

async function saveUserSettings() {
  await db.user_settings.put({
    id: 1,
    account_number: account_number.value,
    unreal_token: unreal_token.value,
    vault_cache_path: vault_cache_path.value,
  })
}

function showNotify(msg, color, position, icon, actions, textColor) {
  $q.notify({
    message: msg,
    color: color,
    position: position,
    icon: icon,
    textColor: textColor,
    actions: actions
  })
}

async function loadData() {
  let user_settings = await db.user_settings.where("id").equals(1).first();
  if (user_settings !== null && user_settings !== undefined) {
    unreal_token.value = user_settings.unreal_token
    account_number.value = user_settings.account_number
    vault_cache_path.value = user_settings.vault_cache_path
  } else {
    showNotify('Please verify your settings tab information', 'negative', 'top', 'report_problem')
  }
}
</script>
