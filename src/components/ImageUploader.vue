<template>
  <div class="image-uploader">
    <div class="upload-header">
      <h3>Resim Yükleme</h3>
      <span class="upload-count">{{ uploadedImages.length }} / {{ maxImages }}</span>
    </div>
    
    <!-- Upload Area -->
    <div 
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'disabled': uploadedImages.length >= maxImages || uploading }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <div class="upload-content" v-if="uploadedImages.length === 0 && !uploading">
        <div class="upload-icon">📷</div>
        <p>Resimleri buraya sürükleyin veya tıklayın</p>
        <p class="upload-hint">Maksimum {{ maxImages }} resim yükleyebilirsiniz</p>
        <p class="upload-hint">Cloudinary ile otomatik optimizasyon</p>
      </div>
      
      <div class="upload-content" v-else-if="uploadedImages.length < maxImages && !uploading">
        <div class="upload-icon">➕</div>
        <p>Daha fazla resim ekleyin</p>
        <p class="upload-hint">{{ maxImages - uploadedImages.length }} resim daha ekleyebilirsiniz</p>
      </div>
      
      <div class="upload-content" v-else-if="uploading">
        <div class="upload-icon">⏳</div>
        <p>Resimler Cloudinary'ye yükleniyor...</p>
        <p class="upload-hint">Lütfen bekleyin</p>
      </div>
      
      <div class="upload-content" v-else>
        <div class="upload-icon">✅</div>
        <p>Maksimum resim sayısına ulaştınız</p>
      </div>
    </div>
    
    <!-- Hidden File Input -->
    <input 
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      @change="handleFileSelect"
      style="display: none"
    >
    
    <!-- Upload Progress -->
    <div class="upload-progress" v-if="uploading">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <span class="progress-text">{{ currentUploadFile }} ({{ uploadProgress }}%)</span>
    </div>
    
    <!-- Upload Error -->
    <div class="upload-error" v-if="uploadError">
      <p>❌ {{ uploadError }}</p>
      <button @click="uploadError = ''" class="retry-btn">Tamam</button>
    </div>
    
    <!-- Uploaded Images Grid -->
    <div class="images-grid" v-if="uploadedImages.length > 0">
      <div 
        v-for="(image, index) in uploadedImages" 
        :key="index"
        class="image-item"
      >
        <img :src="image.thumbnail || image.url" :alt="`Resim ${index + 1}`">
        <div class="image-overlay">
          <button @click="removeImage(index)" class="remove-btn" title="Resmi Kaldır">
            ×
          </button>
          <button @click="moveImage(index, -1)" class="move-btn prev" title="Önceki" v-if="index > 0">
            ‹
          </button>
          <button @click="moveImage(index, 1)" class="move-btn next" title="Sonraki" v-if="index < uploadedImages.length - 1">
            ›
          </button>
        </div>
        <div class="image-number">{{ index + 1 }}</div>
        <div class="image-info" v-if="image.publicId">
          <small>{{ formatFileSize(image.bytes) }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { uploadImageToCloudinary, getThumbnailUrl } from '../utils/cloudinary.js'

// Props
const props = defineProps({
  maxImages: {
    type: Number,
    default: 20
  },
  modelValue: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Refs
const fileInput = ref(null)
const isDragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const currentUploadFile = ref('')
const uploadError = ref('')

// Computed
const uploadedImages = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const triggerFileInput = () => {
  if (uploadedImages.value.length >= props.maxImages || uploading.value) return
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  processFiles(files)
  event.target.value = '' // Reset input
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  if (uploadedImages.value.length >= props.maxImages || uploading.value) return
  
  const files = Array.from(event.dataTransfer.files)
  processFiles(files)
}

const handleDragOver = (event) => {
  event.preventDefault()
  if (uploadedImages.value.length < props.maxImages && !uploading.value) {
    isDragOver.value = true
  }
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragOver.value = false
}

const processFiles = async (files) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  const remainingSlots = props.maxImages - uploadedImages.value.length
  
  if (imageFiles.length === 0) {
    uploadError.value = 'Lütfen sadece resim dosyaları seçin.'
    return
  }
  
  if (imageFiles.length > remainingSlots) {
    uploadError.value = `Sadece ${remainingSlots} resim daha ekleyebilirsiniz.`
    imageFiles.splice(remainingSlots)
  }
  
  // Dosya boyutu kontrolü (10MB limit)
  const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024)
  if (oversizedFiles.length > 0) {
    uploadError.value = 'Resim dosyaları 10MB\'dan küçük olmalıdır.'
    return
  }
  
  uploading.value = true
  uploadProgress.value = 0
  uploadError.value = ''
  
  try {
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      currentUploadFile.value = `${file.name} (${i + 1}/${imageFiles.length})`
      
      // Cloudinary'ye yükle
      const result = await uploadImageToCloudinary(file)
      
      // Thumbnail URL'si oluştur
      const thumbnail = getThumbnailUrl(result.publicId, 150)
      
      const newImage = {
        id: Date.now() + i,
        url: result.url,
        publicId: result.publicId,
        thumbnail: thumbnail,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        name: file.name
      }
      
      uploadedImages.value = [...uploadedImages.value, newImage]
      
      // Progress güncelle
      uploadProgress.value = Math.round(((i + 1) / imageFiles.length) * 100)
    }
  } catch (error) {
    console.error('Upload error:', error)
    uploadError.value = 'Resim yükleme başarısız: ' + error.message
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    currentUploadFile.value = ''
  }
}

const removeImage = (index) => {
  const newImages = [...uploadedImages.value]
  newImages.splice(index, 1)
  uploadedImages.value = newImages
}

const moveImage = (index, direction) => {
  const newImages = [...uploadedImages.value]
  const newIndex = index + direction
  
  if (newIndex >= 0 && newIndex < newImages.length) {
    const temp = newImages[index]
    newImages[index] = newImages[newIndex]
    newImages[newIndex] = temp
    uploadedImages.value = newImages
  }
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.upload-header h3 {
  color: #cd7f32;
  margin: 0;
}

.upload-count {
  color: #b0b0b0;
  font-size: 0.9rem;
}

.upload-area {
  border: 2px dashed #404040;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.upload-area:hover:not(.disabled) {
  border-color: #cd7f32;
  background: rgba(205, 127, 50, 0.05);
}

.upload-area.drag-over {
  border-color: #cd7f32;
  background: rgba(205, 127, 50, 0.1);
}

.upload-area.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-content {
  color: #b0b0b0;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-hint {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.5rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #404040;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #e74c3c;
  color: #ffffff;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #c0392b;
  transform: scale(1.1);
}

.move-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.move-btn:hover {
  background: #cd7f32;
}

.move-btn.prev {
  left: 5px;
}

.move-btn.next {
  right: 5px;
}

.image-number {
  position: absolute;
  bottom: 5px;
  left: 5px;
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.image-info {
  position: absolute;
  bottom: 5px;
  left: 5px;
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  opacity: 0.8;
}

.upload-progress {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #404040;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #cd7f32;
  transition: width 0.3s ease;
}

.progress-text {
  color: #b0b0b0;
  font-size: 0.9rem;
  min-width: 40px;
}

.upload-error {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f44336;
  color: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.retry-btn {
  background-color: #4CAF50;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background-color: #388E3C;
}

/* Responsive */
@media (max-width: 768px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.5rem;
  }
  
  .upload-area {
    padding: 1rem;
  }
  
  .upload-icon {
    font-size: 2rem;
  }
}
</style> 