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
        text-color="white"
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

<script setup>

import {ref} from 'vue'
import {api} from "../api/api.js";
import {db} from "../api/db.js";

const tags = ref([])
const tags_listed = ''
const tag_info_options = ref([])

const props = defineProps({
  params: Object
});

loadData()

async function updateTags(tags) {
  let arrTags = []
  for (let tag of tags) {
    arrTags.push(tag.id)
  }
  await api.updateVaultAsset(props.params.data.assetId,{tagIds: arrTags})

}

function selectedTag(e) {
}

async function loadData() {
  const rowID = props.params.data.id
  tag_info_options.value = await db.tags.toArray()
  tag_info_options.value = tag_info_options.value.sort((a, b) => (a.label > b.label) ? 1 : -1)
  if (props.params.data.tagIds !== undefined) {
    tags.value = await db.tags.where('id').anyOf(props.params.data.tagIds).toArray() || []
  }
}
</script>
<style scoped>

</style>
