<template>
  <Suspense>
    <router-view />
    </Suspense>
</template>

<script setup>
defineOptions({
  name: 'App'
});
</script>
