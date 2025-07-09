<template>
  <div class="admin-container">
    <div v-if="!isLoggedIn">
      <h2>Admin Girişi</h2>
      <form @submit.prevent="login">
        <input v-model="email" type="email" placeholder="E-posta" required />
        <input v-model="password" type="password" placeholder="Şifre" required />
        <button type="submit">Giriş Yap</button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
            </div>
    <div v-else>
      <h2>İlan Ekle</h2>
      <form @submit.prevent="addListing">
        <input v-model="title" placeholder="Başlık" required />
        <input v-model="location" placeholder="Konum" required />
        <select v-model="category" required>
          <option value="">Kategori Seç</option>
                <option value="apartment">Daire</option>
                <option value="shop">Dükkan</option>
                <option value="house">Ev</option>
              </select>
        <select v-model="transactionType" required>
          <option value="">İşlem Türü Seç</option>
                <option value="sale">Satılık</option>
                <option value="rent">Kiralık</option>
              </select>
        <input v-model.number="price" type="number" placeholder="Fiyat (TL)" required />
        <input v-model.number="area" type="number" placeholder="Alan (m²)" required />
        <input v-model.number="rooms" type="number" placeholder="Oda Sayısı" required />
        <textarea v-model="description" placeholder="Açıklama" required></textarea>
        <div style="margin-bottom:12px;">
          <label style="color:#cd7f32; font-weight:600; margin-bottom:4px; display:block;">Konum Seç (Harita)</label>
          <MapView 
            :selectable="true" 
            :onSelect="setCoordinates" 
            :selectedCoord="coordinates" 
            :center="{ lat: 36.5433, lng: 31.9973 }"
            :zoom="15"
            style="height:400px;" 
          />
          <div v-if="coordinates.lat && coordinates.lng" style="color:#fff; font-size:0.95em; margin-top:4px;">
            Seçilen Konum: {{ coordinates.lat.toFixed(5) }}, {{ coordinates.lng.toFixed(5) }}
            <br><small style="color:#ccc;">Alanya Cuma Pazarı merkezli başlatıldı</small>
          </div>
        </div>
        <ImageUploader v-model="images" :max-images="10" />
        <button type="submit">İlanı Kaydet</button>
        <transition name="fade">
          <p v-if="addSuccess" class="success-toast">İlan başarıyla yüklendi!</p>
        </transition>
        <p v-if="addError" class="error">{{ addError }}</p>
      </form>
      
      <div class="admin-actions">
        <h2>İşlemler</h2>
        <div class="action-buttons">
          <router-link to="/admin/manage-listings" class="action-btn manage-btn">
            📋 İlanları Yönet
          </router-link>
          <button @click="refreshStats" class="action-btn stats-btn">
            📊 İstatistikler
          </button>
        </div>
        
        <div v-if="stats" class="stats-section">
          <h3>Özet Bilgiler</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">Toplam İlan</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.sale }}</div>
              <div class="stat-label">Satılık</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.rent }}</div>
              <div class="stat-label">Kiralık</div>
            </div>
          </div>
        </div>
      </div>
      <button @click="logout">Çıkış Yap</button>
    </div>
  </div>
</template>

<script>
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, serverTimestamp, getDocs } from 'firebase/firestore';
import ImageUploader from '../components/ImageUploader.vue';
import MapView from '../components/MapView.vue';

