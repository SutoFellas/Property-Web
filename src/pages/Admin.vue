<template>
  <div class="admin-page">
    <h1 class="admin-title">Admin Paneli</h1>
    <div class="container">
      <!-- İlan Ekleme Formu -->
      <section class="add-listing">
        <h2>Yeni İlan Ekle</h2>
        <form @submit.prevent="addListing" class="listing-form">
          <div class="form-row">
            <div class="form-group">
              <label>İlan Başlığı</label>
              <input 
                v-model="newListing.title" 
                type="text" 
                required 
                placeholder="Örn: Modern 3+1 Daire"
              >
            </div>
            <div class="form-group">
              <label>Konum</label>
              <input 
                v-model="newListing.location" 
                type="text" 
                required 
                placeholder="Örn: Kadıköy, İstanbul"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Kategori</label>
              <select v-model="newListing.category" required>
                <option value="">Seçiniz</option>
                <option value="apartment">Daire</option>
                <option value="shop">Dükkan</option>
                <option value="house">Ev</option>
              </select>
            </div>
            <div class="form-group">
              <label>İşlem Türü</label>
              <select v-model="newListing.transactionType" required>
                <option value="">Seçiniz</option>
                <option value="sale">Satılık</option>
                <option value="rent">Kiralık</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Fiyat (TL)</label>
              <input 
                v-model.number="newListing.price" 
                type="number" 
                required 
                placeholder="2500000"
                step="0.01"
              >
            </div>
            <div class="form-group">
              <label>Alan (m²)</label>
              <input 
                v-model.number="newListing.area" 
                type="number" 
                required 
                placeholder="120"
              >
            </div>
            <div class="form-group">
              <label>Oda Sayısı</label>
              <input 
                v-model.number="newListing.rooms" 
                type="number" 
                required 
                placeholder="3"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Resimler</label>
            <ImageUploader 
              v-model="newListing.images" 
              :max-images="20"
            />
          </div>

          <div class="form-group">
            <label>Açıklama</label>
            <textarea 
              v-model="newListing.description" 
              rows="4"
              placeholder="İlan açıklaması..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Koordinatlar (Harita için)</label>
            <div class="coordinates-input">
              <input 
                v-model.number="newListing.coordinates.lat" 
                type="number" 
                step="any"
                placeholder="Enlem (41.0082)"
              >
              <input 
                v-model.number="newListing.coordinates.lng" 
                type="number" 
                step="any"
                placeholder="Boylam (28.9784)"
              >
            </div>
          </div>

          <button type="submit" class="btn-primary">İlan Ekle</button>
        </form>
      </section>

      <!-- İlan Yönetimi -->
      <section class="manage-listings">
        <h2>İlan Yönetimi</h2>
        
        <!-- Filtreler -->
        <div class="filters">
          <div class="filter-group">
            <label>Kategori:</label>
            <select v-model="filterCategory">
              <option value="">Tümü</option>
              <option value="apartment">Daire</option>
              <option value="shop">Dükkan</option>
              <option value="house">Ev</option>
            </select>
          </div>
          <div class="filter-group">
            <label>İşlem:</label>
            <select v-model="filterType">
              <option value="">Tümü</option>
              <option value="sale">Satılık</option>
              <option value="rent">Kiralık</option>
            </select>
          </div>
        </div>

        <!-- İlan Listesi -->
        <div class="listings-table">
          <table>
            <thead>
              <tr>
                <th>Resim</th>
                <th>Başlık</th>
                <th>Konum</th>
                <th>Kategori</th>
                <th>İşlem</th>
                <th>Fiyat</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="listing in filteredListings" :key="listing.id">
                <td>
                  <img :src="listing.images && listing.images.length > 0 ? listing.images[0] : '/placeholder-image.jpg'" :alt="listing.title" class="listing-thumb">
                </td>
                <td>{{ listing.title }}</td>
                <td>{{ listing.location }}</td>
                <td>
                  <span :class="['badge', getCategoryClass(listing.category)]">
                    {{ getCategoryName(listing.category) }}
                  </span>
                </td>
                <td>
                  <span :class="['badge', listing.transactionType === 'sale' ? 'badge-sale' : 'badge-rent']">
                    {{ listing.transactionType === 'sale' ? 'Satılık' : 'Kiralık' }}
                  </span>
                </td>
                <td>
                  <div class="price-edit">
                    <input 
                      v-model.number="listing.price" 
                      type="number" 
                      @change="updatePrice(listing.id, listing.price)"
                      class="price-input"
                    >
                    <span class="currency">TL</span>
                  </div>
                </td>
                <td>
                  <div class="actions">
                    <button @click="editListing(listing)" class="btn-edit">Düzenle</button>
                    <button @click="deleteListing(listing.id)" class="btn-delete">Sil</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Düzenleme Modal -->
      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal" @click.stop>
          <h3>İlan Düzenle</h3>
          <form @submit.prevent="saveEdit" class="listing-form">
            <div class="form-row">
              <div class="form-group">
                <label>İlan Başlığı</label>
                <input v-model="editingListing.title" type="text" required>
              </div>
              <div class="form-group">
                <label>Konum</label>
                <input v-model="editingListing.location" type="text" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Kategori</label>
                <select v-model="editingListing.category" required>
                  <option value="apartment">Daire</option>
                  <option value="shop">Dükkan</option>
                  <option value="house">Ev</option>
                </select>
              </div>
              <div class="form-group">
                <label>İşlem Türü</label>
                <select v-model="editingListing.transactionType" required>
                  <option value="sale">Satılık</option>
                  <option value="rent">Kiralık</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Fiyat (TL)</label>
                <input v-model.number="editingListing.price" type="number" required>
              </div>
              <div class="form-group">
                <label>Alan (m²)</label>
                <input v-model.number="editingListing.area" type="number" required>
              </div>
              <div class="form-group">
                <label>Oda Sayısı</label>
                <input v-model.number="editingListing.rooms" type="number" required>
              </div>
            </div>

            <div class="form-group">
              <label>Resimler</label>
              <ImageUploader 
                v-model="editingListing.images" 
                :max-images="20"
              />
            </div>

            <div class="form-group">
              <label>Açıklama</label>
              <textarea 
                v-model="editingListing.description" 
                rows="4"
                placeholder="İlan açıklaması..."
              ></textarea>
            </div>

            <div class="form-group">
              <label>Koordinatlar (Harita için)</label>
              <div class="coordinates-input">
                <input 
                  v-model.number="editingListing.coordinates.lat" 
                  type="number" 
                  step="any"
                  placeholder="Enlem (41.0082)"
                >
                <input 
                  v-model.number="editingListing.coordinates.lng" 
                  type="number" 
                  step="any"
                  placeholder="Boylam (28.9784)"
                >
              </div>
            </div>

            <div class="modal-actions">
              <button type="submit" class="btn-primary">Kaydet</button>
              <button type="button" @click="closeEditModal" class="btn-secondary">İptal</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useListingsStore } from '../store/listings'
