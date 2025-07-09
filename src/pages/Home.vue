<template>
  <div class="home">
    <div class="hero-section">
      <img :src="logo" alt="Utku Property Logo" class="hero-logo" />
      <h1>UTKU PROPERTY</h1>
      <p>Hayalinizdeki evi bulun</p>
    </div>

    <div class="main-layout">
      <!-- Mobilde açılır sidebar overlay -->
      <div v-if="sidebarOpen" class="sidebar-overlay active" @click="toggleSidebar"></div>
      <!-- Sidebar Filters -->
      <div class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-header">
          <h3>Filtreler</h3>
          <button @click="toggleSidebar" class="close-btn">×</button>
        </div>
        
        <!-- Sıralama Seçeneği -->
        <div class="sort-section">
          <label for="sortSelect">Sırala:</label>
          <select id="sortSelect" v-model="sortOption" @change="sortListingsAndCloseSidebar">
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
            <select v-model="selectedRegion" @change="filterListingsAndCloseSidebar">
              <option value="">Tümü</option>
              <option value="İstanbul">İstanbul</option>
              <option value="Ankara">Ankara</option>
              <option value="İzmir">İzmir</option>
              <option value="Antalya">Antalya</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Mülk Tipi:</label>
            <select v-model="selectedType" @change="filterListingsAndCloseSidebar">
              <option value="">Tümü</option>
              <option value="apartment">Daire</option>
              <option value="house">Ev</option>
              <option value="shop">Dükkan</option>
            </select>
          </div>

          <div class="filter-group">
            <label>İşlem Tipi:</label>
            <select v-model="selectedTransaction" @change="filterListingsAndCloseSidebar">
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
        <div class="mobile-filter-toggle always-visible">
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
                :src="getListingImageUrl(listing)" 
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
import { onMounted } from 'vue'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { getOptimizedImageUrl } from '../utils/cloudinary.js'

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
  async mounted() {
    try {
      // Firestore'dan ilanları çek
      const querySnapshot = await getDocs(collection(db, 'listings'));
      const firebaseListings = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      // Sadece Firebase'den gelen ilanları göster
      this.filteredListings = firebaseListings;
    } catch (error) {
      console.error('Firebase error:', error);
      // Firebase hatası varsa sadece store'dan al
      const store = useListingsStore();
      this.filteredListings = store.listings;
    }
  },
  
  beforeUnmount() {
    // Component unmount olurken body scroll'unu restore et
    document.body.style.overflow = 'auto'
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
      
      // Mobilde body scroll'unu kontrol et
      if (window.innerWidth <= 900) {
        if (this.sidebarOpen) {
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = 'auto'
        }
      }
    },
    sortListingsAndCloseSidebar() {
      this.sortListings()
      if (window.innerWidth <= 900) this.sidebarOpen = false
    },
    filterListingsAndCloseSidebar() {
      this.filterListings()
      if (window.innerWidth <= 900) this.sidebarOpen = false
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
      if (typeof ts === 'object' && ts.seconds) {
        // Firestore Timestamp
        return new Date(ts.seconds * 1000).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      }
      const d = new Date(ts)
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
    getListingImageUrl(listing) {
      if (!listing.images || listing.images.length === 0) {
        return '/placeholder.jpg'
      }
      
      const imageUrl = listing.images[0]
      
      // Eğer Cloudinary URL'si ise optimize et
      if (imageUrl.includes('cloudinary.com')) {
        // Public ID'yi URL'den çıkar
        const publicId = imageUrl.split('/upload/')[1]?.split('.')[0]
        if (publicId) {
          return getOptimizedImageUrl(publicId, {
            width: 400,
            height: 300,
            crop: 'fill',
            quality: '85',
            format: 'auto'
          })
        }
      }
      
      return imageUrl
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
/* Viewport için temel ayarlar */
.home {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* Sidebar overlay - mobilde filtrelerin arkasında */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 998;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-overlay.active {
  opacity: 1;
}

/* Büyük ekranlar için normal görünüm */
@media (min-width: 901px) {
  .mobile-filter-toggle {
    display: none !important;
  }
  
  .sidebar-overlay {
    display: none !important;
  }
}

/* Tablet ve mobil için */
@media (max-width: 900px) {
  /* Ana düzen değişiklikleri */
  .main-layout {
    flex-direction: column;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  /* Mobil filtre toggle butonu */
  .mobile-filter-toggle {
    display: flex !important;
    position: sticky;
    top: 0;
    z-index: 100;
    background: linear-gradient(135deg, #232323 0%, #2c2c2c 100%);
    padding: 1rem;
    margin: 0 -1rem 1rem -1rem;
    border-bottom: 1px solid #333;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .filter-toggle-btn {
    background: linear-gradient(135deg, #cd7f32 0%, #a86828 100%);
    color: #fff;
    border: none;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(205, 127, 50, 0.3);
    width: 100%;
    justify-content: center;
  }

  .filter-toggle-btn:hover,
  .filter-toggle-btn:active {
    background: linear-gradient(135deg, #a86828 0%, #8b5720 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(205, 127, 50, 0.4);
  }

  .filter-toggle-btn span {
    font-size: 1.2rem;
  }

  /* Sidebar mobil düzeni */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999;
    background: linear-gradient(135deg, #1a1a1a 0%, #232323 100%);
    border-radius: 0;
    transform: translateX(-100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
    padding: 2rem 1.5rem;
    box-sizing: border-box;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  /* Sidebar header mobilde */
  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #333;
  }

  .sidebar-header h3 {
    color: #cd7f32;
    font-size: 1.5rem;
    margin: 0;
    font-weight: 700;
  }

  .close-btn {
    background: #cd7f32;
    color: #fff;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(205, 127, 50, 0.3);
  }

  .close-btn:hover {
    background: #a86828;
    transform: scale(1.1);
  }

  /* Content area mobilde */
  .content-area {
    width: 100%;
    max-width: 100vw;
    padding: 0 1rem;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  /* Listings grid mobilde */
  .listings-grid {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  /* Listing card mobilde */
  .listing-card {
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    margin-bottom: 1.5rem;
    min-height: auto;
    box-sizing: border-box;
    overflow: hidden;
  }

  .listing-image {
    width: 100%;
    height: 200px;
    flex: none;
  }

  .listing-content {
    padding: 1.5rem;
    width: 100%;
    box-sizing: border-box;
  }

  .listing-content h3 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }

  .listing-price {
    font-size: 1.4rem;
  }

  .listing-details {
    flex-wrap: wrap;
    gap: 1rem;
  }

  /* Hero section mobilde */
  .hero-section {
    padding: 2rem 1rem;
    text-align: center;
  }

  .hero-section h1 {
    font-size: 2rem;
  }

  .hero-logo {
    width: 80px;
    height: 80px;
  }
}

/* Küçük mobil cihazlar */
@media (max-width: 480px) {
  .content-area {
    padding: 0 0.5rem;
  }

  .sidebar {
    padding: 1.5rem 1rem;
  }

  .listing-content {
    padding: 1rem;
  }

  .listing-content h3 {
    font-size: 1.2rem;
  }

  .listing-price {
    font-size: 1.3rem;
  }

  .hero-section h1 {
    font-size: 1.8rem;
  }

  .hero-logo {
    width: 70px;
    height: 70px;
  }

  .filter-toggle-btn {
    padding: 0.8rem 1.2rem;
    font-size: 0.9rem;
  }

  .mobile-filter-toggle {
    padding: 0.8rem;
  }
}

/* Sidebar filter stilleri mobilde */
@media (max-width: 900px) {
  .filters {
    gap: 2rem;
  }

  .filter-group {
    gap: 0.8rem;
  }

  .filter-group label {
    font-size: 1rem;
    font-weight: 700;
    color: #cd7f32;
  }

  .filter-group select {
    padding: 1rem;
    font-size: 1rem;
    border: 2px solid #333;
    border-radius: 8px;
    background: #2c2c2c;
    color: #fff;
    transition: all 0.3s ease;
  }

  .filter-group select:focus {
    border-color: #cd7f32;
    outline: none;
    box-shadow: 0 0 0 3px rgba(205, 127, 50, 0.2);
  }

  .sort-section {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #333;
  }

  .sort-section label {
    font-size: 1rem;
    font-weight: 700;
    color: #cd7f32;
    margin-bottom: 0.8rem;
    display: block;
  }

  .sort-section select {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    border: 2px solid #333;
    border-radius: 8px;
    background: #2c2c2c;
    color: #fff;
    transition: all 0.3s ease;
  }

  .sort-section select:focus {
    border-color: #cd7f32;
    outline: none;
    box-shadow: 0 0 0 3px rgba(205, 127, 50, 0.2);
  }

  /* Currency switcher mobilde */
  .currency-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid #333;
  }

  /* Map section mobilde */
  .sidebar-map-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid #333;
  }

  .sidebar-map-section h2 {
    font-size: 1.2rem;
    color: #cd7f32;
    font-weight: 700;
  }

  .sidebar-map-wrapper {
    height: 300px;
    border: 2px solid #333;
    border-radius: 12px;
  }
}
</style> 