<script setup lang="ts">
/**
 * @file App.vue
 * Root application component wrapping the global layout structure, application header, and router view.
 */
import { RouterView } from 'vue-router'
import Header from '@/components/layout/Header.vue'
</script>

<template>
  <section class="body-content">
    <Header />
    <RouterView />
  </section>
</template>

<style scoped>
.body-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1440px;
  min-width: 0;
  min-height: 100vh;
  gap: 12px;
}
</style>
