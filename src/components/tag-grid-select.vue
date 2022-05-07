<template>
  <q-select class="no_space"
            options-dense
            dense
            clearable
            filled
            outlined
            hide-dropdown-icon
            v-model="tags"
            use-chips
            autofocus
            hide-bottom-space
            item-aligned
            input-class="no_space"
            popup-content-class="no_space"
            multiple
            :options="tag_info_options"
            @update:model-value="updateTags"
  >

    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
      >
        <q-item-section>
          <q-item-label v-html="scope.opt.label"></q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-avatar :color="scope.opt.color"></q-avatar>
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:selected-item="scope">
      <q-chip
        removable
        dense
        :color=scope.opt.color
        @remove="scope.removeAtIndex(scope.index)"
        :tabindex="scope.tabindex"
        class="q-ma-none"
      >
        {{ scope.opt.label }}
      </q-chip>
    </template>
  </q-select>


</template>

<script>
import {ref} from 'vue'
import {openDB} from "idb";

let db

export default {
  setup(props) {
    return {
      rowID: props.params.data.id,
      tags: ref([]),
      tags_listed: '',
      tag_info_options: ref([]),
    }
  },
  mounted: async function () {

    db = await openDB('Unreal-Vault', 1, {
      upgrade(db) {
        // Create a store of objects
        const vault = db.createObjectStore('vault', {
          // The 'id' property of the object will be the key.

        });
        const vault_user_data = db.createObjectStore('vault_user_data', {
          // The 'id' property of the object will be the key.

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
    async updateTags(tag) {
      await this.saveTagDb('additional_row_info', this.tags, "PUT")
    },
    async saveTagDb(database, tags, action) {
      let rowId = this.params.data.id
      let arrTags = []
      for (let tag of tags) {
        arrTags.push(tag.id)
      }

      await db.put(database, {
        tag_ids: arrTags,
        catalogItemId: rowId
      })
    },
    selectedTag(e) {
      // console.log(this.params)
    },
    async loadData() {
      let tag
      let rowTags = await db.get('additional_row_info', this.rowID)
      if (rowTags !== undefined) {
        for(let tag_id of rowTags.tag_ids){
          tag = await db.get('tags', tag_id)
         // console.log(tag)
         this.tags.push(tag)
        }
      }
      this.tag_info_options = await db.getAll('tags') || '';

    }
  }
}
</script>

<style scoped>

</style>
