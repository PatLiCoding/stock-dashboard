<script setup lang="ts">
/**
 * @file NetIncomeChart.vue
 * Renders a horizontal bar chart displaying Net Income TTM for the Magnificent Seven companies.
 */
import { computed } from 'vue'
import BaseCard from '../layout/BaseCard.vue'
import stockData from '@/assets/data/stock.json'
import type { Company } from '@/interface/interface.ts'
import { getTtm, BLUE_SHADES } from '@/utils/stock'

const W = 320
const H = 190
const M = { top: 8, right: 36, bottom: 25, left: 62 }

const plotW = W - M.left - M.right
const plotH = H - M.top - M.bottom

const companies: Company[] = stockData.companies

const chartItems = computed(() => {
  return companies
    .map((c) => ({
      ticker: c.ticker,
      name: c.name,
      value: getTtm(c.netIncome),
    }))
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      ...item,
      color: BLUE_SHADES[index] ?? BLUE_SHADES[BLUE_SHADES.length - 1],
    }))
})

const xMax = computed(() => {
  const maxVal = Math.max(...chartItems.value.map((i) => i.value), 1)
  return Math.ceil((maxVal * 1.15) / 10) * 10
})

const xTicks = computed(() => {
  const max = xMax.value
  return [0, Math.round(max * 0.25), Math.round(max * 0.5), Math.round(max * 0.75), max]
})

const barHeight = 11
const rowGap = (plotH - chartItems.value.length * barHeight) / (chartItems.value.length + 1)

const xPos = (v: number) => M.left + (Math.max(0, v) / xMax.value) * plotW
const yPos = (index: number) => M.top + rowGap + index * (barHeight + rowGap)
</script>

<template>
  <BaseCard class="net-income-card">
    <h2 class="title">Net Income TTM</h2>

    <div class="chart-body">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Net Income TTM bar chart"
      >
        <!-- Grid lines + X labels -->
        <g>
          <template v-for="t in xTicks" :key="t">
            <line
              :x1="M.left + (t / xMax) * plotW"
              :x2="M.left + (t / xMax) * plotW"
              :y1="M.top"
              :y2="M.top + plotH"
              class="grid"
            />
            <text
              :x="M.left + (t / xMax) * plotW"
              :y="M.top + plotH + 16"
              text-anchor="middle"
              class="axis-label"
            >
              {{ t }}
            </text>
          </template>
        </g>

        <!-- Bars, Company labels & Values outside -->
        <g v-for="(item, i) in chartItems" :key="item.ticker">
          <text
            :x="M.left - 10"
            :y="yPos(i) + barHeight / 2 + 4"
            text-anchor="end"
            class="axis-label company-label"
          >
            {{ item.name }}
          </text>

          <rect
            :x="M.left"
            :y="yPos(i)"
            :width="Math.min((item.value / xMax) * plotW, plotW)"
            :height="barHeight"
            class="bar"
            :fill="item.color"
          />

          <!-- Wert außerhalb des Balkens rechts -->
          <text :x="xPos(item.value) + 6" :y="yPos(i) + barHeight / 2 + 4" class="bar-value">
            {{ item.value.toFixed(2) }}
          </text>
        </g>
      </svg>
    </div>
  </BaseCard>
</template>

<style scoped>
.net-income-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  min-width: 0;
  flex: 1.4;
  background: #002238;
  border: 1px solid rgba(57, 218, 255, 0.08);
}

.title {
  margin: 0;
  font-family: Rubik, sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #f1f5f9;
}

.chart-body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

svg {
  width: 100%;
  height: auto;
  display: block;
}

.grid {
  stroke: rgba(255, 255, 255, 0.22);
  stroke-width: 1;
}

.axis-label {
  fill: rgba(255, 255, 255, 0.75);
  font-size: 8px;
}

.company-label {
  font-size: 8px;
}

.bar {
  rx: 1;
}

.bar-value {
  fill: rgba(255, 255, 255, 0.9);
  font-size: 8px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 480px) {
  .net-income-card {
    padding: 12px;
  }
}
</style>
