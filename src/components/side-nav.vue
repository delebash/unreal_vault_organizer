<template>
  <div id="menu" class="q-pa-xs text-h6 bg-primary text-white">Unreal Vault Organizer</div>
  <div id="tag_item" class="q-pa-xs">Add new tags. Double click to edit.</div>
  <div class="row">
    <div class="col">
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
        style="max-width: 100%"
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
    </div>
  </div>
  <div class="row">
    <div class="col-auto">
      <q-btn class="q-pt-none"
             dense
             size="19px"
             @click="filterByTags"
             color="positive"
             label="Filter Tags by operator"></q-btn>

    </div>

    <div class="col-auto justify-start">
      <q-select
        dense
        options-dense
        narrow-indicator
        hide-dropdown-icon
        hide-bottom-space
        filled
        v-model="filter_by"
        :options="filter_by_options"
        style="width: 100px"
      />

    </div>
  </div>

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
import {db} from "src/db";

export default {
  setup() {
    return {
      tags: ref([]),
      filter_by: ref('And'),
      filter_by_options: ref(
        [
          {label: 'And', value: 'And'},
          {label: 'Or', value: 'Or'}
        ]
      ),
      new_tags: ref([]),
      tag_clicked: {},
      tag_info_options: ref([]),
      selected_tags: [],
      tag_edit: ref(false),
      tag_label: ref(''),
      tag_color: ref({}),
      tag_color_options: ref([]),
    }
  },
  mounted: async function () {
    this.tag_color_options = await db.color_palette.orderBy('label').toArray()
   await this.loadData()
  },
  methods: {
    equalsIgnoreOrder(a, b) {
      if (a.length !== b.length) return false;
      const uniqueValues = new Set([...a, ...b]);
      for (const v of uniqueValues) {
        const aCount = a.filter(e => e === v).length;
        const bCount = b.filter(e => e === v).length;
        if (aCount !== bCount) return false;
      }
      return true;
    },
    async filterByTags() {
      let filteredRows = []
      let tagIds = []
      let operator = this.filter_by
      if (this.selected_tags.length > 0) {
        for (let tag of this.selected_tags) {
          tagIds.push(tag.id)
        }
        if (typeof operator !== 'string') {
          operator = operator.label
        }
        let rows
        //Or
        if (operator === 'Or' || tagIds.length === 1) {
          filteredRows = await db.vault_library.where('tagIds').anyOf(tagIds).toArray()
        } else if (operator === 'And') {
          rows = await db.vault_library.toArray()
          for (let row of rows) {
            if (row.tagIds) {
              if (row.tagIds.length > 0) {
                if (this.equalsIgnoreOrder(row.tagIds, tagIds) === true) {
                  filteredRows.push(row)
                }
              }
            }
          }
        }
      } else {
        filteredRows = await db.vault_library.toArray()
      }
      //only unique rowsS
      filteredRows = this.uniqBy(filteredRows, JSON.stringify)
      this.eventBus.emit('filteredRows', {rows: filteredRows})
    },
    uniqBy(a, key) {
      let seen = new Set();
      return a.filter(item => {
        let k = key(item);
        return seen.has(k) ? false : seen.add(k);
      });
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
      this.tag_clicked.label = this.tag_label
      this.tag_clicked.color = this.tag_color.value
      this.tag_edit = false
      await db.tags.put({
        id: this.tag_clicked.id,
        label: this.tag_clicked.label,
        value: this.tag_clicked.value,
        color: this.tag_clicked.color
      })
      this.eventBus.emit('refreshGrid', {})
    },
    async removeTag(tag) {
      const index = this.tag_info_options.findIndex(({label}) => label === tag.label);
      this.tag_info_options.splice(index, 1)
      this.selected_tags.splice(index, 1)
      await db.tags.delete(tag.id)
      this.eventBus.emit('refreshGrid', {})
    },
    displayTag(tag) {
      this.tag_color = {}
      this.tag_edit = true
      this.tag_clicked = tag
      this.tag_label = tag.label
      this.tag_color.value = tag.color
      this.tag_color.label = tag.color
    },
    async createValue(val, done) {
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
          let id = await db.tags.add({
            value: tag.value,
            label: tag.label,
            color: tag.color
          })
          tag.id = id
          this.tag_info_options.push(tag)
        }
        this.tags = []
        this.new_tags = []
        this.eventBus.emit('refreshGrid', {})
      }
    },
    async loadData() {
      this.tag_info_options = await db.tags.toArray()
    }
  }
}
</script>
