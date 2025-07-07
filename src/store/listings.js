import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useListingsStore = defineStore('listings', () => {
  // State
  const listings = ref([
    {
      id: 1,
      title: 'Modern 3+1 Daire',
      location: 'Kadıköy, İstanbul',
      region: 'İstanbul',
      price: 2500000,
      area: 120,
      rooms: 3,
      type: 'Satılık',
      category: 'apartment',
      propertyType: 'apartment',
      transactionType: 'sale',
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=400',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=500'
      ],
      coordinates: { lat: 40.9909, lng: 29.0303 },
      description: 'Kadıköy\'ün merkezi konumunda, yeni yapılmış modern 3+1 daire. Metro ve otobüs duraklarına yürüme mesafesinde. Asansörlü, güvenlikli site içerisinde.',
      createdAt: 1719859200000 // örnek: 2024-07-02
    },
    {
      id: 2,
      title: 'Merkezi Konumda Dükkan',
      location: 'Beşiktaş, İstanbul',
      region: 'İstanbul',
      price: 8500,
      area: 80,
      rooms: 1,
      type: 'Kiralık',
      category: 'shop',
      propertyType: 'shop',
      transactionType: 'rent',
      images: [
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400'
      ],
      coordinates: { lat: 41.0422, lng: 29.0083 },
      description: 'Beşiktaş\'ın en işlek caddesinde, yüksek ciro potansiyeli olan dükkan. Vitrin genişliği 4 metre, depo alanı mevcut.',
      createdAt: 1719772800000 // örnek: 2024-07-01
    },
    {
      id: 3,
      title: 'Bahçeli Müstakil Ev',
      location: 'Çankaya, Ankara',
      region: 'Ankara',
      price: 3500000,
      area: 200,
      rooms: 4,
      type: 'Satılık',
      category: 'house',
      propertyType: 'house',
      transactionType: 'sale',
      images: [
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=400',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=500',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=600'
      ],
      coordinates: { lat: 39.9334, lng: 32.8597 },
      description: 'Çankaya\'nın prestijli semtinde, 200m² bahçeli müstakil ev. 4 yatak odası, 2 banyo, geniş salon ve mutfak. Otopark dahil.',
      createdAt: 1719686400000 // örnek: 2024-06-30
    },
    {
      id: 4,
      title: 'Deniz Manzaralı Daire',
      location: 'Konak, İzmir',
      region: 'İzmir',
      price: 1800000,
      area: 95,
      rooms: 2,
      type: 'Satılık',
      category: 'apartment',
      propertyType: 'apartment',
      transactionType: 'sale',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=400'
      ],
      coordinates: { lat: 38.4192, lng: 27.1287 },
      description: 'İzmir\'in en güzel semtlerinden Konak\'ta, deniz manzaralı 2+1 daire. Yeni yapılmış, asansörlü ve güvenlikli.',
      createdAt: 1719600000000 // örnek: 2024-06-29
    },
    {
      id: 5,
      title: 'Villa Kiralık',
      location: 'Konyaaltı, Antalya',
      region: 'Antalya',
      price: 12000,
      area: 180,
      rooms: 3,
      type: 'Kiralık',
      category: 'house',
      propertyType: 'house',
      transactionType: 'rent',
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=400'
      ],
      coordinates: { lat: 36.8969, lng: 30.7133 },
      description: 'Antalya\'nın en güzel plajlarından Konyaaltı\'nda, özel havuzlu villa. 3 yatak odası, 2 banyo, geniş teras.',
      createdAt: 1719513600000 // örnek: 2024-06-28
    }
  ])

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
    updateCurrencyRates
  }
}) 