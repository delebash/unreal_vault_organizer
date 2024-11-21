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
        <q-item-section class="text-white">
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
        text-color="white"
        @remove="scope.removeAtIndex(scope.index)"
        :tabindex="scope.tabindex"
        class="q-ma-none"
      >
        {{ scope.opt.label }}
      </q-chip>
    </template>
  </q-select>
</template>

<script setup>

import {ref} from 'vue'
import {db} from "src/db.js";


const rowID = params.data.id
const tags = ref([])
const tags_listed = ''
const tag_info_options = ref([])


await loadData()

async function updateTags(tags) {
  let arrTags = []
  for (let tag of tags) {
    arrTags.push(tag.id)
  }
  await db.vault_library.update(params.data.catalogItemId, {
    tagIds: arrTags
  })
}

function selectedTag(e) {
}

async function loadData() {
  tag_info_options.value = await db.tags.toArray()
  tag_info_options.value = tag_info_options.value.sort((a, b) => (a.label > b.label) ? 1 : -1)
  if (params.data.tagIds !== undefined) {
    tags.value = await db.tags.where('id').anyOf(params.data.tagIds).toArray() || []
  }
}
</script>
<style scoped>

</style>