import ImageUploader from '../components/ImageUploader.vue'

const listingsStore = useListingsStore()

// Filtreler
const filterCategory = ref('')
const filterType = ref('')

// Modal state
const showEditModal = ref(false)
const editingListing = ref({})

// Yeni ilan formu
const newListing = ref({
  title: '',
  location: '',
  category: '',
  transactionType: '',
  price: '',
  area: '',
  rooms: '',
  images: [],
  description: '',
  coordinates: {
    lat: '',
    lng: ''
  }
})

// Store'dan ilanları al
const listings = computed(() => listingsStore.listings)

// Filtrelenmiş ilanlar
const filteredListings = computed(() => {
  return listings.value.filter(listing => {
    const categoryMatch = !filterCategory.value || listing.category === filterCategory.value
    const typeMatch = !filterType.value || listing.transactionType === filterType.value
    return categoryMatch && typeMatch
  })
})

// İlan ekleme
const addListing = () => {
  const listing = {
    ...newListing.value,
    type: newListing.value.transactionType === 'sale' ? 'Satılık' : 'Kiralık',
    images: newListing.value.images.map(img => img.url) // Convert to simple URL array
  }
  
  listingsStore.addListing(listing)
  
  // Formu temizle
  newListing.value = {
    title: '',
    location: '',
    category: '',
    transactionType: '',
    price: '',
    area: '',
    rooms: '',
    images: [],
    description: '',
    coordinates: { lat: '', lng: '' }
  }
  
  alert('İlan başarıyla eklendi!')
}

