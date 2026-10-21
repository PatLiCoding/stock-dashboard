<script setup lang="ts">
import RevenueCard from '@/components/stocks/RevenueCard.vue'
import RevenueChart from '@/components/stocks/RevenueChart.vue'
import RevenueBreakdown from '@/components/stocks/RevenueBreakdown.vue'
</script>

<template>
  <main>
    <RevenueCard />
    <section class="chart-row">
      <RevenueChart />
      <RevenueBreakdown />
    </section>
  </main>
</template>

<style scoped>
main {
  padding: 24px 100px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.chart-row {
  display: flex;
  gap: 24px;
  align-items: stretch;
}

.chart-row > :first-child {
  flex: 1.8;
}

.chart-row > :last-child {
  flex: 1;
}
</style>
