// CustomFilter.vue
<template>
  <div class="person-filter">
    <div>Custom Athlete Filter</div>
    <div>
      <input type="text" ref="eFilterText" v-model="filterText" v-on:keyup="updateFilter($event)" placeholder="Full name search..."/>
    </div>
    <div>This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>
  </div>
</template>

<script setup>
import {ref, defineExpose} from 'vue';
const { params } = defineProps();
// const { field } = params.colDef;
const filterText = ref([]);

const isFilterActive = () => {
  return true
}
const updateFilter = (value) => {
  console.log(value)
  params.filterChangedCallback();
}
const doesFilterPass = (params) => {
  console.log(params.data);
  // params.data[field] == filterState.value
}
const getModel = () => {
 // console.log(filterState.value)
  // if(filterState.value.length != 0){
  //   return undefined
  // }
  // return { state: filterState.value }
}
const setModel = (model) => {
  if(model == null) {
    updateFilter([])
  } else {
    updateFilter(model.state)
  }
}
</script>
