# Cloudinary Kurulum Talimatları

## 1. Cloudinary Hesabı Oluştur

1. [cloudinary.com](https://cloudinary.com) adresine git
2. "Sign Up For Free" butonuna tıkla
3. Email ile ücretsiz hesap oluştur

## 2. Dashboard Bilgilerini Al

1. Cloudinary Dashboard'a giriş yap
2. "Dashboard" sayfasında şu bilgileri kopyala:
   - **Cloud Name** (örn: `dj3k4j5k6`)
   - **API Key** (örn: `123456789012345`)
   - **API Secret** (gizli, sadece backend için)

## 3. Upload Preset Oluştur

1. Dashboard'da "Settings" > "Upload" bölümüne git
2. "Upload presets" kısmında "Add upload preset" butonuna tıkla
3. Şu ayarları yap:
   - **Preset name**: `emlak-preset`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `emlak-listings`
   - **Format**: `Auto`
   - **Quality**: `Auto`
   - **Resource Type**: `Image`
4. "Save" butonuna tıkla

## 4. Proje Yapılandırması

`src/utils/cloudinary.js` dosyasında şu satırları güncelle:

```javascript
const CLOUDINARY_CONFIG = {
  cloudName: 'BURAYA_CLOUD_NAME_YAZ', // Dashboard'dan aldığın Cloud Name
  uploadPreset: 'emlak-preset', // Yukarıda oluşturduğun preset adı
  apiKey: 'BURAYA_API_KEY_YAZ', // Dashboard'dan aldığın API Key (opsiyonel)
  folder: 'emlak-listings' // Resimlerin yükleneceği klasör
};
```

## 5. Test Et

1. Admin paneline giriş yap (`admin@property.com` / `admin123`)
2. Yeni ilan ekle ve resim yükle
3. Resimlerin Cloudinary'ye yüklendiğini kontrol et

## 6. Ücretsiz Limitler

- **Depolama**: 25 GB
- **Bandwidth**: 25 GB/ay
- **Dönüşümler**: 25,000/ay
- **API Çağrıları**: 1,000/ay

## 7. Avantajlar

✅ Otomatik resim optimizasyonu  
✅ WebP/AVIF format desteği  
✅ Otomatik kalite ayarı  
✅ Thumbnail oluşturma  
✅ CDN hızlandırma  
✅ Responsive resimler  

## 8. Sorun Giderme

- **Upload hatası**: Upload preset'in "Unsigned" olduğunu kontrol et
- **CORS hatası**: Cloudinary otomatik CORS desteği sağlar
- **Resim görünmüyor**: URL'lerin doğru olduğunu kontrol et

## 9. İleri Düzey Ayarlar

Daha fazla optimizasyon için:
- Auto format (WebP/AVIF)
- Auto quality
- Responsive breakpoints
- Lazy loading 