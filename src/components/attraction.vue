<template>
  <div class="attraction-card">
    <!-- 景點圖片 -->
    <div class="attraction-image-container">
      <img :src="attractionImage" :alt="attractionName" class="attraction-image" />
      <div class="collection-badge">
        <i class="fas fa-flag"></i>
        <span>{{ collectionText }}</span>
      </div>
    </div>

    <!-- 景點資訊 -->
    <div class="attraction-content">
      <!-- 景點名稱 -->
      <div class="attraction-header">
        <h3 class="attraction-name">{{ attractionName }}</h3>
        <button class="info-button" @click="handleInfo">
          <i class="fas fa-info-circle"></i>
        </button>
      </div>

      <!-- 標籤 -->
      <div class="tags-container">
        <span 
          v-for="(tag, index) in tags" 
          :key="index" 
          class="tag"
        >
          {{ tag }}
        </span>
      </div>

      <!-- 地點 -->
      <div class="location">
        <i class="fas fa-map-marker-alt location-icon"></i>
        <span class="location-text">{{ location }}</span>
      </div>

      <!-- 加入景點庫按鈕 -->
      <button class="add-button" @click="handleAddToCollection">
        加入景點庫
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Props 定義（如果需要從父組件傳入）
const props = defineProps({
    attractionImage: {
        type: String,
        default: 'https://www.travel.taipei/image/64607'
    },
    attractionName: {
        type: String,
        default: '臺北 101'
    },
    collectionText: {
        type: String,
        default: '蒐藏最多'
    },
    tags: {
        type: Array,
        default: () => ['全台最高', '夜景佳', '奢華體驗']
    },
    location: {
        type: String,
        default: '台北信義'
    }
});

// 資訊按鈕點擊事件
const handleInfo = () => {
  alert(`查看 ${props.attractionName} 的詳細資訊`);
};

// 加入景點庫按鈕點擊事件
const handleAddToCollection = () => {
  alert(`已將 ${props.attractionName} 加入景點庫！`);
};
</script>

<style scoped>
@import '@/assets/main.css';

.attraction-card {
  width: 250px;
  background-color: var(--bg-white);
  border-radius: var(--radius-large);
  overflow: hidden;
  box-shadow: var(--shadow-medium);
  font-family: 'Noto Sans TC', sans-serif;
  margin: 1em auto;
}

/* 景點圖片 */
.attraction-image-container {
  position: relative;
  width: 100%;
  height: 170px;
  overflow: hidden;
}

.attraction-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collection-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: var(--bg-white);
  padding: 4px 10px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: var(--shadow-light);
}

.collection-badge i {
  color: var(--accent-coral);
  font-size: 12px;
}

.collection-badge span {
  color: var(--text-brown);
  font-size: 13px;
  font-weight: 500;
}

/* 景點內容 */
.attraction-content {
  padding: 0.8em;
}

.attraction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.attraction-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-brown);
  margin: 0;
}

.info-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: transparent;
  border: 2px solid var(--text-brown);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.info-button:hover {
  background-color: var(--text-brown);
}

.info-button:hover i {
  color: var(--bg-white);
}

.info-button:active {
  transform: scale(0.95);
}

.info-button i {
  color: var(--text-brown);
  font-size: 20px;
  transition: color 0.3s ease;
}

/* 標籤 */
.tags-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 0 8px 0;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--border-light) transparent;
}

/* 自訂標籤滾動條樣式 (Webkit) */
.tags-container::-webkit-scrollbar {
  height: 4px;
}

.tags-container::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
}

.tags-container::-webkit-scrollbar-thumb {
  background-color: var(--border-light);
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

.tags-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--border-medium);
}

.tag {
  background-color: var(--tag-orange);
  color: var(--bg-white);
  padding: 2px 10px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 地點 */
.location {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 16px;
}

.location-icon {
  color: var(--accent-coral);
}

.location-text {
  color: var(--text-brown);
  font-weight: 500;
}

/* 加入景點庫按鈕 */
.add-button {
  width: 100%;
  padding: 10px;
  background-color: var(--text-brown);
  color: var(--bg-white);
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Noto Sans TC', sans-serif;
}

.add-button:hover {
  background-color: var(--primary-brown-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.add-button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-light);
}
</style>