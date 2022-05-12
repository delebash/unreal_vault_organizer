<template>
  <q-select class="no_space"
            options-dense
            dense
            filled
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
import {db} from "src/db";

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
    async updateTags(tags) {
      let arrTags = []
      for (let tag of tags) {
        arrTags.push(tag.id)
      }
      await db.vault_library.update(this.params.data.catalogItemId, {
        tagIds: arrTags
      })
    },
    selectedTag(e) {
      // console.log(this.params)
    },
    async loadData() {
      this.tag_info_options = await db.tags.toArray()
      if (this.params.data.tagIds !== undefined) {
        this.tags = await db.tags.where('id').anyOf(this.params.data.tagIds).toArray() || []
      }
    }
  }
}
</script>
<style scoped>

</style>
