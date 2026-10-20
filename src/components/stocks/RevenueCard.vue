<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import BaseCard from '../layout/BaseCard.vue'
import stockData from '@/assets/data/stock.json'

const companies = ref(stockData.companies)
const scrollContainer = ref<HTMLElement | null>(null)

const canScrollLeft = ref(false)
const canScrollRight = ref(true)

const getLatestRevenue = (revenueArray: number[]) => {
  return revenueArray[revenueArray.length - 1] ?? 0
}

const checkScroll = () => {
  if (!scrollContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value

  canScrollLeft.value = scrollLeft > 5
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 5
}

const scrollLeftHandler = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -300, behavior: 'smooth' })
  }
}

const scrollRightHandler = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 300, behavior: 'smooth' })
  }
}

onMounted(() => {
  nextTick(() => {
    checkScroll()
  })
})
</script>

<template>
  <div class="revenue-carousel-wrapper">
    <button
      v-if="canScrollLeft"
      class="scroll-btn left"
      @click="scrollLeftHandler"
      aria-label="Previous"
    >
      <span>&#129128;</span>
    </button>

    <div class="RevenueCard" ref="scrollContainer" @scroll="checkScroll">
      <BaseCard v-for="company in companies" :key="company.ticker" class="stock-card">
        <div class="card-header">
          <img :src="company.logoUrl" :alt="company.name" class="logo" />
          <h3>{{ company.name }}</h3>
        </div>

        <div class="card-body">
          <p class="subtitle">Revenue {{ company.latestQuarter }}</p>
          <div class="revenue-row">
            <span class="amount">{{ getLatestRevenue(company.revenue).toFixed(2) }}</span>

            <div class="growth positive">
              <span>+1.06 ↑</span>
              <span>2.83 %</span>
            </div>
          </div>
          <p class="currency">In Bill USD</p>
        </div>
      </BaseCard>
    </div>

    <button
      v-if="canScrollRight"
      class="scroll-btn right"
      @click="scrollRightHandler"
      aria-label="Next"
    >
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
  width: 100%;
  scrollbar-width: none;
}

.RevenueCard::-webkit-scrollbar {
  display: none;
}

.stock-card {
  min-width: 140px;
  height: 127px;
  padding: 20px 24px;
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
</style>
