<script setup>
import {ref} from 'vue'
import {defineProps} from 'vue';

const props = defineProps({
  params: Object
});

const asset = props.params.data.asset

</script>

<template>

  <div class="q-ml-xs">
    {{asset.title}}
    <q-img
      :src="asset?.images[0]?.url"
      spinner-color="white"
      style="height: 140px; max-width: 150px">
    </q-img>

  </div>

</template>

<style scoped>

</style>
