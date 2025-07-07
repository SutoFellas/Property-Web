<template>
  <div class="contact-container">
    <h1>İletişim</h1>
    <p class="contact-desc">
      Siz de ilan vermek isterseniz veya mevcut ilanlarımız hakkında bilgi almak için aşağıdaki iletişim kanallarımızdan bize ulaşabilirsiniz. Ekibimiz en kısa sürede size dönüş yapacaktır.
    </p>
    <div class="contact-info">
      <div class="contact-row">
        <span class="contact-icon">📞</span>
        <span class="contact-label">Telefon:</span>
        <a href="tel:+905555555555" class="contact-link">+90 555 555 55 55</a>
      </div>
      <div class="contact-row">
        <span class="contact-icon">📧</span>
        <span class="contact-label">E-posta:</span>
        <a href="mailto:info@utkuproperty.com" class="contact-link">info@utkuproperty.com</a>
      </div>
      <div class="contact-row">
        <span class="contact-icon">📱</span>
        <span class="contact-label">WhatsApp:</span>
        <a href="https://wa.me/905555555555" target="_blank" class="contact-link">+90 555 555 55 55</a>
      </div>
      <div class="contact-row">
        <span class="contact-icon">📸</span>
        <span class="contact-label">Instagram:</span>
        <a href="https://instagram.com/utkuproperty" target="_blank" class="contact-link">@utkuproperty</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-container {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2.5rem 2rem;
  background: #181818;
  border-radius: 18px;
  box-shadow: 0 0 32px #000a;
  color: #fff;
}

.contact-container h1 {
  color: #cd7f32;
  font-size: 2.2rem;
  margin-bottom: 2.5rem;
  text-align: center;
}

.contact-desc {
  font-size: 1.13rem;
  margin-bottom: 2.2rem;
  color: #e0e0e0;
  text-align: center;
  line-height: 1.7;
}

.contact-info {
  background: #232323;
  border-radius: 8px;
  padding: 2rem 1.5rem;
  margin-top: 0.5rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.15rem;
}

.contact-icon {
  font-size: 1.5rem;
  color: #cd7f32;
}

.contact-label {
  min-width: 90px;
  color: #fff;
  font-weight: 500;
}

.contact-link {
  color: #cd7f32;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.contact-link:hover {
  color: #fff;
  text-decoration: underline;
}

@media (max-width: 600px) {
  .contact-container {
    margin: 1rem;
    padding: 1.2rem 0.7rem;
    font-size: 0.98rem;
  }
  
  .contact-container h1 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }
  
  .contact-desc {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .contact-info {
    padding: 1rem 0.8rem;
    gap: 1rem;
  }
  
  .contact-row {
    font-size: 1rem;
    gap: 0.7rem;
  }
  
  .contact-label {
    min-width: 70px;
  }
}
</style> 