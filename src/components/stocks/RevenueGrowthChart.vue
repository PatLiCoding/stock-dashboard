<script setup lang="ts">
/**
 * @file RevenueGrowthChart.vue
 * Grouped vertical bar chart comparing YoY Revenue Growth across quarters for each company.
 */
import { computed } from 'vue'
import BaseCard from '../layout/BaseCard.vue'
import stockData from '@/assets/data/stock.json'
import type { Company } from '@/interface/interface.ts'

const W = 400
const H = 190
const M = { top: 8, right: 82, bottom: 28, left: 25 }

const plotW = W - M.left - M.right
const plotH = H - M.top - M.bottom

const yMax = computed(() => {
  const maxGrowth = Math.max(0, ...companyGroups.value.flatMap((group) => group.growths))
  return Math.max(10, Math.ceil(maxGrowth / 10) * 10)
})

const yTicks = computed(() => {
  const max = yMax.value
  const step = Math.ceil(max / 5 / 10) * 10
  const ticks = []
  for (let i = 0; i <= max; i += step) {
    ticks.push(i)
  }
  if (ticks[ticks.length - 1] !== max) {
    ticks.push(max)
  }
  return ticks
})

const quarters = ['Q1 2024', 'Q4 2023', 'Q3 2023', 'Q2 2023']
const quarterColors = ['#39daff', '#2fc3ea', '#2490b4', '#16546e']

// Reihenfolge wie im Zielbild: Apple, Microsoft, Amazon, Alphabet, Meta, Tesla, Nvidia
const order = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NVDA']
const companies: Company[] = stockData.companies

const companyGroups = computed(() => {
  return [...companies]
    .sort((a, b) => order.indexOf(a.ticker) - order.indexOf(b.ticker))
    .map((c) => {
      const growths = [0, 1, 2, 3].map((offset) => {
        const idx = c.revenue.length - 1 - offset
        const current = c.revenue[idx] ?? 0
        const prevYear = c.revenue[idx - 4] ?? current
        return prevYear !== 0 ? ((current - prevYear) / prevYear) * 100 : 0
      })

      return {
        ticker: c.ticker,
        name: c.name,
        growths,
      }
    })
})

const groupCount = companyGroups.value.length
const groupWidth = plotW / groupCount
const barWidth = 6

const yPos = (v: number) => M.top + plotH - (Math.max(0, v) / yMax.value) * plotH
</script>

<template>
  <BaseCard class="growth-chart-card">
    <h2 class="title">Revenue Growth in % YoY</h2>

    <div class="chart-body">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Revenue Growth YoY grouped bar chart"
      >
        <!-- Grid lines + Y labels -->
        <g>
          <template v-for="t in yTicks" :key="t">
            <line :x1="M.left" :x2="M.left + plotW" :y1="yPos(t)" :y2="yPos(t)" class="grid" />
            <text :x="M.left - 8" :y="yPos(t) + 4" text-anchor="end" class="axis-label">
              {{ t }}
            </text>
          </template>
        </g>

        <!-- Grouped Bars per Company -->
        <g v-for="(group, gIdx) in companyGroups" :key="group.ticker">
          <g v-for="(val, qIdx) in group.growths" :key="`${group.ticker}-${qIdx}`">
            <rect
              :x="M.left + gIdx * groupWidth + qIdx * (barWidth + 1) + 4"
              :y="yPos(val)"
              :width="barWidth"
              :height="Math.max(0, M.top + plotH - yPos(val))"
              :fill="quarterColors[qIdx]"
              class="bar"
            />
          </g>

          <!-- Company X Label -->
          <text
            :x="M.left + gIdx * groupWidth + groupWidth / 2"
            :y="M.top + plotH + 18"
            text-anchor="middle"
            class="axis-label company-x-label"
          >
            {{ group.name }}
          </text>
        </g>

        <!-- Legende rechts unten direkt im SVG (exakt wie in Bild 2) -->
        <g :transform="`translate(${W - M.right + 12}, ${H - M.bottom - 70})`">
          <g v-for="(q, i) in quarters" :key="q" :transform="`translate(0, ${i * 18})`">
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
            <text x="30" y="9" class="legend-text">{{ q }}</text>
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
  gap: 10px;
  padding: 16px;
  min-width: 0;
  flex: 1.8;
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

.company-x-label {
  font-size: 7px;
}

.bar {
  rx: 1;
}

.legend-text {
  fill: rgba(255, 255, 255, 0.85);
  font-size: 8px;
  font-family: sans-serif;
}

@media (max-width: 480px) {
  .growth-chart-card {
    padding: 12px;
  }
}
</style>
