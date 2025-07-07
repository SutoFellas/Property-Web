<template>
  <div>
    <!-- Normal (sidebar) harita -->
    <div v-if="!isFullscreen" class="map-container">
      <div id="map" class="map"></div>
      <div class="map-controls">
        <button @click="centerMap" class="map-btn">Haritayı Merkezle</button>
        <button @click="toggleFullscreen" class="map-btn">Tam Ekran</button>
      </div>
    </div>

    <!-- Tam ekran modal harita -->
    <div v-if="isFullscreen" class="fullscreen-modal">
      <div class="fullscreen-map-container">
        <button class="close-fullscreen" @click="toggleFullscreen">×</button>
        <div id="map-fullscreen" class="map-fullscreen"></div>
        <div class="map-controls fullscreen-controls">
          <button @click="centerMapFullscreen" class="map-btn">Haritayı Merkezle</button>
        </div>
      </div>
      <div class="fullscreen-backdrop" @click="toggleFullscreen"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Props
const props = defineProps({
  listings: {
    type: Array,
    default: () => []
  },
  center: {
    type: Object,
    default: () => ({ lat: 39.9334, lng: 32.8597 }) // Türkiye merkezi
  },
  zoom: {
    type: Number,
    default: 6
  }
})

// Map instance
let map = null
let mapFullscreen = null
let markers = []
let markersFullscreen = []

// Fullscreen state
const isFullscreen = ref(false)

// Initialize map
onMounted(() => {
  initMap()
})

// Watch for listings changes
watch(() => props.listings, (newListings) => {
  updateMarkers(newListings)
  if (isFullscreen.value) updateMarkersFullscreen(newListings)
}, { deep: true })

watch(isFullscreen, async (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
    await nextTick()
    if (mapFullscreen) mapFullscreen.invalidateSize()
  } else {
    document.body.style.overflow = ''
  }
})

const initMap = () => {
  // Create map
  map = L.map('map').setView([props.center.lat, props.center.lng], props.zoom)
  
  // Add tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map)
  
  // Add markers for initial listings
  updateMarkers(props.listings)
}

const initMapFullscreen = () => {
  mapFullscreen = L.map('map-fullscreen').setView([props.center.lat, props.center.lng], props.zoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(mapFullscreen)
  updateMarkersFullscreen(props.listings)
}

const updateMarkers = (listings) => {
  // Clear existing markers
  markers.forEach(marker => map.removeLayer(marker))
  markers = []
  
  // Add new markers
  listings.forEach(listing => {
    if (listing.coordinates && listing.coordinates.lat && listing.coordinates.lng) {
      const marker = L.marker([listing.coordinates.lat, listing.coordinates.lng])
        .addTo(map)
        .bindPopup(createPopupContent(listing))
      
      markers.push(marker)
    }
  })
}

const updateMarkersFullscreen = (listings) => {
  if (!mapFullscreen) return
  markersFullscreen.forEach(marker => mapFullscreen.removeLayer(marker))
  markersFullscreen = []
  listings.forEach(listing => {
    if (listing.coordinates && listing.coordinates.lat && listing.coordinates.lng) {
      const marker = L.marker([listing.coordinates.lat, listing.coordinates.lng])
        .addTo(mapFullscreen)
        .bindPopup(createPopupContent(listing))
      markersFullscreen.push(marker)
    }
  })
}

const createPopupContent = (listing) => {
  const currencySymbols = {
    'TL': '₺',
    'USD': '$',
    'EUR': '€'
  }
  
  return `
    <div class="map-popup">
      <img src="${listing.image}" alt="${listing.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
      <h4 style="margin: 0 0 4px 0; color: #cd7f32;">${listing.title}</h4>
      <p style="margin: 0 0 4px 0; color: #666;">${listing.location}</p>
      <p style="margin: 0 0 4px 0; font-weight: bold; color: #333;">${currencySymbols['TL']}${listing.price.toLocaleString()}</p>
      <div style="display: flex; gap: 8px; font-size: 12px; color: #666;">
        <span>${listing.area}m²</span>
        <span>${listing.rooms} Oda</span>
        <span style="background: ${listing.transactionType === 'sale' ? '#e74c3c' : '#9b59b6'}; color: white; padding: 2px 6px; border-radius: 2px;">
          ${listing.transactionType === 'sale' ? 'Satılık' : 'Kiralık'}
        </span>
      </div>
    </div>
  `
}

const centerMap = () => {
  if (map && props.listings.length > 0) {
    const bounds = L.latLngBounds(props.listings.map(l => [l.coordinates.lat, l.coordinates.lng]))
    map.fitBounds(bounds, { padding: [20, 20] })
  } else if (map) {
    map.setView([props.center.lat, props.center.lng], props.zoom)
  }
}

const centerMapFullscreen = () => {
  if (mapFullscreen && props.listings.length > 0) {
    const bounds = L.latLngBounds(props.listings.map(l => [l.coordinates.lat, l.coordinates.lng]))
    mapFullscreen.fitBounds(bounds, { padding: [20, 20] })
  } else if (mapFullscreen) {
    mapFullscreen.setView([props.center.lat, props.center.lng], props.zoom)
  }
}

const toggleFullscreen = async () => {
  isFullscreen.value = !isFullscreen.value
  await nextTick()
  if (isFullscreen.value) {
    // Tam ekran modal açıldı
    if (!mapFullscreen) {
      initMapFullscreen()
    } else {
      mapFullscreen.invalidateSize()
      updateMarkersFullscreen(props.listings)
    }
  } else {
    // Tam ekran modal kapandı
    if (mapFullscreen) {
      mapFullscreen.remove()
      mapFullscreen = null
      markersFullscreen = []
    }
    // Ana haritayı tekrar boyutlandır
    setTimeout(() => {
      if (map) map.invalidateSize()
    }, 100)
  }
}
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 250px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #404040;
}

