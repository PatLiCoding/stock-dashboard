<script setup lang="ts">
import BaseCard from '@/components/layout/BaseCard.vue'
import RevenueCard from '@/components/stocks/RevenueCard.vue'
</script>

<template>
  <main>
    <RevenueCard />
    <BaseCard></BaseCard>
  </main>
</template>

<style scoped>
main {
  padding: 24px 100px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
</style>
