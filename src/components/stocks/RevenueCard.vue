<script setup lang="ts">
/**
 * @file RevenueCard.vue
 * Renders a responsive horizontal carousel displaying individual stock revenue cards for each company,
 * including latest quarterly metrics, growth indicators, and smooth scrolling controls.
 */
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import BaseCard from '../layout/BaseCard.vue'
import stockData from '@/assets/data/stock.json'
import type { Company } from '@/interface/interface.ts'
import { useElementWidth } from '@/composables/useElementWidth'

const companies: Company[] = stockData.companies
const scrollContainer = ref<HTMLElement | null>(null)
const containerWidth = useElementWidth(scrollContainer, 0)

const canScrollLeft = ref(false)
const canScrollRight = ref(true)

/**
 * Formats a numeric value with a explicit sign (+/-) and 2 decimal places.
 * @param value - The numerical value to format
 * @returns Formatted string with sign prefix
 */
const formatSigned = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}`

/** Computed list of mapped company card items with calculated revenue changes and growth states. */
const cards = computed(() =>
  companies.map((company) => {
    const latest = company.revenue.at(-1) ?? 0
    const previous = company.revenue.at(-2) ?? 0
    const absChange = latest - previous
    const pctChange = previous !== 0 ? (absChange / previous) * 100 : 0

    return {
      ticker: company.ticker,
      name: company.name,
      logoUrl: company.logoUrl,
      latestQuarter: company.latestQuarter,
      latest,
      absChange,
      pctChange,
      isPositive: absChange >= 0,
    }
  }),
)

/** Checks the scroll position of the container to toggle navigation button visibility. */
const checkScroll = () => {
  if (!scrollContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  canScrollLeft.value = scrollLeft > 5
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 5
}

/**
 * Scrolls the carousel by roughly one visible page (80 % of the container width).
 * @param direction - -1 for left, 1 for right
 */
const scrollPage = (direction: -1 | 1) => {
  const el = scrollContainer.value
  if (!el) return
  el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
}

// Re-evaluate the buttons whenever the container is resized
watch(containerWidth, () => nextTick(checkScroll))

onMounted(() => nextTick(checkScroll))
</script>

<template>
  <div class="revenue-carousel-wrapper">
    <button
      v-if="canScrollLeft"
      class="scroll-btn left"
      @click="scrollPage(-1)"
      aria-label="Previous"
    >
      <span>&#129128;</span>
    </button>

    <div class="RevenueCard" ref="scrollContainer" @scroll="checkScroll">
      <BaseCard v-for="card in cards" :key="card.ticker" class="stock-card">
        <div class="card-header">
          <img :src="card.logoUrl" :alt="card.name" class="logo" />
          <h3>{{ card.name }}</h3>
        </div>

        <div class="card-body">
          <p class="subtitle">Revenue {{ card.latestQuarter }}</p>
          <div class="revenue-row">
            <span class="amount">{{ card.latest.toFixed(2) }}</span>

            <div class="growth" :class="card.isPositive ? 'positive' : 'negative'">
              <span>{{ formatSigned(card.absChange) }} {{ card.isPositive ? '↑' : '↓' }}</span>
              <span>{{ card.pctChange.toFixed(2) }} %</span>
            </div>
          </div>
          <p class="currency">In Bill USD</p>
        </div>
      </BaseCard>
    </div>

    <button v-if="canScrollRight" class="scroll-btn right" @click="scrollPage(1)" aria-label="Next">
      <span>&#129130;</span>
    </button>
  </div>
</template>

<style scoped>
.revenue-carousel-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #023a6233;
  padding: 24px;
  border-radius: 24px;
}

.RevenueCard {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x proximity;
  width: 100%;
  scrollbar-width: none;
}

.RevenueCard::-webkit-scrollbar {
  display: none;
}

.stock-card {
  flex: none;
  min-width: 140px;
  height: 127px;
  padding: 20px 24px;
  box-sizing: border-box;
  scroll-snap-align: start;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.logo {
  width: 20px;
  height: 24px;
  object-fit: contain;
}

h3 {
  color: #ffffff;
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.subtitle {
  font-size: 12px;
  font-weight: 400;
  margin: 0 0 12px 0;
}

.revenue-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.amount {
  color: #ffffff;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
}

.growth {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.2;
}

.growth.positive {
  color: #3ba752;
}

.growth.negative {
  color: #c41c1c;
}

.currency {
  font-size: 0.6rem;
  margin-top: 14px;
  margin-bottom: 0;
}

.scroll-btn {
  position: absolute;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: #39daff;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.scroll-btn.left {
  left: -18px;
}

.scroll-btn.right {
  right: -18px;
}

/* Phone: tighter spacing, buttons stay inside the viewport */
@media (max-width: 640px) {
  .revenue-carousel-wrapper {
    padding: 16px;
    border-radius: 16px;
  }

  .RevenueCard {
    gap: 12px;
  }

  .scroll-btn {
    width: 32px;
    height: 32px;
  }

  .scroll-btn.left {
    left: 4px;
  }

  .scroll-btn.right {
    right: 4px;
  }
}
</style>
