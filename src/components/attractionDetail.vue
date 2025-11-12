<template>
  <div class="modal-overlay" @click.self="handleClose" v-if="isVisible">
    <div class="detail-modal">
      <button class="close-button" @click="handleClose">
        <i class="fas fa-times"></i>
      </button>

      <div class="detail-content" v-if="attractionData">
        <!-- 景點圖片 -->
        <div class="detail-image-container">
          <img 
            :src="attractionData.main_image_url" 
            :alt="attractionData.name" 
            class="detail-image" 
          />
        </div>

        <!-- 景點資訊 -->
        <div class="detail-info">
          <!-- 景點名稱 -->
          <h2 class="detail-name">{{ attractionData.name }}</h2>

          <!-- 標籤 -->
          <div class="tags-container">
            <span 
              v-for="(tag, index) in attractionData.tags" 
              :key="index" 
              class="tag"
            >
              {{ tag }}
            </span>
          </div>

          <!-- 地址 -->
          <div class="address-section" @click="openGoogleMaps">
            <i class="fas fa-map-marker-alt address-icon"></i>
            <span class="address-text">{{ getLocationText() }}</span>
          </div>

          <!-- 描述 -->
          <div class="description-section">
            <p class="description-text">{{ attractionData.description }}</p>
          </div>

          <!-- 加入景點庫按鈕 -->
          <button 
            class="add-button" 
            @click="handleAddToCollection"
            :disabled="isLoading"
            :class="{ 'button-loading': isLoading }"
          >
            <span>{{ isFavorite ? '從景點庫移除' : '加入景點庫' }}</span>
            <i class="fas fa-spinner fa-spin spinner-small" :class="{ 'visible': isLoading }"></i>
          </button>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-else class="loading">
        <p>載入中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props 定義
const props = defineProps({
  attractionData: {
    type: [Object, null],
    required: false,
    default: null
  },
  isVisible: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

// Emit 定義
const emit = defineEmits(['close', 'addToCollection']);

// 取得地點文字
const getLocationText = () => {
  if (!props.attractionData) return '';
  const { city, town, address } = props.attractionData;
  // 優先使用完整地址，如果沒有則組合 city 和 town
  if (address) return address;
  return town ? `${city}${town}` : city || '';
};

// 開啟 Google Maps
const openGoogleMaps = () => {
  const name = encodeURIComponent(props.attractionData.name);

  // 使用地址搜尋 Google Maps
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${name}`;
  window.open(googleMapsUrl, '_blank');
};

// 關閉視窗
const handleClose = () => {
  emit('close');
};

// 加入景點庫
const handleAddToCollection = () => {
  emit('addToCollection');
};
</script>

<style scoped>
@import '@/assets/main.css';

/* 遮罩層 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

/* 浮動視窗 */
.detail-modal {
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  background-color: var(--bg-beige, #FAF3E0);
  border-radius: var(--radius-large, 20px);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 關閉按鈕 */
.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.close-button:hover {
  background-color: var(--text-brown, #5C4033);
  transform: rotate(90deg);
}

.close-button:hover i {
  color: var(--bg-white, #FFFFFF);
}

.close-button i {
  color: var(--text-brown, #5C4033);
  font-size: 18px;
  transition: color 0.3s ease;
}

/* 內容區域 */
.detail-content {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 90vh;
  scrollbar-width: thin;
  scrollbar-color: var(--border-light, #E5D4C1) transparent;
}

.detail-content::-webkit-scrollbar {
  width: 6px;
}

.detail-content::-webkit-scrollbar-track {
  background: transparent;
}

.detail-content::-webkit-scrollbar-thumb {
  background-color: var(--border-light, #E5D4C1);
  border-radius: 10px;
}

/* 景點圖片 */
.detail-image-container {
  position: relative;
  width: 100%;
  height: 350px;
  overflow: hidden;
  flex-shrink: 0;
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 資訊區域 */
.detail-info {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-name {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-brown, #5C4033);
  margin: 0;
  text-align: left;
  line-height: 1.3;
}

/* 標籤 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  background-color: var(--tag-orange, #FF8C42);
  color: var(--bg-white, #FFFFFF);
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
}

/* 地址 */
.address-section {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid var(--border-light, #E5D4C1);
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 0 -12px;
}

.address-section:hover {
  background-color: rgba(255, 107, 107, 0.08);
}

.address-section:active {
  background-color: rgba(255, 107, 107, 0.15);
}

.address-icon {
  color: var(--accent-coral, #FF6B6B);
  font-size: 18px;
  margin-top: 2px;
  flex-shrink: 0;
}

.address-text {
  color: var(--text-brown, #5C4033);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  flex: 1;
}

/* 描述 */
.description-section {
  padding: 8px 0;
}

.description-text {
  color: var(--text-brown, #5C4033);
  font-size: 15px;
  line-height: 1.8;
  margin: 0;
  text-align: justify;
}

/* 加入景點庫按鈕 */
.add-button {
  width: 100%;
  height: 50px;
  padding: 0 14px;
  background-color: var(--text-brown, #5C4033);
  color: var(--bg-white, #FFFFFF);
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  font-family: 'Noto Sans TC', sans-serif;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-button:not(:disabled):hover {
  background-color: var(--primary-brown-dark, #4A3227);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(92, 64, 51, 0.3);
}

.add-button:not(:disabled):active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(92, 64, 51, 0.2);
}

.add-button:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.add-button.button-loading {
  pointer-events: none;
}

.add-button span {
  display: inline-block;
}

.add-button .spinner-small {
  font-size: 16px;
  margin-left: 8px;
  display: inline-block;
  opacity: 0;
  width: 0;
  transition: opacity 0.2s ease, width 0.2s ease;
}

.add-button .spinner-small.visible {
  opacity: 1;
  width: 16px;
}

/* 載入中 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.loading p {
  color: var(--text-brown, #5C4033);
  font-size: 18px;
  font-weight: 500;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .detail-modal {
    max-width: 95%;
  }

  .detail-image-container {
    height: 250px;
  }

  .detail-name {
    font-size: 26px;
  }

  .detail-info {
    padding: 20px;
  }

  .match-badge {
    top: 16px;
    right: 16px;
    padding: 6px 12px;
  }

  .match-badge span {
    font-size: 14px;
  }
}
</style>