.map {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.map-btn {
  background: rgba(44, 44, 44, 0.9);
  color: #cd7f32;
  border: 1px solid #cd7f32;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.map-btn:hover {
  background: #cd7f32;
  color: #ffffff;
}

/* Leaflet popup customization */
:deep(.leaflet-popup-content-wrapper) {
  background: #2c2c2c;
  color: #ffffff;
  border-radius: 8px;
  border: 1px solid #404040;
}

:deep(.leaflet-popup-content) {
  margin: 12px;
  min-width: 200px;
}

:deep(.leaflet-popup-tip) {
  background: #2c2c2c;
  border: 1px solid #404040;
}

:deep(.leaflet-popup-close-button) {
  color: #cd7f32;
  font-size: 18px;
  font-weight: bold;
}

:deep(.leaflet-popup-close-button:hover) {
  color: #ffffff;
}

/* Fullscreen styles */
.map-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}

/* Responsive */
@media (max-width: 768px) {
  .map-container {
    height: 300px;
  }
  
  .map-controls {
    top: 5px;
    right: 5px;
  }
  
  .map-btn {
    padding: 6px 10px;
    font-size: 11px;
  }
}

.fullscreen-modal {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2147483647 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.fullscreen-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.7);
  z-index: 2147483646 !important;
}
.fullscreen-map-container {
  position: relative;
  width: 90vw;
  max-width: 900px;
  height: 70vh;
  background: #181818;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  z-index: 2147483647 !important;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  pointer-events: auto;
}
.map-fullscreen {
  width: 100%;
  height: 100%;
  border-radius: 16px;
}
.close-fullscreen {
  position: absolute;
  top: 16px;
  right: 20px;
  z-index: 100001;
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
}
.close-fullscreen:hover {
  background: #a05e1a;
}
.fullscreen-controls {
  position: absolute;
  top: 16px;
  left: 20px;
  flex-direction: row;
  gap: 10px;
}
.fullscreen-map-container :deep(.leaflet-container),
.fullscreen-map-container :deep(.leaflet-pane),
.fullscreen-map-container :deep(.leaflet-top),
.fullscreen-map-container :deep(.leaflet-bottom) {
  z-index: 2147483647 !important;
  pointer-events: auto !important;
}

.map-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.95);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}
.map-modal-content {
  position: relative;
  width: 90vw;
  height: 80vh;
  max-width: 700px;
  max-height: 90vh;
  background: #181818;
  border-radius: 18px;
  box-shadow: 0 0 32px #000a;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.close-map-btn {
  position: absolute;
  top: 12px;
  right: 18px;
  z-index: 100000;
  background: #232323;
  color: #fff;
  border: none;
  font-size: 2rem;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}
.close-map-btn:hover {
  background: #b08d57;
  color: #181818;
}
@media (max-width: 600px) {
  .map-modal-content {
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }
  .close-map-btn {
    top: 10px;
    right: 10px;
    font-size: 2.2rem;
    width: 40px;
    height: 40px;
  }
}
</style> 