<template>
  <div id="menu" class="q-pa-xs text-h6 bg-primary text-white">Menu</div>
  <div id="tag_item" class="q-pa-xs">Filter by tag or add new</div>

  <div class="col q-pa-md">
    <q-select
      filled
      v-model="tags"
      use-input
      use-chips
      multiple
      hint="Separate multiple values by [,;|]"
      hide-dropdown-icon
      input-debounce="0"
      :options="tag_info_options"
      @new-value="createValue"
      style="width: 400px"
    />
  </div>
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
            <div>{{ tag.label }}</div>
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
import {openDB} from "idb";

let db

export default {
  name: 'SideNav',
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
      tag_color_options: [
        {label: 'amber-5', value: 'amber-5'},
        {label: 'red-11', value: 'red-11'},
        {label: 'grey', value: 'grey'},
      ],
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
        const additional_row_info = db.createObjectStore('additional_row_info', {
          // The 'id' property of the object will be the key.
          keyPath: 'catalogItemId'
        });
      },
    });
    await this.loadData()
  },
  methods: {
    filterGrid(selected_tags) {
     // console.log(selected_tags)
    },
    selectedTag(tag) {
      if (tag.selected === true) {
        tag.selected = true
        this.selected_tags.push(tag)
      } else {
        tag.selected = false
        const index = this.selected_tags.findIndex(({label}) => label === tag.label);
        this.selected_tags.splice(index, 1)
      }
      this.filterGrid(this.selected_tags)
    },
    async saveTagInfo() {
      this.tag_clicked.label = this.tag_label
      this.tag_clicked.color = this.tag_color.value
      this.tag_edit = false
      let data = JSON.parse(JSON.stringify(this.tag_clicked));
      await this.saveDb('tags', data, 'PUT')
    },
    async removeTag(tag) {
      const index = this.tag_info_options.findIndex(({label}) => label === tag.label);
      let tag_to_delete = JSON.parse(JSON.stringify(tag));
      this.tag_info_options.splice(index, 1)
      this.selected_tags.splice(index, 1)
      await this.saveDb('tags', tag_to_delete, 'DELETE')
    },
    displayTag(tag) {
      this.tag_edit = true
      this.tag_clicked = tag
      this.tag_label = tag.label
      this.tag_color.value = tag.color
      this.tag_color.label = tag.color
    },
    createValue(val, done) {
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
          this.saveDb('tags', data, 'ADD')
        }
        this.tags = []
        this.new_tags = []
      }
    },
    async saveDb(database, tag, action) {
      let id
      if (action === 'ADD') {
        id = await db.add(database, {
          label: tag.label,
          value: tag.value,
          color: tag.color,
          selected: false
        })
        tag.id = id
        this.tag_info_options.push(tag)
      } else if (action === 'PUT') {
        await db.put(database, {
          label: tag.label,
          value: tag.value,
          color: tag.color,
          id: tag.id,
          selected: false
        })
      } else if (action === 'DELETE') {
        await db.delete(database, tag.id)
      }
    },
    async loadData() {
      this.tag_info_options = await db.getAll('tags') || [];
    }
  }
}
</script>
