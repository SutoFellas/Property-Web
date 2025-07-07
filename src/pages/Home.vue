<template>
  <div class="home">
    <div class="hero-section">
      <img :src="logo" alt="Utku Property Logo" class="hero-logo" />
      <h1>UTKU PROPERTY</h1>
      <p>Hayalinizdeki evi bulun</p>
    </div>

    <div class="main-layout">
      <!-- Mobilde açılır sidebar overlay -->
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>
      <!-- Sidebar Filters -->
      <div class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-header">
          <h3>Filtreler</h3>
          <button @click="toggleSidebar" class="close-btn">×</button>
        </div>
        
        <!-- Sıralama Seçeneği -->
        <div class="sort-section">
          <label for="sortSelect">Sırala:</label>
          <select id="sortSelect" v-model="sortOption" @change="sortListings">
            <option value="default">Varsayılan</option>
            <option value="price-asc">Ucuzdan Pahalıya</option>
            <option value="price-desc">Pahalıdan Ucuza</option>
            <option value="az">A'dan Z'ye</option>
            <option value="za">Z'den A'ya</option>
            <option value="date-desc">Eklenme Tarihi: Yeniden Eskiye</option>
            <option value="date-asc">Eklenme Tarihi: Eskiden Yeniye</option>
          </select>
        </div>

        <div class="filters">
          <div class="filter-group">
            <label>Bölge:</label>
            <select v-model="selectedRegion" @change="filterListings">
              <option value="">Tümü</option>
              <option value="İstanbul">İstanbul</option>
              <option value="Ankara">Ankara</option>
              <option value="İzmir">İzmir</option>
              <option value="Antalya">Antalya</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Mülk Tipi:</label>
            <select v-model="selectedType" @change="filterListings">
              <option value="">Tümü</option>
              <option value="apartment">Daire</option>
              <option value="house">Ev</option>
              <option value="shop">Dükkan</option>
            </select>
          </div>

          <div class="filter-group">
            <label>İşlem Tipi:</label>
            <select v-model="selectedTransaction" @change="filterListings">
              <option value="">Tümü</option>
              <option value="sale">Satılık</option>
              <option value="rent">Kiralık</option>
            </select>
          </div>

          <!-- Currency Switcher in Sidebar -->
          <div class="currency-section">
            <CurrencySwitcher />
          </div>
        </div>

        <!-- Map View in Sidebar -->
        <div class="sidebar-map-section">
          <h2>Konum Haritası</h2>
          <div class="sidebar-map-wrapper">
            <MapView :listings="filteredListings" />
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-area">
        <!-- Mobile Filter Toggle -->
        <div class="mobile-filter-toggle">
          <button @click="toggleSidebar" class="filter-toggle-btn">
            <span>☰</span> Filtreler
          </button>
        </div>

        <!-- Listings Grid -->
        <div class="listings-grid">
          <div 
            v-for="listing in filteredListings" 
            :key="listing.id" 
            class="listing-card"
            @click="viewListing(listing.id)"
          >
            <div class="listing-image">
              <img 
                :src="listing.images && listing.images.length > 0 ? listing.images[0] : '/placeholder.jpg'" 
                :alt="listing.title"
              >
              <div class="listing-badge" :class="listing.transactionType">
                {{ listing.transactionType === 'sale' ? 'Satılık' : 'Kiralık' }}
              </div>
            </div>
            
            <div class="listing-content">
              <h3>{{ listing.title }}</h3>
              <p class="listing-location">{{ listing.region }}</p>
              <p class="listing-type">{{ getPropertyTypeName(listing.propertyType) }}</p>
              <div class="listing-price">
                {{ formatPrice(listing.price) }}
              </div>
              <div class="listing-details">
                <span>{{ listing.area }} m²</span>
                <span>{{ listing.rooms }} Oda</span>
              </div>
              <div class="listing-date-corner">{{ formatDate(listing.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useListingsStore } from '../store/listings'
import CurrencySwitcher from '../components/CurrencySwitcher.vue'
import MapView from '../components/MapView.vue'
import logo from '../assets/Opera Anlık Görüntü_2025-07-08_001832_www.instagram.com.png'

export default {
  name: 'Home',
  components: {
    CurrencySwitcher,
    MapView
  },
  data() {
    return {
      selectedRegion: '',
      selectedType: '',
      selectedTransaction: '',
      filteredListings: [],
      sidebarOpen: false,
      logo,
      sortOption: 'default'
    }
  },
  computed: {
    listings() {
      return useListingsStore().listings
    }
  },
  mounted() {
    this.filteredListings = this.listings
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    sortListings() {
      let sorted = [...this.filteredListings]
      if (this.sortOption === 'price-asc') {
        sorted.sort((a, b) => a.price - b.price)
      } else if (this.sortOption === 'price-desc') {
        sorted.sort((a, b) => b.price - a.price)
      } else if (this.sortOption === 'az') {
        sorted.sort((a, b) => a.title.localeCompare(b.title, 'tr'))
      } else if (this.sortOption === 'za') {
        sorted.sort((a, b) => b.title.localeCompare(a.title, 'tr'))
      } else if (this.sortOption === 'date-desc') {
        sorted.sort((a, b) => b.createdAt - a.createdAt)
      } else if (this.sortOption === 'date-asc') {
        sorted.sort((a, b) => a.createdAt - b.createdAt)
      }
      this.filteredListings = sorted
    },
    filterListings() {
      this.filteredListings = this.listings.filter(listing => {
        const regionMatch = !this.selectedRegion || listing.region === this.selectedRegion
        const typeMatch = !this.selectedType || listing.propertyType === this.selectedType
        const transactionMatch = !this.selectedTransaction || listing.transactionType === this.selectedTransaction
        
        return regionMatch && typeMatch && transactionMatch
      })
      this.sortListings()
    },
    getPropertyTypeName(type) {
      const types = {
        apartment: 'Daire',
        house: 'Ev',
        shop: 'Dükkan'
      }
      return types[type] || type
    },
    formatPrice(price) {
      const store = useListingsStore()
      const currency = store.selectedCurrency
      const rate = store.currencyRates[currency]
      const convertedPrice = price * rate
      
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency
      }).format(convertedPrice)
    },
    formatDate(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
    viewListing(id) {
      this.$router.push(`/listing/${id}`)
    }
  }
}
</script>

<style scoped>
.home {
  width: 100%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
  background: transparent;
  box-sizing: border-box;
  overflow-x: hidden;
}

.hero-section {
  text-align: center;
  padding: 3rem 0 3rem 0;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  border-radius: 10px;
  margin-bottom: 2rem;
  border: 1px solid #333;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #cd7f32;
}

.hero-section p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.hero-logo {
  display: block;
  margin: 0 auto 1.2rem auto;
  height: 64px;
  width: 64px;
  border-radius: 12px;
  object-fit: cover;
  background: #fff;
  border: 2px solid #cd7f32;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.main-layout {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* Sidebar Styles */
.sidebar {
  width: 220px;
  min-width: 180px;
  max-width: 260px;
  background: #2c2c2c;
  border-radius: 10px;
  border: 1px solid #333;
  padding: 1.2rem 1rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
  left: 0;
  margin-left: 0;
  box-sizing: border-box;
  transition: all 0.3s ease;
  flex-shrink: 0;
  overflow-x: hidden;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.sidebar-header h3 {
  color: #cd7f32;
  font-size: 1.2rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #404040;
}

.sort-section {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sort-section label {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
}
.sort-section select {
  padding: 0.5rem;
  border: 2px solid #333;
  border-radius: 5px;
  background: #404040;
  color: #fff;
  font-size: 0.95rem;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #fff;
  font-size: 0.9rem;
}

.filter-group select {
  padding: 0.75rem;
  border: 2px solid #333;
  border-radius: 5px;
  background: #404040;
  color: #fff;
  font-size: 0.9rem;
}

.filter-group select option {
  background: #404040;
  color: #fff;
}

.currency-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
}

/* Content Area */
.content-area {
  flex: 1 1 0%;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  padding-left: 0;
  margin: 0;
}

.mobile-filter-toggle {
  display: none;
  margin-bottom: 1rem;
}

.filter-toggle-btn {
  background: #2c2c2c;
  color: #fff;
  border: 1px solid #333;
  padding: 0.75rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-toggle-btn:hover {
  background: #404040;
  border-color: #cd7f32;
}

.listings-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  margin: 0 0 3rem 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

.listing-card {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: #2c2c2c;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  border: 1px solid #333;
  min-height: 220px;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  position: relative;
}

.listing-card:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  border-color: #cd7f32;
}

.listing-image {
  flex: 0 0 220px;
  height: 220px;
  overflow: hidden;
  position: relative;
  background: #181818;
  min-width: 0;
  box-sizing: border-box;
}

.listing-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
}

.listing-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.listing-badge.sale {
  background-color: #e74c3c;
}

.listing-badge.rent {
  background-color: #3498db;
}

.listing-content {
  flex: 1 1 0%;
  padding: 1.2rem 1.2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  position: relative;
}

.listing-content h3 {
  margin-bottom: 0.7rem;
  color: #fff;
  font-size: 1.5rem;
}

.listing-location {
  color: #ccc;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.listing-type {
  color: #cd7f32;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.listing-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #cd7f32;
  margin-bottom: 1rem;
}

.listing-details {
  display: flex;
  gap: 1.5rem;
  font-size: 1.1rem;
  color: #ccc;
}

.listing-date-corner {
  position: absolute;
  right: 1.2rem;
  bottom: 0.7rem;
  color: #b0b0b0;
  font-size: 0.93rem;
  opacity: 0.6;
  font-weight: 400;
  pointer-events: none;
}

.sidebar-map-section {
  margin-top: 2rem;
  text-align: center;
}
.sidebar-map-section h2 {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
.sidebar-map-wrapper {
  width: 100%;
  height: 250px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
  background: #222;
}
.sidebar-map-wrapper :deep(.leaflet-container) {
  width: 100% !important;
  height: 250px !important;
  border-radius: 8px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: -320px;
    top: 0;
    height: 100vh;
    z-index: 1000;
    border-radius: 0;
    overflow-y: auto;
  }
  
  .sidebar-open {
    left: 0;
  }
  
  .mobile-filter-toggle {
    display: block;
  }
  
  .main-layout {
    flex-direction: column;
  }
  
  .content-area {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .sidebar {
    width: 100%;
    left: -100%;
  }
}

@media (max-width: 1100px) {
  .main-layout {
    gap: 0.5rem;
    width: 100%;
  }
  .sidebar {
    width: 120px;
    min-width: 80px;
    max-width: 140px;
    padding: 0.5rem 0.2rem;
  }
  .listings-grid {
    max-width: 100%;
    padding: 0;
  }
  .listing-card {
    flex-direction: column;
    min-height: 120px;
    width: 100%;
    max-width: 100%;
  }
  .listing-image {
    width: 100%;
    height: 120px;
    flex: none;
  }
  .listing-content {
    padding: 0.7rem 0.7rem;
  }
}

@media (max-width: 600px) {
  .sidebar {
    display: none;
  }
  .listing-card {
    border-radius: 8px;
    min-height: 80px;
    width: 100%;
    max-width: 100%;
  }
  .listing-image {
    height: 80px;
  }
  .listing-content {
    padding: 0.4rem 0.4rem;
  }
  .listings-grid {
    gap: 0.7rem;
    padding: 0;
  }
}

.sidebar-overlay {
  display: none;
}
@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background: #232323;
    border-radius: 0;
    box-shadow: 0 0 0 100vw rgba(0,0,0,0.5);
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(.4,0,.2,1);
    overflow-y: auto;
    padding: 2.5rem 1.2rem 2rem 1.2rem;
  }
  .sidebar.sidebar-open {
    transform: translateX(0);
  }
  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.5);
    z-index: 9998;
  }
  .main-layout {
    flex-direction: column;
  }
}
@media (max-width: 600px) {
  .sidebar {
    padding: 1.2rem 0.5rem 1.2rem 0.5rem;
  }
}
</style> 