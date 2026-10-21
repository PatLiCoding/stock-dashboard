<script setup lang="ts">
/**
 * @file MainView.vue
 * Main dashboard container assembling the revenue carousel, line chart, and breakdown donut chart components.
 */
import RevenueCard from '@/components/stocks/RevenueCard.vue'
import RevenueChart from '@/components/stocks/RevenueChart.vue'
import RevenueBreakdown from '@/components/stocks/RevenueBreakdown.vue'
import NetIncomeChart from '@/components/stocks/NetIncomeChart.vue'
import GrossMarginChart from '@/components/stocks/GrossMarginChart.vue'
import RevenueGrowthChart from '@/components/stocks/RevenueGrowthChart.vue'
</script>

<template>
  <main>
    <RevenueCard />

    <section class="chart-row">
      <RevenueChart />
      <RevenueBreakdown />
    </section>

    <section class="chart-row">
      <div class="chart-income-margin">
        <NetIncomeChart />
        <GrossMarginChart />
      </div>
      <RevenueGrowthChart />
    </section>
  </main>
</template>

<style scoped>
main {
  padding: 24px 100px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-bottom: 200px;
}

.chart-row,
.chart-income-margin {
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