export default {
  components: { ImageUploader, MapView },
  data() {
    return {
      email: '',
      password: '',
      isLoggedIn: false,
      error: '',
  title: '',
  location: '',
  category: '',
  transactionType: '',
  price: '',
  area: '',
  rooms: '',
      description: '',
      coordinates: { lat: '', lng: '' },
  images: [],
      addError: '',
      addSuccess: false,
      addSuccessTimeout: null,
      stats: null,
    };
  },
  methods: {
    async login() {
      this.error = '';
      if (this.email !== 'admin@property.com') {
        this.error = 'Sadece admin girişi yapılabilir.';
        return;
      }
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.isLoggedIn = true;
      } catch (e) {
        this.error = 'Giriş başarısız: ' + e.message;
      }
    },
    async logout() {
      await signOut(auth);
      this.isLoggedIn = false;
      this.email = '';
      this.password = '';
    },
    async addListing() {
      this.addError = '';
      this.addSuccess = false;
      
      // Cloudinary'den gelen resim URL'lerini al
      let imageUrls = [];
      if (this.images.length > 0) {
        imageUrls = this.images.map(img => img.url);
      }
      
      try {
        await addDoc(collection(db, 'listings'), {
          title: this.title,
          location: this.location,
          region: this.location, // Filtreleme için region alanı da ekleyelim
          category: this.category,
          propertyType: this.category, // Home.vue'daki filtreleme ile uyumlu
          transactionType: this.transactionType,
          price: this.price,
          area: this.area,
          rooms: this.rooms,
          description: this.description,
          coordinates: this.coordinates,
          images: imageUrls,
          createdAt: serverTimestamp(),
        });
        this.title = '';
        this.location = '';
        this.category = '';
        this.transactionType = '';
        this.price = '';
        this.area = '';
        this.rooms = '';
        this.description = '';
        this.coordinates = { lat: '', lng: '' };
        this.images = [];
        this.addSuccess = true;
        this.refreshStats(); // İstatistikleri güncelle
        if (this.addSuccessTimeout) clearTimeout(this.addSuccessTimeout);
        this.addSuccessTimeout = setTimeout(() => { this.addSuccess = false; }, 5000);
      } catch (e) {
        this.addError = 'İlan eklenemedi: ' + e.message;
      }
    },
    async refreshStats() {
      try {
        const querySnapshot = await getDocs(collection(db, 'listings'));
        const listings = querySnapshot.docs.map(doc => doc.data());
        
        this.stats = {
          total: listings.length,
          sale: listings.filter(l => l.transactionType === 'sale').length,
          rent: listings.filter(l => l.transactionType === 'rent').length
        };
      } catch (error) {
        console.error('İstatistikler yüklenemedi:', error);
        alert('İstatistikler yüklenirken hata oluştu.');
      }
    },
    setCoordinates(coord) {
      this.coordinates = coord;
    },
  },
};
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #333;
  border-radius: 16px;
  background: #2c2c2c;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}
input, textarea, select {
  display: block;
  width: 100%;
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #444;
  background: #181818;
  color: #fff;
}
input::placeholder, textarea::placeholder {
  color: #b0b0b0;
}
.coordinates-row {
  display: flex;
  gap: 8px;
}
button {
  padding: 8px 16px;
  border: none;
  background: #cd7f32;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 4px;
  font-weight: 600;
  transition: background 0.2s;
}
button:hover {
  background: #a86a28;
}
.error {
  color: #e74c3c;
  margin-top: 8px;
}
.success {
  color: #27ae60;
  margin-top: 8px;
}
.listings-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 32px;
  margin-bottom: 32px;
  background: #222;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.listings-table th, .listings-table td {
  border: 1px solid #333;
  padding: 8px;
  text-align: left;
  color: #fff;
}
.listings-table th {
  background: #181818;
  color: #cd7f32;
}
.images-list {
  display: flex;
  flex-wrap: wrap;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.success-toast {
  background: rgba(39, 174, 96, 0.85);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  margin: 16px 0 0 0;
  font-size: 1.1em;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(39,174,96,0.12);
  text-align: center;
  z-index: 10;
}

.admin-actions {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #333;
}

.admin-actions h2 {
  color: #cd7f32;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-size: 1rem;
}

.manage-btn {
  background: #cd7f32;
  color: #fff;
}

.manage-btn:hover {
  background: #a86828;
  transform: translateY(-2px);
}

.stats-btn {
  background: #3498db;
  color: #fff;
}

.stats-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.stats-section {
  margin-top: 2rem;
}

.stats-section h3 {
  color: #cd7f32;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #333;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #444;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #cd7f32;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #ccc;
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: 500;
}
</style> 