// İlan düzenleme
const editListing = (listing) => {
  editingListing.value = { 
    ...listing,
    images: listing.images.map(url => ({ url, id: Date.now() + Math.random() }))
  }
  showEditModal.value = true
}

// Düzenlemeyi kaydet
const saveEdit = () => {
  const updatedListing = {
    ...editingListing.value,
    images: editingListing.value.images.map(img => img.url) // Convert to simple URL array
  }
  
  listingsStore.updateListing(editingListing.value.id, updatedListing)
  closeEditModal()
  alert('İlan başarıyla güncellendi!')
}

// Modal kapat
const closeEditModal = () => {
  showEditModal.value = false
  editingListing.value = {}
}

// İlan silme
const deleteListing = (id) => {
  if (confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
    listingsStore.deleteListing(id)
    alert('İlan başarıyla silindi!')
  }
}

// Fiyat güncelleme
const updatePrice = (id, newPrice) => {
  listingsStore.updatePrice(id, newPrice)
}

// Kategori adı
const getCategoryName = (category) => {
  const names = {
    apartment: 'Daire',
    shop: 'Dükkan',
    house: 'Ev'
  }
  return names[category] || category
}

// Kategori class
const getCategoryClass = (category) => {
  return `badge-${category}`
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #181818;
  color: #ffffff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.header {
  background: #2c2c2c;
  padding: 1rem 0;
  border-bottom: 2px solid #cd7f32;
  margin-bottom: 2rem;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  color: #cd7f32;
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #b0b0b0;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  color: #cd7f32;
  background: rgba(205, 127, 50, 0.1);
}

/* Sections */
section {
  background: #2c2c2c;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #404040;
}

section h2 {
  color: #cd7f32;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

/* Form */
.listing-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #cd7f32;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #404040;
  border-radius: 4px;
  background: #181818;
  color: #ffffff;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #cd7f32;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.coordinates-input {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Buttons */
.btn-primary {
  background: #cd7f32;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #b36628;
}

.btn-secondary {
  background: #404040;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #505050;
}

/* Filters */
.filters {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  color: #cd7f32;
  font-weight: 500;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #404040;
  border-radius: 4px;
  background: #181818;
  color: #ffffff;
}

/* Table */
.listings-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #404040;
}

th {
  background: #404040;
  color: #cd7f32;
  font-weight: 600;
}

.listing-thumb {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

/* Badges */
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-apartment {
  background: #4a90e2;
  color: #ffffff;
}

.badge-shop {
  background: #f39c12;
  color: #ffffff;
}

.badge-house {
  background: #27ae60;
  color: #ffffff;
}

.badge-sale {
  background: #e74c3c;
  color: #ffffff;
}

.badge-rent {
  background: #9b59b6;
  color: #ffffff;
}

/* Price Edit */
.price-edit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-input {
  width: 100px;
  padding: 0.25rem;
  border: 1px solid #404040;
  border-radius: 4px;
  background: #181818;
  color: #ffffff;
  font-size: 0.9rem;
}

.currency {
  color: #cd7f32;
  font-size: 0.9rem;
}

/* Actions */
.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit {
  background: #3498db;
  color: #ffffff;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.btn-edit:hover {
  background: #2980b9;
}

.btn-delete {
  background: #e74c3c;
  color: #ffffff;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  background: #c0392b;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #2c2c2c;
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #404040;
}

.modal h3 {
  color: #cd7f32;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .coordinates-input {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    padding: 1rem;
  }
}

.admin-title {
  color: #cd7f32;
  font-size: 2.2rem;
  margin: 2.5rem 0 2rem 0;
  text-align: center;
  font-weight: bold;
  letter-spacing: 1px;
}
</style> 