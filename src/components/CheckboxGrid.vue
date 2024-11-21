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
import { defineProps } from 'vue';
import {api} from "src/api/api.js";

const props = defineProps({
  params: Object
});

const updates_available = ref('0')
loadData()

async function loadData() {

  updates_available.value = props.params.data.updates_available || '0'
}

async function updateCheckbox(value) {
  await api.updateVaultAsset(props.params.data.assetId,{updates_available: value})
}
</script>

<style scoped>

</style>
