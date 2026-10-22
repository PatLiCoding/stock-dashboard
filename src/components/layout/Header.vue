<script setup lang="ts">
/**
 * @file Header.vue
 * Application header component featuring a responsive decorative design bar and main title text.
 */
</script>

<template>
  <header class="header">
    <img src="@/assets/icon/blue-bar.png" alt="Blue bar" />
    <h1 id="heading">The Magnificent Seven Companies</h1>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  box-sizing: border-box;
  padding-right: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: clamp(12px, 2vw, 24px);
}

img {
  flex: none;
  width: clamp(48px, 8vw, 96px);
  height: 32px;
  object-fit: contain;
}

#heading {
  margin: 0;
  font-family: Rubik, sans-serif;
  font-weight: 500;
  font-size: clamp(22px, 4vw, 36px);
  line-height: 1.1;
  letter-spacing: 0;
  color: white;
}
</style>
