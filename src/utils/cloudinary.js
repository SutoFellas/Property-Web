// Cloudinary yapılandırması ve yardımcı fonksiyonlar

// Cloudinary ayarları - gerçek proje bilgileri
const CLOUDINARY_CONFIG = {
  cloudName: 'dqvquateg', // Cloudinary dashboard'dan alındı
  uploadPreset: 'emlak-preset', // Unsigned upload preset
  apiKey: '126619239484859', // İsteğe bağlı, client-side için gerekli değil
  folder: 'emlak-listings' // Resimlerin yükleneceği klasör
};

// Cloudinary URL'si
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;

/**
 * Resmi Cloudinary'ye yükler
 * @param {File} file - Yüklenecek resim dosyası
 * @param {Function} onProgress - İlerleme callback'i (opsiyonel)
 * @returns {Promise<Object>} Cloudinary response
 */
export const uploadImageToCloudinary = async (file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', CLOUDINARY_CONFIG.folder);
  
  // Resim optimizasyonu parametreleri - yüksek kalite
  formData.append('quality', '90'); // Yüksek kalite (90%)
  formData.append('fetch_format', 'auto'); // Otomatik format seçimi (WebP vs. JPEG)
  formData.append('flags', 'progressive'); // Progresif yükleme
  formData.append('fl_lossy', 'false'); // Kayıpsız sıkıştırma
  
  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Cloudinary'den resmi siler
 * @param {string} publicId - Silinecek resmin public ID'si
 * @returns {Promise<boolean>} Silme başarılı mı
 */
export const deleteImageFromCloudinary = async (publicId) => {
  // Not: Client-side'dan silme işlemi için genellikle backend endpoint'i kullanılır
  // Çünkü API secret gereklidir. Şimdilik frontend'de sadece URL'yi kaldıracağız.
  console.warn('Image deletion should be handled by backend for security');
  return true;
};

/**
 * Cloudinary URL'sini optimizasyonla birlikte döndürür
 * @param {string} publicId - Resmin public ID'si
 * @param {Object} options - Optimizasyon seçenekleri
 * @returns {string} Optimize edilmiş resim URL'si
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    crop = 'fill',
    quality = '85', // Varsayılan yüksek kalite
    format = 'auto'
  } = options;
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/c_${crop},w_${width},h_${height},q_${quality},f_${format},fl_progressive/${publicId}`;
};

/**
 * Thumbnail URL'si oluşturur
 * @param {string} publicId - Resmin public ID'si
 * @param {number} size - Thumbnail boyutu (piksel)
 * @returns {string} Thumbnail URL'si
 */
export const getThumbnailUrl = (publicId, size = 150) => {
  return getOptimizedImageUrl(publicId, {
    width: size,
    height: size,
    crop: 'thumb',
    quality: '80', // Thumbnail için yüksek kalite
    format: 'auto'
  });
};

export default CLOUDINARY_CONFIG; 