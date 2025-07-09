<template>
  <div class="manage-listings">
    <div class="header">
      <h1>İlan Yönetimi</h1>
      <div class="header-actions">
        <router-link to="/admin" class="btn btn-secondary">← Admin Paneline Dön</router-link>
        <button @click="refreshListings" class="btn btn-primary">🔄 Yenile</button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>İlanlar yükleniyor...</p>
    </div>

    <!-- İlan listesi -->
    <div v-else-if="listings.length > 0" class="listings-container">
      <div class="listings-count">
        <span>Toplam {{ listings.length }} ilan bulundu</span>
      </div>

      <div class="listings-grid">
        <div v-for="listing in listings" :key="listing.id" class="listing-card">
          <!-- İlan Resmi -->
          <div class="listing-image">
            <img 
              :src="listing.images && listing.images.length > 0 ? listing.images[0] : '/placeholder.jpg'" 
              :alt="listing.title"
            />
            <div class="image-count" v-if="listing.images && listing.images.length > 1">
              +{{ listing.images.length - 1 }} resim
            </div>
          </div>

          <!-- İlan Bilgileri -->
          <div class="listing-info">
            <div class="listing-header">
              <h3>{{ listing.title }}</h3>
              <span :class="['badge', listing.transactionType === 'sale' ? 'badge-sale' : 'badge-rent']">
                {{ listing.transactionType === 'sale' ? 'Satılık' : 'Kiralık' }}
              </span>
            </div>

            <div class="listing-details">
              <div class="detail-row">
                <span class="label">Konum:</span>
                <span class="value">{{ listing.location }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Kategori:</span>
                <span class="value">{{ getCategoryName(listing.category) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Fiyat:</span>
                <span class="value price">{{ formatPrice(listing.price) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Alan:</span>
                <span class="value">{{ listing.area }} m²</span>
              </div>
              <div class="detail-row">
                <span class="label">Oda:</span>
                <span class="value">{{ listing.rooms }} oda</span>
              </div>
              <div class="detail-row" v-if="listing.coordinates">
                <span class="label">Koordinat:</span>
                <span class="value coordinates">{{ listing.coordinates.lat.toFixed(4) }}, {{ listing.coordinates.lng.toFixed(4) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Tarih:</span>
                <span class="value">{{ formatDate(listing.createdAt) }}</span>
              </div>
            </div>

            <!-- Açıklama -->
            <div class="listing-description">
              <p>{{ listing.description }}</p>
            </div>

            <!-- Eylemler -->
            <div class="listing-actions">
              <button @click="editListing(listing)" class="btn btn-edit">✏️ Düzenle</button>
              <button @click="viewListing(listing.id)" class="btn btn-view">👁️ Görüntüle</button>
              <button @click="deleteListing(listing)" class="btn btn-delete">🗑️ Sil</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Boş durum -->
    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <h2>Henüz ilan bulunmuyor</h2>
      <p>İlk ilanınızı eklemek için admin paneline gidin.</p>
      <router-link to="/admin" class="btn btn-primary">İlan Ekle</router-link>
    </div>

    <!-- Düzenleme Modal -->
    <div v-if="editingListing" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>İlan Düzenle</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>

        <form @submit.prevent="saveChanges" class="edit-form">
          <div class="form-group">
            <label>Başlık</label>
            <input v-model="editForm.title" type="text" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Konum</label>
              <input v-model="editForm.location" type="text" required />
            </div>
            <div class="form-group">
              <label>Kategori</label>
              <select v-model="editForm.category" required>
                <option value="apartment">Daire</option>
                <option value="shop">Dükkan</option>
                <option value="house">Ev</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>İşlem Türü</label>
              <select v-model="editForm.transactionType" required>
                <option value="sale">Satılık</option>
                <option value="rent">Kiralık</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fiyat (TL)</label>
              <input v-model.number="editForm.price" type="number" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Alan (m²)</label>
              <input v-model.number="editForm.area" type="number" required />
            </div>
            <div class="form-group">
              <label>Oda Sayısı</label>
              <input v-model.number="editForm.rooms" type="number" required />
            </div>
          </div>

          <div class="form-group">
            <label>Açıklama</label>
            <textarea v-model="editForm.description" rows="4"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">İptal</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Kaydediliyor...' : 'Kaydet' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'

export default {
  name: 'ManageListings',
  data() {
    return {
      listings: [],
      loading: true,
      editingListing: null,
      editForm: {},
      saving: false
    }
  },
  async mounted() {
    await this.fetchListings()
  },
  methods: {
    async fetchListings() {
      this.loading = true
      try {
        const querySnapshot = await getDocs(collection(db, 'listings'))
        this.listings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('İlanlar yüklenemedi:', error)
        alert('İlanlar yüklenirken hata oluştu.')
      } finally {
        this.loading = false
      }
    },
    
    async refreshListings() {
      await this.fetchListings()
    },

    getCategoryName(category) {
      const names = {
        apartment: 'Daire',
        shop: 'Dükkan',
        house: 'Ev'
      }
      return names[category] || category
    },

    formatPrice(price) {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(price)
    },

    formatDate(timestamp) {
      if (!timestamp) return ''
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('tr-TR')
      }
      return new Date(timestamp).toLocaleDateString('tr-TR')
    },

    editListing(listing) {
      this.editingListing = listing
      this.editForm = {
        title: listing.title,
        location: listing.location,
        category: listing.category,
        transactionType: listing.transactionType,
        price: listing.price,
        area: listing.area,
        rooms: listing.rooms,
        description: listing.description
      }
    },

    closeModal() {
      this.editingListing = null
      this.editForm = {}
      this.saving = false
    },

    async saveChanges() {
      if (!this.editingListing) return
      
      this.saving = true
      try {
        const docRef = doc(db, 'listings', this.editingListing.id)
        await updateDoc(docRef, {
          title: this.editForm.title,
          location: this.editForm.location,
          region: this.editForm.location,
          category: this.editForm.category,
          propertyType: this.editForm.category,
          transactionType: this.editForm.transactionType,
          price: this.editForm.price,
          area: this.editForm.area,
          rooms: this.editForm.rooms,
          description: this.editForm.description
        })
        
        // Local listeyi güncelle
        const index = this.listings.findIndex(l => l.id === this.editingListing.id)
        if (index !== -1) {
          this.listings[index] = { ...this.listings[index], ...this.editForm }
        }
        
        this.closeModal()
        alert('İlan başarıyla güncellendi!')
      } catch (error) {
        console.error('Güncelleme hatası:', error)
        alert('Güncelleme sırasında hata oluştu.')
      } finally {
        this.saving = false
      }
    },

    async deleteListing(listing) {
      if (!confirm(`"${listing.title}" ilanını silmek istediğinizden emin misiniz?`)) {
        return
      }

      try {
        await deleteDoc(doc(db, 'listings', listing.id))
        this.listings = this.listings.filter(l => l.id !== listing.id)
        alert('İlan başarıyla silindi!')
      } catch (error) {
        console.error('Silme hatası:', error)
        alert('Silme sırasında hata oluştu.')
      }
    },

    viewListing(listingId) {
      this.$router.push(`/listing/${listingId}`)
    }
  }
}
</script>

<style scoped>
.manage-listings {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #1a1a1a;
  min-height: 100vh;
  color: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.header h1 {
  color: #cd7f32;
  font-size: 2rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #cd7f32;
  color: #fff;
}

.btn-primary:hover {
  background: #a86828;
}

.btn-secondary {
  background: #444;
  color: #fff;
}

.btn-secondary:hover {
  background: #555;
}

.btn-edit {
  background: #3498db;
  color: #fff;
  font-size: 0.9rem;
  padding: 0.5rem 0.8rem;
}

.btn-edit:hover {
  background: #2980b9;
}

.btn-view {
  background: #27ae60;
  color: #fff;
  font-size: 0.9rem;
  padding: 0.5rem 0.8rem;
}

.btn-view:hover {
  background: #219a52;
}

.btn-delete {
  background: #e74c3c;
  color: #fff;
  font-size: 0.9rem;
  padding: 0.5rem 0.8rem;
}

.btn-delete:hover {
  background: #c0392b;
}

.loading-section {
  text-align: center;
  padding: 4rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #444;
  border-top: 3px solid #cd7f32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.listings-count {
  margin-bottom: 1.5rem;
  color: #ccc;
  font-size: 0.95rem;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.listing-card {
  background: #2c2c2c;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #333;
  transition: transform 0.2s, box-shadow 0.2s;
}

.listing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}

.listing-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.listing-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-count {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.8);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.listing-info {
  padding: 1.5rem;
}

.listing-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.listing-header h3 {
  color: #cd7f32;
  font-size: 1.3rem;
  margin: 0;
  flex: 1;
}

.badge {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-sale {
  background: #e74c3c;
  color: #fff;
}

.badge-rent {
  background: #9b59b6;
  color: #fff;
}

.listing-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-row .label {
  color: #aaa;
  font-weight: 500;
}

.detail-row .value {
  color: #fff;
  font-weight: 600;
}

.detail-row .price {
  color: #cd7f32;
  font-size: 1.1rem;
}

.detail-row .coordinates {
  font-family: monospace;
  font-size: 0.9rem;
}

.listing-description {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #222;
  border-radius: 6px;
  border-left: 3px solid #cd7f32;
}

.listing-description p {
  margin: 0;
  color: #ddd;
  line-height: 1.5;
}

.listing-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #cd7f32;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #aaa;
  margin-bottom: 2rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #2c2c2c;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
}

.modal-header h3 {
  color: #cd7f32;
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
}

.close-btn:hover {
  background: #444;
  border-radius: 50%;
}

.edit-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #cd7f32;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #444;
  border-radius: 6px;
  background: #1a1a1a;
  color: #fff;
  font-size: 0.95rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #cd7f32;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
}

/* Responsive */
@media (max-width: 768px) {
  .manage-listings {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .listings-grid {
    grid-template-columns: 1fr;
  }
  
  .listing-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style> 