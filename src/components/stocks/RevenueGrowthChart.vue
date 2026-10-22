<script setup lang="ts">
/**
 * @file RevenueGrowthChart.vue
 * Renders a grouped vertical bar chart comparing the YoY revenue growth (in %)
 * of the last four reported quarters for each of the Magnificent Seven.
 */
import { computed } from 'vue'
import BaseCard from '../layout/BaseCard.vue'
import stockData from '@/assets/data/stock.json'
import type { Company } from '@/interface/interface.ts'
import { getNiceScale, DEFAULT_COLOR } from '@/utils/stock'

// Chart geometry (viewBox units ≈ px in the 1440px layout)
const W = 454
const H = 210
const M = { top: 6, right: 84, bottom: 24, left: 30 }
const plotW = W - M.left - M.right
const plotH = H - M.top - M.bottom

/** Maximum width of a single bar. */
const MAX_BAR_W = 10

/** Legend order: newest quarter first (Q1 2024 ... Q2 2023). */
const quarters = stockData.quarters.slice(-4).reverse()

/**
 * Bar colors in legend order (index 0 = newest quarter).
 * Newest = lightest, oldest = darkest, as in the design mock-up.
 */
const quarterColors = ['#39daff', '#2fc3ea', '#2490b4', '#16546e']

/** Company order as in the design: Apple, Microsoft, Amazon, Alphabet, Meta, Tesla, Nvidia. */
const order = ['AAPL', 'MSFT', 'AMZN', 'GOOG', 'META', 'TSLA', 'NVDA']

const companies: Company[] = stockData.companies

/** Per company: four bars in chronological order (oldest left, newest right). */
const companyGroups = computed(() =>
  [...companies]
    .sort((a, b) => order.indexOf(a.ticker) - order.indexOf(b.ticker))
    .map((c) => {
      const bars = quarters.map((quarter, offset) => {
        const idx = c.revenue.length - 1 - offset
        const current = c.revenue[idx] ?? 0
        const prevYear = c.revenue[idx - 4] ?? 0
        const growth = prevYear !== 0 ? ((current - prevYear) / prevYear) * 100 : 0
        return { quarter, value: growth, color: quarterColors[offset] ?? DEFAULT_COLOR }
      })
      return { ticker: c.ticker, name: c.name, bars: bars.reverse() }
    }),
)

/** Y scale – includes negative growth (e.g. Tesla) if present. */
const scale = computed(() => {
  const values = companyGroups.value.flatMap((g) => g.bars.map((b) => b.value))
  return getNiceScale(Math.min(...values), Math.max(...values), 6)
})

const groupW = plotW / companies.length
const barW = Math.min(MAX_BAR_W, (groupW * 0.8) / quarters.length)
const groupInnerW = barW * quarters.length

const yPos = (v: number) =>
  M.top + ((scale.value.max - v) / (scale.value.max - scale.value.min)) * plotH

/** Baseline (value 0) – bars grow up for positive and down for negative values. */
const y0 = computed(() => yPos(0))
const barTop = (v: number) => Math.min(yPos(v), y0.value)
const barHeight = (v: number) => Math.abs(yPos(v) - y0.value)

const barX = (groupIdx: number, barIdx: number) =>
  M.left + groupIdx * groupW + (groupW - groupInnerW) / 2 + barIdx * barW

const LEGEND_ROW_H = 18
const legendHeight = quarters.length * LEGEND_ROW_H - 8
</script>

<template>
  <BaseCard class="growth-chart-card">
    <h2 class="title">Revenue Growth in % YoY</h2>

    <div class="chart-body">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Year-over-year revenue growth of the last four quarters per company"
      >
        <!-- Horizontal grid lines + Y labels -->
        <g>
          <template v-for="t in scale.ticks" :key="t">
            <line :x1="M.left" :x2="M.left + plotW" :y1="yPos(t)" :y2="yPos(t)" class="grid" />
            <text :x="M.left - 6" :y="yPos(t)" text-anchor="end" class="axis-label label-mid">
              {{ t }}
            </text>
          </template>
          <!-- Left axis -->
          <line :x1="M.left" :x2="M.left" :y1="M.top" :y2="M.top + plotH" class="axis-line" />
        </g>

        <!-- Grouped bars per company -->
        <g v-for="(group, gIdx) in companyGroups" :key="group.ticker">
          <rect
            v-for="(bar, bIdx) in group.bars"
            :key="`${group.ticker}-${bar.quarter}`"
            :x="barX(gIdx, bIdx)"
            :y="barTop(bar.value)"
            :width="barW"
            :height="barHeight(bar.value)"
            :fill="bar.color"
            class="bar"
          />

          <text
            :x="M.left + gIdx * groupW + groupW / 2"
            :y="M.top + plotH + 15"
            text-anchor="middle"
            class="axis-label"
          >
            {{ group.name }}
          </text>
        </g>

        <!-- Baseline on top of the bars -->
        <line :x1="M.left" :x2="M.left + plotW" :y1="y0" :y2="y0" class="axis-line" />

        <!-- Legend (vertically centered at the right) -->
        <g :transform="`translate(${W - M.right + 14}, ${M.top + plotH / 2 - legendHeight / 2})`">
          <g v-for="(q, i) in quarters" :key="q" :transform="`translate(0, ${i * LEGEND_ROW_H})`">
            <rect
              x="0"
              y="0"
              width="24"
              height="10"
              :fill="quarterColors[i]"
              stroke="#ffffff"
              stroke-width="1"
              rx="1"
            />
            <text x="30" y="5" class="legend-text label-mid">{{ q }}</text>
          </g>
        </g>
      </svg>
    </div>
  </BaseCard>
</template>

<style scoped>
.growth-chart-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  min-width: 0;
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

.axis-line {
  stroke: rgba(255, 255, 255, 0.6);
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
  stroke-width: 0.75;
}

.legend-text {
  fill: rgba(255, 255, 255, 0.85);
  font-size: 8.5px;
}
</style>
