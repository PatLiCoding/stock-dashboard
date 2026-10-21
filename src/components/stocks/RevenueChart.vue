<script setup lang="ts">
/**
 * @file LineChart.vue
 * Renders a multi-line SVG chart displaying the quarterly revenue of the Magnificent Seven over the last 3 years.
 */
import { ref, computed } from 'vue'
import BaseCard from '../layout/BaseCard.vue'
import stockData from '@/assets/data/stock.json'
import type { Company } from '@/interface/interface.ts'
import { getRankColor, getRevenueRanking } from '@/utils/stock'

/** Number of quarters to display (Last 3 years = Q1 2021 ... Q4 2023). */
const QUARTER_COUNT = 12

// Chart geometry (viewBox units, SVG scales responsively)
const W = 520
const H = 280
const M = { top: 12, right: 12, bottom: 56, left: 36 }
const plotW = W - M.left - M.right
const plotH = H - M.top - M.bottom
const stepX = plotW / (QUARTER_COUNT - 1)

// Tooltip dimensions (px)
const TOOLTIP_W = 200
const TOOLTIP_H = 220
const TOOLTIP_OFFSET = 16

const companies: Company[] = stockData.companies
const quarters = stockData.quarters.slice(0, QUARTER_COUNT)

/** Order (legend) and color by TTM revenue, descending – identical to the donut chart. */
const ranking = getRevenueRanking(companies)

/** Computed series data containing formatted company lines, colors, and sliced values. */
const series = computed(() =>
  companies
    .map((c) => ({
      ticker: c.ticker,
      name: c.name,
      color: getRankColor(ranking, c.ticker),
      values: c.revenue.slice(0, QUARTER_COUNT),
    }))
    .sort((a, b) => ranking.indexOf(a.ticker) - ranking.indexOf(b.ticker)),
)

/** Y-axis maximum value: rounded up to the next multiple of 30. */
const yMax = computed(() => {
  const max = Math.max(...series.value.flatMap((s) => s.values))
  return Math.ceil(max / 30) * 30
})

/** Array of Y-axis grid tick values. */
const yTicks = computed(() => {
  const ticks: number[] = []
  for (let v = 0; v <= yMax.value; v += 30) ticks.push(v)
  return ticks
})

/** Calculates the X position for a given quarter index. */
const xPos = (i: number) => M.left + i * stepX

/** Calculates the Y position for a given revenue value. */
const yPos = (v: number) => M.top + plotH - (v / yMax.value) * plotH

