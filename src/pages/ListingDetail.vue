<template>
  <div class="listing-detail-page">
    <div class="container" v-if="listing">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <router-link to="/">Anasayfa</router-link>
        <span class="separator">/</span>
        <span>{{ listing.title }}</span>
      </nav>

      <!-- İlan Başlığı ve Fiyat -->
      <section class="listing-header">
        <div class="title-section">
          <h1>{{ listing.title }}</h1>
          <p class="location">{{ listing.location }}</p>
          <div class="badges-date-row">
            <div class="badges">
              <span :class="['badge', getCategoryClass(listing.category)]">
                {{ getCategoryName(listing.category) }}
              </span>
              <span :class="['badge', listing.transactionType === 'sale' ? 'badge-sale' : 'badge-rent']">
                {{ listing.transactionType === 'sale' ? 'Satılık' : 'Kiralık' }}
              </span>
            </div>
            <div class="listing-date-detail">İlan Tarihi: {{ formatDate(listing.createdAt) }}</div>
          </div>
        </div>
        <div class="price-section">
          <div class="currency-label-main">Fiyat ({{ selectedCurrency }})</div>
          <div class="main-price">{{ formatPrice(listing.price) }}</div>
          <CurrencySwitcher />
        </div>
      </section>

      <!-- Resim Galerisi -->
      <section class="gallery-section">
        <div class="main-image">
          <img 
            :src="currentImage" 
            :alt="listing.title"
            @click="openLightbox"
          >
          <div class="image-counter">
            {{ currentImageIndex + 1 }} / {{ listing.images.length }}
          </div>
        </div>
        <div class="thumbnail-gallery" v-if="listing.images.length > 1">
          <div 
            v-for="(image, index) in listing.images" 
            :key="index"
            :class="['thumbnail', { active: index === currentImageIndex }]"
            @click="currentImageIndex = index"
          >
            <img :src="image" :alt="`${listing.title} - Resim ${index + 1}`">
          </div>
        </div>
      </section>

      <!-- İlan Detayları -->
      <section class="details-section">
        <div class="details-grid">
          <div class="main-details">
            <h2>İlan Detayları</h2>
            <div class="detail-item">
              <span class="label currency-label">Fiyat ({{ selectedCurrency }})</span>
              <span class="value main-price-detail">{{ formatPrice(listing.price) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Alan:</span>
              <span class="value">{{ listing.area }}m²</span>
            </div>
            <div class="detail-item">
              <span class="label">Oda Sayısı:</span>
              <span class="value">{{ listing.rooms }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Kategori:</span>
              <span class="value">{{ getCategoryName(listing.category) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">İşlem Türü:</span>
              <span class="value">{{ listing.transactionType === 'sale' ? 'Satılık' : 'Kiralık' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Konum:</span>
              <span class="value">{{ listing.location }}</span>
            </div>
          </div>

          <div class="contact-info">
            <h3>İletişim Bilgileri</h3>
            <div class="contact-item">
              <span class="icon">📞</span>
              <span>+90 555 123 45 67</span>
            </div>
            <div class="contact-item">
              <span class="icon">📧</span>
              <span>info@emlaksitesi.com</span>
            </div>
            <div class="contact-item">
              <span class="icon">🏢</span>
              <span>Emlak Ofisi</span>
            </div>
            <button class="contact-btn">İletişime Geç</button>
          </div>
        </div>
      </section>

      <!-- Harita -->
      <section class="map-section" v-if="listing.coordinates">
        <h2>Konum</h2>
        <MapView 
          :listings="[listing]" 
          :center="listing.coordinates"
          :zoom="15"
        />
      </section>

      <!-- Açıklama -->
      <section class="description-section" v-if="listing.description">
        <h2>Açıklama</h2>
        <div class="description">
          {{ listing.description }}
        </div>
      </section>
    </div>
    
    <!-- Loading state -->
    <div v-else-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <h2>İlan yükleniyor...</h2>
      <p>Lütfen bekleyin</p>
    </div>
    
    <!-- Not found state - sadece loading tamamlandıktan sonra göster -->
    <div v-else class="not-found">
      <h2>İlan bulunamadı</h2>
      <p>Aradığınız ilan yayından kaldırılmış veya silinmiş olabilir.</p>
      <router-link to="/" class="back-link">Ana sayfaya dön</router-link>
    </div>

    <!-- Lightbox Modal -->
    <div v-if="showLightbox" class="lightbox-overlay" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <button class="lightbox-close" @click="closeLightbox">×</button>
        <button class="lightbox-nav prev" @click="previousImage" v-if="listing.images.length > 1">
          ‹
        </button>
        <button class="lightbox-nav next" @click="nextImage" v-if="listing.images.length > 1">
          ›
        </button>
        <img :src="currentImage" :alt="listing.title">
        <div class="lightbox-counter">
          {{ currentImageIndex + 1 }} / {{ listing.images.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useListingsStore } from '../store/listings'
import { storeToRefs } from 'pinia'
import CurrencySwitcher from '../components/CurrencySwitcher.vue'
import MapView from '../components/MapView.vue'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

const route = useRoute()
const listingsStore = useListingsStore()
const { selectedCurrency, currencyRates } = storeToRefs(listingsStore)

// State
const currentImageIndex = ref(0)
const showLightbox = ref(false)
const listing = ref(null)
const loading = ref(true)

// Fetch listing from Firebase
onMounted(async () => {
  try {
    const listingId = route.params.id
    const docRef = doc(db, 'listings', listingId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      listing.value = { id: docSnap.id, ...docSnap.data() }
    } else {
      // Store'dan da dene
      const storeId = parseInt(listingId)
      listing.value = listingsStore.getListingById(storeId)
    }
  } catch (error) {
    console.error('Error fetching listing:', error)
    // Store'dan dene
    const storeId = parseInt(route.params.id)
    listing.value = listingsStore.getListingById(storeId)
  } finally {
    loading.value = false
  }
})

// Current image
const currentImage = computed(() => {
  if (!listing.value || !listing.value.images || listing.value.images.length === 0) {
    return '/placeholder-image.jpg'
  }
  return listing.value.images[currentImageIndex.value]
})

// Methods
const getCategoryName = (category) => {
  const names = {
    apartment: 'Daire',
    shop: 'Dükkan',
    house: 'Ev'
  }
  return names[category] || category
}

const getCategoryClass = (category) => {
  return `badge-${category}`
}

const formatPrice = (price) => {
  const currency = selectedCurrency.value
  const rate = currencyRates.value[currency]
  const convertedPrice = price * rate
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency
  }).format(convertedPrice)
}

const formatPriceForCurrency = (price, currency) => {
  const rate = currencyRates.value[currency]
  const convertedPrice = price * rate
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency
  }).format(convertedPrice)
}

const handleCurrencyChange = (currency) => {
  listingsStore.setCurrency(currency)
}

const openLightbox = () => {
  showLightbox.value = true
}

const closeLightbox = () => {
  showLightbox.value = false
}

const nextImage = () => {
  if (listing.value.images.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % listing.value.images.length
  }
}

const previousImage = () => {
  if (listing.value.images.length > 1) {
    currentImageIndex.value = currentImageIndex.value === 0 
      ? listing.value.images.length - 1 
      : currentImageIndex.value - 1
  }
}

const formatDate = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Keyboard navigation for lightbox
onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (!showLightbox.value) return
    
    if (e.key === 'Escape') {
      closeLightbox()
    } else if (e.key === 'ArrowRight') {
      nextImage()
    } else if (e.key === 'ArrowLeft') {
      previousImage()
    }
  })
})
</script>

