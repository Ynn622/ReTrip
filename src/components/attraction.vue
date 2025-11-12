<template>
  <div>
    <div class="attraction-card" v-if="attractionData">
      <!-- 景點圖片 -->
      <div class="attraction-image-container">
        <img :src="attractionData.main_image_url" :alt="attractionData.name" class="attraction-image" />
        <div class="collection-badge">
          <i class="fas fa-flag"></i>
          <span>{{ collectionText }}</span>
        </div>
      </div>

      <!-- 景點資訊 -->
      <div class="attraction-content">
        <!-- 景點名稱 -->
        <div class="attraction-header">
          <h3 class="attraction-name">{{ attractionData.name }}</h3>
          <button class="info-button" @click="handleInfo">
            <i class="fas fa-info-circle"></i>
          </button>
        </div>

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

      <!-- 地點 -->
      <div class="location" @click="openGoogleMaps">
        <i class="fas fa-map-marker-alt location-icon"></i>
        <span class="location-text">{{ getLocationText() }}</span>
      </div>

      <!-- 加入景點庫按鈕 -->
      <button class="add-button" @click="handleAddToCollection">
        加入景點庫
      </button>
    </div>
    </div>
    <div v-else class="loading">
      <p>載入中...</p>
    </div>

    <!-- 景點詳細資訊浮動視窗 -->
    <attractionDetail 
      :attractionData="attractionData"
      :isVisible="showDetail"
      @close="showDetail = false"
      @addToCollection="handleAddToCollection"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { callAPI } from '@/utility/apiConfig';
import attractionDetail from './attractionDetail.vue';

// Props 定義（如果需要從父組件傳入）
const props = defineProps({
    attractionID: {
      type: String,
      required: true,
      default: "55290abd-14c6-4bed-832d-985e5992bfda"
    },
    collectionText: {
        type: String,
        default: '蒐藏最多'
    },
});

// 景點資料
const attractionData = ref(null);

// 控制詳細資訊視窗顯示
const showDetail = ref(false);

// 取得地點文字
const getLocationText = () => {
  if (!attractionData.value) return '';
  const { city, town } = attractionData.value;
  return town ? `${city}${town}` : city || '';
};

// 資訊按鈕點擊事件
const handleInfo = () => {
  if (attractionData.value) {
    showDetail.value = true;
  }
};

// 開啟 Google Maps
const openGoogleMaps = () => {
  if (!attractionData.value) return;
  
  const { name } = attractionData.value;
  if (!name) return;
  
  // 使用景點名稱搜尋 Google Maps
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
  window.open(googleMapsUrl, '_blank');
};

// 加入景點庫按鈕點擊事件
const handleAddToCollection = () => {
  if (attractionData.value) {
    alert(`已將 ${attractionData.value.name} 加入景點庫！`);
  }
};

// 載入景點資料
const fetchAttractionData = async () => {
  try {
    const res = await callAPI({
      method: 'GET',
      url: `/attractions/${props.attractionID}`,
      funcName: 'fetchAttractionData'
    });
    attractionData.value = res;
  } catch (error) {
    Log.error('API 錯誤', '取得景點資料失敗', error);
    attractionData.value = null;
  }
};

// 組件掛載時取得資料
onMounted(async () => {
  await fetchAttractionData();
});
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
  display: flex;
  flex-direction: column;
}

/* 景點圖片 */
.attraction-image-container {
  position: relative;
  width: 100%;
  height: 170px;
  overflow: hidden;
  flex-shrink: 0;
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
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.attraction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.attraction-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-brown);
  margin: 0;
  text-align: left;
  line-height: 1.4;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 3.4em;
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
  flex: 1;
  min-height: 0;
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
  margin-top: auto;
  flex-shrink: 0;
  cursor: pointer;
  padding: 6px 8px;
  margin: auto -8px 6px -8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.location:hover {
  background-color: rgba(255, 107, 107, 0.08);
}

.location:active {
  background-color: rgba(255, 107, 107, 0.15);
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
  flex-shrink: 0;
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

/* 載入中樣式 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 250px;
  min-height: 300px;
  background-color: var(--bg-white);
  border-radius: var(--radius-large);
  margin: 1em auto;
  box-shadow: var(--shadow-medium);
}

.loading p {
  color: var(--text-brown);
  font-size: 16px;
  font-weight: 500;
}
</style>