<script setup lang="ts">
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
  width: 1440px;
  max-width: 100%;
  min-height: 100vh;
  gap: 12px;
}
</style>
