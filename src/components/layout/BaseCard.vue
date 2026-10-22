<script setup lang="ts">
/**
 * @file BaseCard.vue
 * Reusable wrapper container component providing standard background styling and rounded corners for content cards.
 */
</script>

<template>
  <div class="BaseCard">
    <slot />
  </div>
</template>

<style scoped>
.BaseCard {
  box-sizing: border-box;
  border-radius: 16px;
  background-color: #011f35;
}
</style>
