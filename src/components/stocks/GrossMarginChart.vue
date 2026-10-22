<script setup lang="ts">
/**
 * @file GrossMarginChart.vue
 * Renders a horizontal bar chart for the gross margin (in %) of the last reported quarter.
 * On hover a tooltip shows the quarter the value originates from.
 */
import { ref, computed } from 'vue'
import BaseCard from '../layout/BaseCard.vue'
import stockData from '@/assets/data/stock.json'
import type { Company } from '@/interface/interface.ts'
import { BLUE_SHADES, DEFAULT_COLOR } from '@/utils/stock'

// Chart geometry (viewBox units ≈ px in the 1440px layout)
const W = 255
const H = 210
const M = { top: 6, right: 8, bottom: 24, left: 58 }
const plotW = W - M.left - M.right
const plotH = H - M.top - M.bottom

/** Share of a row's height that is covered by the bar. */
const BAR_RATIO = 0.74

/** Gross margin is a percentage, so the axis is fixed to 0–100 %. */
const X_MAX = 100
const xTicks = [0, 20, 40, 60, 80, 100]

// Tooltip dimensions (px)
const TOOLTIP_W = 160
const TOOLTIP_H = 80
const TOOLTIP_OFFSET = 14

const companies: Company[] = stockData.companies

/** Companies sorted by last reported gross margin (descending), colored from light to dark blue. */
const chartItems = computed(() =>
  companies
    .map((c) => ({
      ticker: c.ticker,
      name: c.name,
      value: c.grossMargin.at(-1) ?? 0,
      latestQuarter: c.latestQuarter,
    }))
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      ...item,
      color: BLUE_SHADES[index] ?? DEFAULT_COLOR,
    })),
)

const rowCount = companies.length
const rowH = plotH / rowCount
const barH = rowH * BAR_RATIO

/** Y positions of the horizontal grid lines (one between every row + top/bottom frame). */
const rowLines = Array.from({ length: rowCount + 1 }, (_, i) => M.top + i * rowH)

const xPos = (v: number) => M.left + (Math.max(0, v) / X_MAX) * plotW
const rowY = (index: number) => M.top + index * rowH
const barY = (index: number) => rowY(index) + (rowH - barH) / 2

// Hover state management
const bodyRef = ref<HTMLElement | null>(null)
const hoveredTicker = ref<string | null>(null)
const tooltipPos = ref({ left: 0, top: 0 })

/** Currently hovered item or null. */
const hoveredItem = computed(
  () => chartItems.value.find((i) => i.ticker === hoveredTicker.value) ?? null,
)

/** Clamps a number between a minimum and maximum boundary. */
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/**
 * Positions the tooltip next to the mouse while keeping it inside the card body.
 * @param e - Mouse event instance
 */
const onMove = (e: MouseEvent) => {
  const body = bodyRef.value
  if (!body) return
  const rect = body.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top

  const flip = mx + TOOLTIP_OFFSET + TOOLTIP_W > rect.width
  const left = flip ? mx - TOOLTIP_OFFSET - TOOLTIP_W : mx + TOOLTIP_OFFSET
  tooltipPos.value = {
    left: clamp(left, 0, Math.max(0, rect.width - TOOLTIP_W)),
    top: clamp(my - TOOLTIP_H / 2, 0, Math.max(0, rect.height - TOOLTIP_H)),
  }
}
</script>

<template>
  <BaseCard class="gross-margin-card">
    <h2 class="title">Gross Margin in % LQ</h2>

    <div ref="bodyRef" class="chart-body" @mousemove="onMove">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Gross margin in percent for the last reported quarter"
      >
        <!-- Grid: horizontal row lines + vertical tick lines -->
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
          <line
            v-for="t in xTicks"
            :key="`tick-${t}`"
            :x1="xPos(t)"
            :x2="xPos(t)"
            :y1="M.top"
            :y2="M.top + plotH"
            class="grid"
          />
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
            :class="{ dimmed: hoveredTicker !== null && hoveredTicker !== item.ticker }"
          />

          <text :x="xPos(item.value) + 6" :y="barY(i) + barH / 2" class="bar-value label-mid">
            {{ item.value.toFixed(1) }}%
          </text>

          <!-- Transparent hit area covering the whole row -->
          <rect
            :x="0"
            :y="rowY(i)"
            :width="W"
            :height="rowH"
            fill="transparent"
            class="hit"
            @mouseenter="hoveredTicker = item.ticker"
            @mouseleave="hoveredTicker = null"
          />
        </g>
      </svg>

      <div
        v-if="hoveredItem"
        class="tooltip"
        :style="{
          left: `${tooltipPos.left}px`,
          top: `${tooltipPos.top}px`,
          width: `${TOOLTIP_W}px`,
        }"
      >
        <p class="tooltip-title">
          <span class="swatch" :style="{ backgroundColor: hoveredItem.color }"></span>
          {{ hoveredItem.name }}
        </p>
        <p class="tooltip-row">
          <span>Gross margin</span>
          <strong>{{ hoveredItem.value.toFixed(1) }} %</strong>
        </p>
        <p class="tooltip-row">
          <span>Quarter</span>
          <strong>{{ hoveredItem.latestQuarter }}</strong>
        </p>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.gross-margin-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  min-width: 0;
  flex: 1;
}

.title {
  margin: 0;
  font-family: Rubik, sans-serif;
  font-weight: 600;
  font-size: 20px;
  color: #ffffff;
}

.chart-body {
  position: relative;
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
  transition: opacity 0.15s ease;
}

.bar.dimmed {
  opacity: 0.45;
}

.bar-value {
  fill: rgba(255, 255, 255, 0.9);
  font-size: 8.5px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.hit {
  cursor: pointer;
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
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
}

.tooltip-row strong {
  color: #ffffff;
  font-variant-numeric: tabular-nums;
}

.swatch {
  width: 12px;
  height: 12px;
  border: 1px solid #ffffff;
  border-radius: 2px;
}
</style>
