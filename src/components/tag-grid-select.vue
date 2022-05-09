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


    await this.loadData()
  },
  methods: {
    async updateTags(tag) {
      await this.saveTagDb('additional_row_info', this.tags, "PUT")
    },
    async saveTagDb(database, tags, action) {
      let rowId = this.params.data.id
      let comment = this.params.data.comment
      let arrTags = []
      for (let tag of tags) {
        arrTags.push(tag.id)
      }

      // await db.put(database, {
      //   tag_ids: arrTags,
      //   comment: comment,
      //   catalogItemId: rowId
      // })
    },
    selectedTag(e) {
      // console.log(this.params)
    },
    async loadData() {
   //    let tag
   // //   let row = await db.get('additional_row_info', this.rowID) || null
   //    if (row !== null) {
   //      if(row.tag_ids) {
   //        for (let tag_id of row.tag_ids) {
   //          //tag = await db.get('tags', tag_id)
   //          this.tags.push(tag)
   //        }
   //      }
   //      if(row.comment){
   //        this.eventBus.emit('updateRow', {rowID: this.rowID, comment: row.comment})
   //      }
   //    }
   //    this.tag_info_options = await db.getAll('tags') || '';
    }
  }
}
</script>

<style scoped>

</style>
