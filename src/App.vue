<script>
import logo from './assets/Opera Anlık Görüntü_2025-07-08_001832_www.instagram.com.png'
export default {
  name: 'App',
  data() {
    return { logo }
  }
}
</script>

<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand nav-logo">
          <img :src="logo" alt="Utku Property Logo" class="logo-img" />
          <h1>UTKU PROPERTY</h1>
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Ana Sayfa</router-link>
          <router-link to="/hakkimizda" class="nav-link">Hakkımızda</router-link>
          <router-link to="/iletisim" class="nav-link">İletişim</router-link>
          <router-link to="/admin" class="nav-link">Admin</router-link>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #181818;
  color: #ffffff;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  text-decoration: none;
}

.logo-img {
  height: 38px;
  width: 38px;
  border-radius: 8px;
  object-fit: cover;
  background: #fff;
  border: 2px solid #cd7f32;
}

.nav-brand h1 {
  color: #cd7f32;
  font-size: 2rem;
  font-weight: bold;
  text-decoration: none;
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: #cd7f32;
  color: #fff;
}

.nav-link.router-link-active {
  background-color: #cd7f32;
  color: #fff;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>
