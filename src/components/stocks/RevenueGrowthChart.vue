<script setup lang="ts">
/**
 * @file RevenueGrowthChart.vue
 * Renders a responsive grouped vertical bar chart comparing the YoY revenue growth (in %)
 * of the last four reported quarters for each of the Magnificent Seven.
 * On narrow containers the legend moves below the plot and company names become tickers.
 */
import { ref, computed } from 'vue'
import BaseCard from '../layout/BaseCard.vue'
import stockData from '@/assets/data/stock.json'
import type { Company } from '@/interface/interface.ts'
import { getNiceScale, DEFAULT_COLOR } from '@/utils/stock'
import { useElementWidth } from '@/composables/useElementWidth'

// Chart geometry (1 viewBox unit = 1 px, width follows the container)
const MIN_W = 280
const TOP = 6
const LEFT = 30
const PLOT_H = 180
const BASE_H = TOP + PLOT_H + 24

/** Below this width the legend moves from the right side to below the plot. */
const LEGEND_BELOW_W = 400
const LEGEND_ROW_H = 18
const LEGEND_COL_W = 66
/** Below this group width the company ticker is shown instead of the full name. */
const TICKER_BELOW_GROUP_W = 48
/** Maximum width of a single bar. */
const MAX_BAR_W = 10

const bodyRef = ref<HTMLElement | null>(null)
const bodyWidth = useElementWidth(bodyRef, 454)
const W = computed(() => Math.max(bodyWidth.value, MIN_W))

const legendBelow = computed(() => W.value < LEGEND_BELOW_W)
const right = computed(() => (legendBelow.value ? 8 : 84))
const H = computed(() => BASE_H + (legendBelow.value ? 34 : 0))
const plotW = computed(() => W.value - LEFT - right.value)

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

const groupW = computed(() => plotW.value / companies.length)
const barW = computed(() => Math.min(MAX_BAR_W, (groupW.value * 0.8) / quarters.length))
const groupInnerW = computed(() => barW.value * quarters.length)
const useTicker = computed(() => groupW.value < TICKER_BELOW_GROUP_W)

const yPos = (v: number) =>
  TOP + ((scale.value.max - v) / (scale.value.max - scale.value.min)) * PLOT_H

/** Baseline (value 0) – bars grow up for positive and down for negative values. */
const y0 = computed(() => yPos(0))
const barTop = (v: number) => Math.min(yPos(v), y0.value)
const barHeight = (v: number) => Math.abs(yPos(v) - y0.value)

const barX = (groupIdx: number, barIdx: number) =>
  LEFT + groupIdx * groupW.value + (groupW.value - groupInnerW.value) / 2 + barIdx * barW.value

const legendHeight = quarters.length * LEGEND_ROW_H - 8

/** Legend origin: right of the plot (vertically centered) or below it on narrow containers. */
const legendOrigin = computed(() =>
  legendBelow.value
    ? { x: LEFT, y: TOP + PLOT_H + 24 }
    : { x: W.value - right.value + 14, y: TOP + PLOT_H / 2 - legendHeight / 2 },
)

/** Position of a legend entry relative to the legend origin. */
const legendItem = (i: number) =>
  legendBelow.value ? { x: i * LEGEND_COL_W, y: 0 } : { x: 0, y: i * LEGEND_ROW_H }
</script>

<template>
  <BaseCard class="growth-chart-card">
    <h2 class="title">Revenue Growth in % YoY</h2>

    <div ref="bodyRef" class="chart-body">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Year-over-year revenue growth of the last four quarters per company"
      >
        <!-- Horizontal grid lines + Y labels -->
        <g>
          <template v-for="t in scale.ticks" :key="t">
            <line :x1="LEFT" :x2="LEFT + plotW" :y1="yPos(t)" :y2="yPos(t)" class="grid" />
            <text :x="LEFT - 6" :y="yPos(t)" text-anchor="end" class="axis-label label-mid">
              {{ t }}
            </text>
          </template>
          <!-- Left axis -->
          <line :x1="LEFT" :x2="LEFT" :y1="TOP" :y2="TOP + PLOT_H" class="axis-line" />
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
            :x="LEFT + gIdx * groupW + groupW / 2"
            :y="TOP + PLOT_H + 15"
            text-anchor="middle"
            class="axis-label"
          >
            {{ useTicker ? group.ticker : group.name }}
          </text>
        </g>

        <!-- Baseline on top of the bars -->
        <line :x1="LEFT" :x2="LEFT + plotW" :y1="y0" :y2="y0" class="axis-line" />

        <!-- Legend -->
        <g :transform="`translate(${legendOrigin.x}, ${legendOrigin.y})`">
          <g
            v-for="(q, i) in quarters"
            :key="q"
            :transform="`translate(${legendItem(i).x}, ${legendItem(i).y})`"
          >
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
