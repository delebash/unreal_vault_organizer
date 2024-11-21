<template>
  <q-checkbox
    v-model="updates_available"
    color="secondary"
    true-value="1"
    false-value="0"
    disable
    @update:model-value="updateCheckbox"
  />
</template>

<script setup>
import {ref} from 'vue'
import {db} from "src/db.js";

const updates_available = ref('0')

await loadData()
    async function loadData() {
      updates_available.value = params.data.updates_available || '0'
    }

async function updateCheckbox(value) {
  await db.vault_library.update(params.data.catalogItemId, {
    updates_available: value
  })
}
</script>

<style scoped>

</style>
