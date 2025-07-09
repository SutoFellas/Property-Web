import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useListingsStore = defineStore('listings', () => {
  // State - boş başlıyor, Firebase'den dolacak
  const listings = ref([])

  // Currency state
  const selectedCurrency = ref('TRY')
  const currencyRates = ref({
    TRY: 1,
    USD: 0.031,
    EUR: 0.029,
    GBP: 0.025
  })
  const currencies = ref(['TRY', 'USD', 'EUR', 'GBP'])

  // Getters
  const getListings = computed(() => listings.value)
  
  const getFilteredListings = computed(() => {
    return (category = 'all', type = 'all') => {
      return listings.value.filter(listing => {
        const categoryMatch = category === 'all' || listing.category === category
        const typeMatch = type === 'all' || listing.transactionType === type
        return categoryMatch && typeMatch
      })
    }
  })

  const getListingById = computed(() => {
    return (id) => listings.value.find(listing => listing.id === id)
  })

  // Actions
  const addListing = (listing) => {
    const newListing = {
      id: Date.now(),
      ...listing,
      type: listing.transactionType === 'sale' ? 'Satılık' : 'Kiralık',
      createdAt: Date.now()
    }
    listings.value.push(newListing)
    return newListing
  }

  const updateListing = (id, updatedListing) => {
    const index = listings.value.findIndex(listing => listing.id === id)
    if (index !== -1) {
      listings.value[index] = { ...listings.value[index], ...updatedListing }
      return listings.value[index]
    }
    return null
  }

  const deleteListing = (id) => {
    const index = listings.value.findIndex(listing => listing.id === id)
    if (index !== -1) {
      listings.value.splice(index, 1)
      return true
    }
    return false
  }

  const updatePrice = (id, newPrice) => {
    const listing = listings.value.find(l => l.id === id)
    if (listing) {
      listing.price = newPrice
      return true
    }
    return false
  }

  const setCurrency = (currency) => {
    selectedCurrency.value = currency
  }

  const updateCurrencyRates = (rates) => {
    currencyRates.value = { ...currencyRates.value, ...rates }
  }

  const setListings = (newListings) => {
    listings.value = newListings
  }

  return {
    // State
    listings,
    selectedCurrency,
    currencyRates,
    currencies,
    
    // Getters
    getListings,
    getFilteredListings,
    getListingById,
    
    // Actions
    addListing,
    updateListing,
    deleteListing,
    updatePrice,
    setCurrency,
    updateCurrencyRates,
    setListings
  }
}) 