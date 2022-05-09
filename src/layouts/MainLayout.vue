<template>
  <q-layout view="lhr lpr lfr">
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
    <!--End Content Page-->

  </q-layout>
</template>

<script>

import {ref} from 'vue'
import {useQuasar} from 'quasar'
import database from '../database';
import SideNav from "components/side-nav.vue";

let refresh_grid_options = {}

export default {
  components: {
    SideNav
  },
  setup() {
    const $q = useQuasar()
    return {
      tag_clicked: ref({}),
      tag_color: ref({}),
      selected_tags: [],
      tag_edit: ref(false),
      tag_label: ref(''),
      tag_id: ref(''),
      tags: ref([]),
      add_tag: ref([]),
      new_tags: ref([]),
      temp_color_options: [],
      tag_color_options: [
        {label: 'amber-5', value: 'amber-5'},
        {label: 'red-11', value: 'red-11'},
        {label: 'grey', value: 'grey'},
      ],
      isPwd: ref(true),
      selectedTab: ref('vault'),
      unreal_token: ref(''),
      account_number: ref('')
    }
  },

  mounted: async function () {
    await this.loadData()
  },
  methods: {
    updateTag() {
      this.tag_clicked.color = this.tag_color.value
      this.tag_clicked.label = this.tag_label
      this.tag_clicked.value = this.tag_label

    },

    //Begin Side Bar Methods
    filterGrid(selected_tags) {
      // console.log(selected_tags)
    },
    // selectedTag(tag) {
    //   if (tag.selected === true) {
    //     this.selected_tags.push(tag)
    //   } else {
    //     const index = this.selected_tags.findIndex(({label}) => label === tag.label);
    //     this.selected_tags.splice(index, 1)
    //   }
    // },
    async saveTagInfo() {
      // refresh_grid_options.refresh = true
      // this.tag_clicked.label = this.tag_label
      // this.tag_clicked.color = this.tag_color.value
      // this.tag_edit = false
      //
      // let data = {
      //   id: this.tag_clicked.id,
      //   color: this.tag_clicked.color,
      //   label: this.tag_clicked.label,
      //   value: this.tag_clicked.value,
      // }
      //
      // await database.putRow('tags', data)
      this.tag_edit = false
    },
    async removeTag(tag) {
      const index = this.tags.findIndex(({label}) => label === tag.label);
      this.tags.splice(index, 1)
      await database.deleteRow('tags', tag.id)
    },
    displayTag(tag) {
      console.log(tag)
      // console.log(this.tag_color_options)
      this.tag_edit = true
      this.tag_clicked = tag
      this.tag_label = tag.label
      this.tag_color.value = tag.color
      this.tag_color.label = tag.color
    },
    async createValue(val, done) {
      refresh_grid_options.refresh = true

      // specific logic to eventually call done(...) -- or not
      done(val, 'add-unique')
      if (val.length > 0) {
        val
          .split(/[,;|]+/)
          .map(v => v.trim())
          .filter(v => v.length > 0)
          .forEach(v => {
            const found = this.tag_info_options.some(item => item.label === v);
            if (found === false) {
              let obj = {label: v, value: v, color: 'grey'}
              this.new_tags.push(obj)
            }
          })
        done(null)

        for (let tag of this.new_tags) {
          let data = JSON.parse(JSON.stringify(tag));
          // this.saveDb('tags', data, 'ADD')
        }
        this.tags = []
        this.new_tags = []
      }
    },
    //End Nav Bar Methods

    async getToken() {
      let snifferPath = 'Fiddler.exe'
      let launchaerPath = 'F:\\Program Files (x86)\\Epic Games\\Launcher\\Portal\\Binaries\\Win64\\EpicGamesLauncher.exe'
      let data = await window.myNodeApi.launchSniffer(snifferPath, launchaerPath)

      const dataArray = data.split(",");
      this.unreal_token = dataArray[0].toString()
      let url = dataArray[1].toString()
      let tmpStr = url.match("v1/(.*)/s");
      this.account_number = tmpStr[1];

      let row = {
        account_number: this.account_number,
        unreal_token: this.unreal_token
      }
      await database.putRow('user_settings', row)
    },
    async saveUserSettings() {
      let data = {
        account_number: this.account_number,
        unreal_token: this.unreal_token
      }
      await database.putRow('user_settings', data)
    },
    async loadData() {

      let user_settings = await database.getRow('user_settings')
      if (user_settings !== null) {
        this.unreal_token = user_settings.unreal_token
        this.account_number = user_settings.account_number
      }
    }
  }
}
</script>
