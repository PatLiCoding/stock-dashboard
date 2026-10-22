<script setup lang="ts">
/**
 * @file DashboardView.vue
 * Main dashboard container assembling the revenue carousel, line chart, and breakdown donut chart components.
 * Layout is responsive: rows stack vertically on tablets, the bottom charts stack on phones.
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
  gap: 32px;
  align-items: stretch;
}

.chart-row > :first-child {
  flex: 1.46;
  min-width: 0;
}

.chart-row > :last-child {
  flex: 1;
  min-width: 0;
}

/* Laptop */
@media (max-width: 1280px) {
  main {
    padding: 24px 48px;
  }

  .chart-row,
  .chart-income-margin {
    gap: 24px;
  }
}

/* Tablet: every chart row becomes a single column */
@media (max-width: 1024px) {
  main {
    padding: 24px;
    gap: 24px;
    margin-bottom: 80px;
  }

  .chart-row {
    flex-direction: column;
  }

  .chart-row > :first-child,
  .chart-row > :last-child {
    flex: none;
    width: 100%;
  }
}

/* Phone: net income and gross margin stack as well */
@media (max-width: 640px) {
  main {
    padding: 16px;
  }

  .chart-income-margin {
    flex-direction: column;
  }

  .chart-income-margin > * {
    flex: none;
  }
}
</style>
