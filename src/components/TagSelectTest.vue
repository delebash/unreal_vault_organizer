<template>
  <div class="custom-color-cell-renderer" :class="{'color-pill': isPill, 'color-tag': !isPill}">
    <template v-for="(value, index) in values">
                <span
                  :style="{ 'background-color': backgroundColor, 'box-shadow': boxShadow, 'border-color': value }"
                >
                    {{ value }}
                </span>
    </template>
  </div>
</template>

<script setup>
import {defineProps, onBeforeMount, ref} from 'vue'
import {db} from "src/api/db.js";
const props = defineProps({
  params: Object
});

const isPill = ref(false)
const values = ref([])

onBeforeMount(() => {
  const { value } = props.params;
  const isPill = (isPill.value = Array.isArray(value));
  values.value = (isPill.value ? value : [value]).filter((value) => value != null && value !== '');
  backgroundColor.value = isPill ? `color-mix(in srgb, transparent, ${value} 20%)` : null;
  boxShadow.value = isPill ? `0 0 0 1px color-mix(in srgb, transparent, ${value} 50%)` : null;
});

</script>
