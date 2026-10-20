<script setup lang="ts"></script>

<template>
  <header class="header">
    <img src="@/assets/icon/blue-bar.png" alt="Blue bar" />
    <h1 id="heading">The Magnificent Seven Companies</h1>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 24px;
}

img {
  width: 96px;
  height: 32px;
  object-fit: contain;
}

#heading {
  font-family: Rubik, sans-serif;
  font-weight: 500;
  font-style: Medium;
  font-size: 36px;
  line-height: 100%;
  letter-spacing: 0%;
  color: white;
}
</style>
