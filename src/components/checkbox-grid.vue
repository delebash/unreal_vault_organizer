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

<script>
import {ref} from 'vue'
import {db} from "src/db";

export default {
  setup() {
    return {
      updates_available: ref('0')
    }
  },
  mounted: async function () {
    await this.loadData()
  },
  methods: {
    async loadData() {
     this.updates_available = this.params.data.updates_available || '0'
    },
    async updateCheckbox(value) {
      await db.vault_library.update(this.params.data.catalogItemId, {
        updates_available: value
      })
    },
  }
}
</script>

<style scoped>

</style>
