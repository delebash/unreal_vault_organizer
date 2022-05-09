<template>
  <div id="menu" class="q-pa-xs text-h6 bg-primary text-white">Menu</div>
  <div id="tag_item" class="q-pa-xs">Add new tags. Double click to edit.</div>

  <q-select
    filled
    v-model="tags"
    use-input
    use-chips
    multiple
    hint="Separate multiple values by [,;|]"
    hide-dropdown-icon
    input-debounce="0"
    @new-value="createValue"
    style="max-width: 200px"
  >

    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
      >
        <q-item-section>
          <q-item-label v-html="scope.opt.label"></q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-avatar :color=scope.opt.color></q-avatar>
        </q-item-section>
      </q-item>
    </template>

  </q-select>

  <span v-for="tag in tag_info_options">
          <q-chip
            removable
            clickable
            @dblclick="displayTag(tag)"
            @remove="removeTag(tag)"
            v-model:selected="tag.selected"
            @click="selectedTag(tag)"
            :color=tag.color
          >
            <div class="q-pl-md q-ma-xs">{{ tag.label }}</div>
      </q-chip>
  </span>

  <q-dialog v-model="tag_edit">

    <q-card style="width: 300px" class="q-px-sm q-pb-md">
      <q-btn icon="close" flat round dense v-close-popup/>
      <q-card-section>
        <div class="text-h6">Change tag properties</div>
      </q-card-section>
      <q-input v-model="tag_label" label="Tag Name"/>

      <q-select
        filled
        use-chips
        v-model="tag_color"
        :options="tag_color_options"
      >

        <template v-slot:option="scope">
          <q-item
            v-bind="scope.itemProps"
          >
            <q-item-section>
              <q-item-label v-html="scope.opt.label"></q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-avatar :color="scope.opt.value"></q-avatar>
            </q-item-section>
          </q-item>
        </template>

        <template v-slot:selected-item="scope">
          <q-chip
            removable
            dense
            :color="tag_color.value"
            @remove="scope.removeAtIndex(scope.index)"
            :tabindex="scope.tabindex"
            class="q-ma-none"
          >
            {{ tag_color.label }}
          </q-chip>
        </template>
      </q-select>
      <q-btn @click="saveTagInfo" color="primary" label="Save Tag"/>
    </q-card>
  </q-dialog>
</template>

<script>
import {ref} from 'vue'
import database from '../database';

let refresh_grid_options = {}

export default {

  setup() {

    return {
      tags: ref([]),
      new_tags: ref([]),
      tag_clicked: {},
      tag_info_options: ref([]),
      selected_tags: [],
      tag_edit: ref(false),
      tag_label: ref(''),
      tag_color: ref({}),
      temp_tag_color_options: [],
      tag_color_options: ref([
        {label: 'amber-5', value: 'amber-5'},
        {label: 'red-11', value: 'red-11'},
        {label: 'grey', value: 'grey'},
      ]),
    }
  },
  mounted: async function () {
    await this.loadData()
  },
  methods: {
    filterGrid(selected_tags) {
      // console.log(selected_tags)
    },
    selectedTag(tag) {
      if (tag.selected === true) {
        this.selected_tags.push(tag)
      } else {
        const index = this.selected_tags.findIndex(({label}) => label === tag.label);
        this.selected_tags.splice(index, 1)
      }
    },
    async saveTagInfo() {
      console.log(this.tag_color)
      refresh_grid_options.refresh = true
      this.tag_clicked.label = this.tag_label
      this.tag_clicked.color = this.tag_color.value
      this.tag_edit = false

      let data = {
        id: this.tag_clicked.id,
        label: this.tag_clicked.label,
        value: this.tag_clicked.value,
        color: this.tag_clicked.color
      }
      await database.putRow('tags', data)
    },
    async removeTag(tag) {
      refresh_grid_options.refresh = true
      const index = this.tag_info_options.findIndex(({label}) => label === tag.label);
      this.tag_info_options.splice(index, 1)
      this.selected_tags.splice(index, 1)
      await database.deleteRow('tags', tag.id)
    },

    displayTag(tag) {
     this.tag_color={}
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
          let data = {
            label: tag.label,
            value: tag.value,
            color: tag.color
          }
          let id = await database.addRow('tags', data)
          tag.id = id
          this.tag_info_options.push(tag)
        }
        this.tags = []
        this.new_tags = []
      }
    },
    async loadData() {
      this.tag_info_options = await database.getRows('tags') || []
    }
  }
}
</script>