/** Generates the SVG path string for a line series. */
const linePath = (values: number[]) =>
  values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(v).toFixed(1)}`)
    .join(' ')

// Hover state management
const plotRef = ref<HTMLElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const hoverIndex = ref<number | null>(null)
const tooltipPos = ref({ left: 0, top: 0 })

/** Clamps a number between a minimum and maximum boundary. */
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/**
 * Handles mouse movement over the plot area to update the active hover index and tooltip position.
 * @param e - Mouse event instance
 */
const onMove = (e: MouseEvent) => {
  const wrapper = plotRef.value
  const svg = svgRef.value
  if (!wrapper || !svg) return

  const wr = wrapper.getBoundingClientRect()
  const sr = svg.getBoundingClientRect()

  // Determine the nearest quarter on the X-axis
  const xInView = ((e.clientX - sr.left) / sr.width) * W
  hoverIndex.value = clamp(Math.round((xInView - M.left) / stepX), 0, QUARTER_COUNT - 1)

  // Position tooltip near the mouse while keeping it within the chart area
  const mx = e.clientX - wr.left
  const my = e.clientY - wr.top
  const flip = mx + TOOLTIP_OFFSET + TOOLTIP_W > wr.width
  tooltipPos.value = {
    left: flip ? mx - TOOLTIP_OFFSET - TOOLTIP_W : mx + TOOLTIP_OFFSET,
    top: clamp(my - TOOLTIP_H / 2, 0, Math.max(0, wr.height - TOOLTIP_H)),
  }
}

/** Resets the hover state when the mouse leaves the plot area. */
const onLeave = () => {
  hoverIndex.value = null
}

/** Computed rows for the active tooltip sorted by value descending. */
const tooltipRows = computed(() => {
  const i = hoverIndex.value
  if (i === null) return []
  return series.value
    .map((s) => ({ ticker: s.ticker, name: s.name, color: s.color, value: s.values[i] ?? 0 }))
    .sort((a, b) => b.value - a.value)
})
</script>

<template>
  <BaseCard class="chart-card">
    <h2 class="title">Revenue last 3 years</h2>

    <div class="chart-body">
      <div
        ref="plotRef"
        class="plot"
        @mouseenter="onMove"
        @mousemove="onMove"
        @mouseleave="onLeave"
      >
        <svg
          ref="svgRef"
          :viewBox="`0 0 ${W} ${H}`"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Revenue of the seven companies from Q1 2021 to Q4 2023"
        >
          <!-- Horizontal grid lines + Y-axis labels -->
          <g>
            <template v-for="t in yTicks" :key="t">
              <line :x1="M.left" :x2="W - M.right" :y1="yPos(t)" :y2="yPos(t)" class="grid" />
              <text :x="M.left - 8" :y="yPos(t) + 4" text-anchor="end" class="axis-label">
                {{ t }}
              </text>
            </template>
          </g>

          <!-- Vertical grid lines + X-axis labels -->
          <g>
            <template v-for="(q, i) in quarters" :key="q">
              <line :x1="xPos(i)" :x2="xPos(i)" :y1="M.top" :y2="M.top + plotH" class="grid" />
              <text
                :x="xPos(i)"
                :y="M.top + plotH + 16"
                text-anchor="end"
                class="axis-label"
                :transform="`rotate(-40 ${xPos(i)} ${M.top + plotH + 16})`"
              >
                {{ q }}
              </text>
            </template>
          </g>

          <!-- Hover helper line -->
          <line
            v-if="hoverIndex !== null"
            :x1="xPos(hoverIndex)"
            :x2="xPos(hoverIndex)"
            :y1="M.top"
            :y2="M.top + plotH"
            class="hover-line"
          />

          <!-- Lines for the 7 companies -->
          <path
            v-for="s in series"
            :key="s.ticker"
            :d="linePath(s.values)"
            :stroke="s.color"
            class="line"
          />

          <!-- Data points at the nearest quarter -->
          <template v-if="hoverIndex !== null">
            <circle
              v-for="s in series"
              :key="`dot-${s.ticker}`"
              :cx="xPos(hoverIndex)"
              :cy="yPos(s.values[hoverIndex] ?? 0)"
              r="4"
              :fill="s.color"
              class="dot"
            />
          </template>
        </svg>

        <!-- Tooltip -->
        <div
          v-if="hoverIndex !== null"
          class="tooltip"
          :style="{
            left: `${tooltipPos.left}px`,
            top: `${tooltipPos.top}px`,
            width: `${TOOLTIP_W}px`,
          }"
        >
          <p class="tooltip-title">{{ quarters[hoverIndex] }}</p>
          <ul>
            <li v-for="row in tooltipRows" :key="row.ticker">
              <span class="swatch" :style="{ backgroundColor: row.color }"></span>
              <span class="tooltip-name">{{ row.name }}</span>
              <span class="tooltip-value">{{ row.value.toFixed(2) }}</span>
            </li>
          </ul>
          <p class="tooltip-unit">In Bill USD</p>
        </div>
      </div>

      <!-- Legend -->
      <ul class="legend">
        <li v-for="s in series" :key="s.ticker">
          <span class="swatch" :style="{ backgroundColor: s.color }"></span>
          {{ s.name }}
        </li>
      </ul>
    </div>
  </BaseCard>
</template>

<style scoped>
.chart-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 32px;
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
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.plot {
  position: relative;
  flex: 1;
  min-width: 0;
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
  font-size: 11px;
}

.line {
  fill: none;
  stroke-width: 1.75;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.hover-line {
  stroke: rgba(255, 255, 255, 0.6);
  stroke-width: 1;
  stroke-dasharray: 4 3;
}

.dot {
  stroke: #ffffff;
  stroke-width: 1.5;
}

.tooltip {
  position: absolute;
  z-index: 5;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid rgba(57, 218, 255, 0.45);
  border-radius: 12px;
  background-color: #020f1b;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.tooltip-title {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
}

.tooltip ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.tooltip-name {
  flex: 1;
  color: rgba(255, 255, 255, 0.85);
}

.tooltip-value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #ffffff;
}

.tooltip-unit {
  margin: 8px 0 0;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}

.legend {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}

.legend li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend .swatch {
  width: 32px;
  height: 12px;
  border: 1px solid #ffffff;
  border-radius: 2px;
}
</style>
