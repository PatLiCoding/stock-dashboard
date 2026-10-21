<script setup lang="ts">
/**
 * @file DonutChart.vue
 * Renders an SVG donut chart showcasing the TTM revenue breakdown for the Magnificent Seven companies.
 */
import { ref, computed } from 'vue'
import BaseCard from '../layout/BaseCard.vue'
import stockData from '@/assets/data/stock.json'
import type { Company } from '@/interface/interface.ts'
import { getRankColor, getRevenueRanking, getTtm } from '@/utils/stock'

// Donut geometry (viewBox units)
const SIZE = 240
const CX = SIZE / 2
const CY = SIZE / 2
const R_OUT = 112
const R_IN = 66

// Tooltip dimensions (px)
const TOOLTIP_W = 200
const TOOLTIP_H = 96
const TOOLTIP_OFFSET = 16

const companies: Company[] = stockData.companies

/**
 * Converts polar coordinates to Cartesian coordinates.
 * @param radius - Radius length
 * @param angle - Angle in radians
 * @returns Object containing x and y coordinates
 */
const polar = (radius: number, angle: number) => ({
  x: CX + radius * Math.cos(angle),
  y: CY + radius * Math.sin(angle),
})

/**
 * Generates an SVG arc path string for a donut slice.
 * @param start - Start angle in radians
 * @param end - End angle in radians
 * @returns SVG path string (`d` attribute)
 */
const arcPath = (start: number, end: number) => {
  const outerStart = polar(R_OUT, start)
  const outerEnd = polar(R_OUT, end)
  const innerEnd = polar(R_IN, end)
  const innerStart = polar(R_IN, start)
  const large = end - start > Math.PI ? 1 : 0

  return [
    `M${outerStart.x.toFixed(2)},${outerStart.y.toFixed(2)}`,
    `A${R_OUT},${R_OUT} 0 ${large} 1 ${outerEnd.x.toFixed(2)},${outerEnd.y.toFixed(2)}`,
    `L${innerEnd.x.toFixed(2)},${innerEnd.y.toFixed(2)}`,
    `A${R_IN},${R_IN} 0 ${large} 0 ${innerStart.x.toFixed(2)},${innerStart.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}

/** Ticker ranking sorted by TTM revenue descending. */
const ranking = getRevenueRanking(companies)

/** Computed donut slices mapped with calculated paths, shares, and assigned colors. */
const slices = computed(() => {
  const items = companies
    .map((c) => ({
      ticker: c.ticker,
      name: c.name,
      ttm: getTtm(c.revenue),
      latestQuarter: c.latestQuarter,
    }))
    .sort((a, b) => b.ttm - a.ttm)

  const total = items.reduce((sum, item) => sum + item.ttm, 0)
  let angle = -Math.PI / 2

  return items.map((item) => {
    const share = item.ttm / total
    const start = angle
    angle += share * 2 * Math.PI
    return {
      ...item,
      share,
      color: getRankColor(ranking, item.ticker),
      path: arcPath(start, angle),
    }
  })
})

// Hover state management
const bodyRef = ref<HTMLElement | null>(null)
const hoveredTicker = ref<string | null>(null)
const tooltipPos = ref({ left: 0, top: 0 })

/** Currently hovered slice object or null. */
const hoveredSlice = computed(
  () => slices.value.find((s) => s.ticker === hoveredTicker.value) ?? null,
)

/** Clamps a number between a minimum and maximum boundary. */
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/**
 * Handles mouse movement over the chart container to calculate tooltip placement.
 * @param e - Mouse event instance
 */
const onMove = (e: MouseEvent) => {
  const body = bodyRef.value
  if (!body) return
  const rect = body.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top

  // Position tooltip near the mouse while keeping it within the card boundaries
  const flip = mx + TOOLTIP_OFFSET + TOOLTIP_W > rect.width
  const left = flip ? mx - TOOLTIP_OFFSET - TOOLTIP_W : mx + TOOLTIP_OFFSET
  tooltipPos.value = {
    left: clamp(left, 0, Math.max(0, rect.width - TOOLTIP_W)),
    top: clamp(my - TOOLTIP_H / 2, 0, Math.max(0, rect.height - TOOLTIP_H)),
  }
}
</script>

<template>
  <BaseCard class="breakdown-card">
    <h2 class="title">Revenue Breakdown Magnificent Seven</h2>

    <div ref="bodyRef" class="chart-body" @mousemove="onMove">
      <svg
        class="donut"
        :viewBox="`0 0 ${SIZE} ${SIZE}`"
        role="img"
        aria-label="Share of TTM revenue per company"
      >
        <path
          v-for="s in slices"
          :key="s.ticker"
          :d="s.path"
          :fill="s.color"
          class="slice"
          :class="{ dimmed: hoveredTicker !== null && hoveredTicker !== s.ticker }"
          @mouseenter="hoveredTicker = s.ticker"
          @mouseleave="hoveredTicker = null"
        />
      </svg>

      <ul class="legend">
        <li v-for="s in slices" :key="s.ticker">
          <span class="swatch" :style="{ backgroundColor: s.color }"></span>
          {{ s.name }}
        </li>
      </ul>

      <div
        v-if="hoveredSlice"
        class="tooltip"
        :style="{
          left: `${tooltipPos.left}px`,
          top: `${tooltipPos.top}px`,
          width: `${TOOLTIP_W}px`,
        }"
      >
        <p class="tooltip-title">
          <span class="swatch" :style="{ backgroundColor: hoveredSlice.color }"></span>
          {{ hoveredSlice.name }}
        </p>
        <p class="tooltip-row">
          <span>TTM revenue</span>
          <strong>{{ hoveredSlice.ttm.toFixed(2) }}</strong>
        </p>
        <p class="tooltip-row">
          <span>Latest quarter</span>
          <strong>{{ hoveredSlice.latestQuarter }}</strong>
        </p>
        <p class="tooltip-row">
          <span>Share</span>
          <strong>{{ (hoveredSlice.share * 100).toFixed(1) }} %</strong>
        </p>
      </div>
    </div>

    <p class="unit">In Billion USD TTM</p>
  </BaseCard>
</template>

<style scoped>
.breakdown-card {
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
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 32px;
}

.donut {
  flex: none;
  width: 100%;
  max-width: 260px;
  height: auto;
}

.slice {
  stroke: #ffffff;
  stroke-width: 1.5;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.slice.dimmed {
  opacity: 0.45;
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

.unit {
  margin: 0;
  align-self: flex-end;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}
</style>
