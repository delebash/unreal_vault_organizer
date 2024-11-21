<template>
  <Suspense>
  <router-view />
  </Suspense>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App'
})
</script>