<style scoped>
.listing-detail-page {
  min-height: 100vh;
  background: #181818;
  color: #ffffff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Breadcrumb */
.breadcrumb {
  margin-bottom: 2rem;
  padding: 1rem 0;
}

.breadcrumb a {
  color: #cd7f32;
  text-decoration: none;
}

.breadcrumb .separator {
  margin: 0 0.5rem;
  color: #b0b0b0;
}

/* Listing Header */
.listing-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 2rem;
  background: #2c2c2c;
  border-radius: 8px;
  border: 1px solid #404040;
}

.title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
}

.title-section h1 {
  color: #cd7f32;
  font-size: 2.3rem;
  font-weight: bold;
  margin-bottom: 0.2rem;
  text-align: center;
}

.title-section .location {
  color: #b0b0b0;
  font-size: 1.15rem;
  margin-bottom: 0.2rem;
  text-align: center;
}

.badges-date-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.3rem;
  flex-wrap: wrap;
}

.badges {
  display: flex;
  gap: 0.7rem;
}

.badge {
  padding: 0.38rem 1.1rem;
  border-radius: 18px;
  font-size: 1.08rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.10);
  color: #fff;
  border: none;
  display: inline-block;
  background: #444;
  text-shadow: 0 1px 6px rgba(0,0,0,0.13);
  transition: transform 0.15s, box-shadow 0.15s;
}

