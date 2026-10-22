<script setup lang="ts">
/**
 * @file NetIncomeChart.vue
 * Renders a horizontal bar chart displaying Net Income TTM (in Billion USD) for the Magnificent Seven.
 */
import { computed } from 'vue'
import BaseCard from '../layout/BaseCard.vue'
import stockData from '@/assets/data/stock.json'
import type { Company } from '@/interface/interface.ts'
import { getTtm, getNiceScale, BLUE_SHADES, DEFAULT_COLOR } from '@/utils/stock'

// Chart geometry (viewBox units ≈ px in the 1440px layout)
const W = 354
const H = 210
const M = { top: 6, right: 8, bottom: 24, left: 62 }
const plotW = W - M.left - M.right
const plotH = H - M.top - M.bottom

/** Share of a row's height that is covered by the bar. */
const BAR_RATIO = 0.74

const companies: Company[] = stockData.companies

/** Companies sorted by TTM net income (descending), colored from light to dark blue. */
const chartItems = computed(() =>
  companies
    .map((c) => ({
      ticker: c.ticker,
      name: c.name,
      value: getTtm(c.netIncome),
    }))
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      ...item,
      color: BLUE_SHADES[index] ?? DEFAULT_COLOR,
    })),
)

/** X scale (with a little headroom so the value label always fits inside the frame). */
const scale = computed(() =>
  getNiceScale(0, Math.max(...chartItems.value.map((i) => i.value)) * 1.1),
)

const rowCount = companies.length
const rowH = plotH / rowCount
const barH = rowH * BAR_RATIO

/** Y positions of the horizontal grid lines (one between every row + top/bottom frame). */
const rowLines = Array.from({ length: rowCount + 1 }, (_, i) => M.top + i * rowH)

const xPos = (v: number) => M.left + (Math.max(0, v) / scale.value.max) * plotW
const barY = (index: number) => M.top + index * rowH + (rowH - barH) / 2
</script>

<template>
  <BaseCard class="net-income-card">
    <h2 class="title">Net Income TTM</h2>

    <div class="chart-body">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Net Income TTM in billion USD per company"
      >
        <!-- Grid: horizontal row lines + vertical tick lines + X labels -->
        <g>
          <line
            v-for="y in rowLines"
            :key="`row-${y}`"
            :x1="M.left"
            :x2="M.left + plotW"
            :y1="y"
            :y2="y"
            class="grid"
          />
          <template v-for="t in scale.ticks" :key="t">
            <line :x1="xPos(t)" :x2="xPos(t)" :y1="M.top" :y2="M.top + plotH" class="grid" />
            <text :x="xPos(t)" :y="M.top + plotH + 15" text-anchor="middle" class="axis-label">
              {{ t }}
            </text>
          </template>
        </g>

        <!-- Bars, company labels & values -->
        <g v-for="(item, i) in chartItems" :key="item.ticker">
          <text
            :x="M.left - 8"
            :y="barY(i) + barH / 2"
            text-anchor="end"
            class="axis-label label-mid"
          >
            {{ item.name }}
          </text>

          <rect
            :x="M.left"
            :y="barY(i)"
            :width="xPos(item.value) - M.left"
            :height="barH"
            :fill="item.color"
            class="bar"
          />

          <text :x="xPos(item.value) + 6" :y="barY(i) + barH / 2" class="bar-value label-mid">
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
  gap: 16px;
  padding: 20px;
  min-width: 0;
  flex: 1.34;
}

.title {
  margin: 0;
  font-family: Rubik, sans-serif;
  font-weight: 600;
  font-size: 20px;
  color: #ffffff;
}

.chart-body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

svg {
  display: block;
  width: 100%;
  height: auto;
}

.grid {
  stroke: rgba(255, 255, 255, 0.22);
  stroke-width: 1;
}

.axis-label {
  fill: rgba(255, 255, 255, 0.75);
  font-size: 8.5px;
}

.label-mid {
  dominant-baseline: central;
}

.bar {
  stroke: #ffffff;
  stroke-width: 1;
  rx: 1;
}

.bar-value {
  fill: rgba(255, 255, 255, 0.9);
  font-size: 8.5px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
</style>
