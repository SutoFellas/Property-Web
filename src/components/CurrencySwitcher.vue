<template>
  <div class="currency-switcher">
    <button 
      v-for="currency in currencies" 
      :key="currency"
      @click="setCurrency(currency)"
      class="currency-btn"
      :class="{ active: selectedCurrency === currency }"
    >
      {{ currency }}
    </button>
  </div>
</template>

<script setup>
import { useListingsStore } from '../store/listings'
import { storeToRefs } from 'pinia'

const listingsStore = useListingsStore()
const { selectedCurrency, currencies } = storeToRefs(listingsStore)

function setCurrency(currency) {
  listingsStore.setCurrency(currency)
}
</script>

<style scoped>
.currency-switcher {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  width: 100%;
  max-width: 220px;
}
.currency-btn {
  background: #404040;
  color: #fff;
  border: 1px solid #b08d57;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
  width: 100%;
}
.currency-btn.active {
  background: #b08d57;
  color: #181818;
  border-color: #b08d57;
}
.currency-btn:hover:not(.active) {
  background: #232323;
  color: #b08d57;
}
@media (max-width: 600px) {
  .currency-switcher {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.3rem;
    max-width: 100%;
  }
  .currency-btn {
    font-size: 0.98rem;
    padding: 0.4rem 0.8rem;
  }
}
</style> 