.badge-apartment {
  background: linear-gradient(90deg, #4a90e2 60%, #357ab8 100%);
}

.badge-shop {
  background: linear-gradient(90deg, #f39c12 60%, #e67e22 100%);
}

.badge-house {
  background: linear-gradient(90deg, #27ae60 60%, #219150 100%);
}

.badge-sale {
  background: linear-gradient(90deg, #e74c3c 60%, #c0392b 100%);
  box-shadow: 0 2px 16px rgba(231,76,60,0.18);
  border: 2px solid #fff2;
}

.badge-rent {
  background: linear-gradient(90deg, #9b59b6 60%, #6c3483 100%);
  box-shadow: 0 2px 16px rgba(155,89,182,0.18);
  border: 2px solid #fff2;
}

.badge:hover {
  transform: scale(1.07);
  box-shadow: 0 4px 18px rgba(0,0,0,0.18);
}

.listing-date-detail {
  color: #cd7f32;
  font-size: 1.01rem;
  font-weight: 500;
  margin: 0;
  opacity: 0.85;
  white-space: nowrap;
}

.price-section {
  text-align: right;
}

.currency-label-main {
  color: #cd7f32;
  font-weight: 700;
  font-size: 1.15rem;
  margin-bottom: 0.3rem;
  text-align: right;
}

.main-price {
  color: #cd7f32;
  font-size: 2.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: right;
  letter-spacing: 1px;
}

/* Döviz Kurları */
.currency-rates {
  margin-bottom: 0.5rem;
}

.currency-rates h4 {
  color: #cd7f32;
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
}

.rates-grid {
  display: flex;
  gap: 0.5rem;
}

.rate-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rate-currency {
  color: #b0b0b0;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}

.rate-value {
  color: #ffffff;
  font-size: 1.08rem;
  font-weight: 600;
}

.main-price-detail {
  color: #cd7f32;
  font-size: 1.2rem;
  font-weight: bold;
}

/* Responsive */
@media (max-width: 768px) {
  .listing-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .price-section {
    text-align: center;
  }
  
  .rates-grid {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .rate-item {
    min-width: 80px;
  }
}

@media (max-width: 600px) {
  .container {
    padding: 0 10px;
  }
  
  .listing-header {
    padding: 1.5rem;
  }
  
  .title-section h1 {
    font-size: 1.8rem;
  }
  
  .main-price {
    font-size: 1.8rem;
  }
  
  .currency-rates h4 {
    font-size: 1rem;
  }
  
  .rates-grid {
    gap: 0.3rem;
  }
  
  .rate-item {
    min-width: 70px;
  }
  
  .rate-currency {
    font-size: 0.8rem;
  }
  
  .rate-value {
    font-size: 0.95rem;
  }
}

/* Gallery */
.gallery-section {
  margin-bottom: 2rem;
}

.main-image {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  cursor: pointer;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.main-image:hover img {
  transform: scale(1.05);
}

.image-counter {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.thumbnail-gallery {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.thumbnail.active {
  border-color: #cd7f32;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Details */
.details-section {
  margin-bottom: 2rem;
}

.details-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.main-details,
.contact-info {
  background: #2c2c2c;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #404040;
}

.main-details h2,
.contact-info h3 {
  color: #cd7f32;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #404040;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  color: #b0b0b0;
  font-weight: 500;
}

.value {
  color: #ffffff;
  font-weight: 600;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #b0b0b0;
}

.contact-item .icon {
  font-size: 1.2rem;
}

.contact-btn {
  width: 100%;
  background: #cd7f32;
  color: #ffffff;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.contact-btn:hover {
  background: #b36628;
}

/* Map Section */
.map-section {
  margin-bottom: 2rem;
}

.map-section h2 {
  color: #cd7f32;
  margin-bottom: 1.5rem;
}

/* Description */
.description-section {
  margin-bottom: 2rem;
}

.description-section h2 {
  color: #cd7f32;
  margin-bottom: 1.5rem;
}

.description {
  background: #2c2c2c;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #404040;
  line-height: 1.6;
  color: #b0b0b0;
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.85);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lightbox-content {
  position: relative;
  background: #181818;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  padding: 2.5rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 95vw;
  max-height: 90vh;
}
.lightbox-content img {
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.25);
  object-fit: contain;
  background: #222;
  margin-bottom: 1.2rem;
}
.lightbox-close {
  position: absolute;
  top: 18px;
  right: 24px;
  background: #cd7f32;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 100001;
}
.lightbox-close:hover {
  background: #a05e1a;
}
.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(44,44,44,0.7);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 54px;
  height: 54px;
  font-size: 2.3rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 100001;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  transition: background 0.2s, color 0.2s, transform 0.2s;
  opacity: 0.85;
  border: 2px solid #cd7f32;
}
.lightbox-nav.prev {
  left: -70px;
}
.lightbox-nav.next {
  right: -70px;
}
.lightbox-nav:hover {
  background: #cd7f32;
  color: #fff;
  transform: translateY(-50%) scale(1.08);
  opacity: 1;
}
.lightbox-counter {
  color: #fff;
  font-size: 1.1rem;
  margin-top: 0.5rem;
  text-align: center;
}
@media (max-width: 600px) {
  .lightbox-content {
    padding: 1rem 0.2rem 1rem 0.2rem;
    max-width: 100vw;
    max-height: 100vh;
  }
  .lightbox-content img {
    max-width: 98vw;
    max-height: 60vh;
  }
  .title-section h1 {
    font-size: 1.3rem;
  }
  .badges-date-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .listing-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .main-image {
    height: 250px;
  }
  
  .thumbnail {
    width: 60px;
    height: 45px;
  }
  
  .lightbox-nav {
    font-size: 1.5rem;
    padding: 0.5rem 0.25rem;
  }
  
  .lightbox-nav.prev {
    left: 10px;
  }
  
  .lightbox-nav.next {
    right: 10px;
  }
}

@media (max-width: 900px) {
  .lightbox-nav.prev {
    left: 5px;
  }
  .lightbox-nav.next {
    right: 5px;
  }
  .lightbox-nav {
    width: 44px;
    height: 44px;
    font-size: 1.7rem;
  }
}

/* Loading styles */
.loading {
  max-width: 500px;
  margin: 4rem auto;
  background: #232323;
  color: #fff;
  border-radius: 12px;
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  text-align: center;
}

.loading h2 {
  color: #cd7f32;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #444;
  border-top: 4px solid #cd7f32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.not-found {
  max-width: 500px;
  margin: 4rem auto;
  background: #232323;
  color: #fff;
  border-radius: 12px;
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  text-align: center;
}
.not-found h2 {
  color: #cd7f32;
  font-size: 2rem;
  margin-bottom: 1.2rem;
}
.back-link {
  display: inline-block;
  margin-top: 1.5rem;
  color: #cd7f32;
  text-decoration: none;
  font-weight: 500;
  border: 1px solid #cd7f32;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  transition: background 0.2s, color 0.2s;
}
.back-link:hover {
  background: #cd7f32;
  color: #fff;
}

.currency-label {
  color: #cd7f32;
  font-weight: 600;
  font-size: 1.08rem;
  margin-bottom: 0.2rem;
  display: inline-block;
}
</style> 