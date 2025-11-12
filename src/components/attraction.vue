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
    <div v-else class="card-loading">
      <p>載入中...</p>
    </div>

    <!-- 景點詳細資訊浮動視窗 -->
    <attractionDetail 
      :attractionData="attractionData"
      :isVisible="showDetail"
      @close="showDetail = false"
      @addToCollection="handleAddToCollection"
    />

    <!-- Toast 通知 -->
    <Transition name="toast">
      <div v-if="toast.visible" class="toast" :class="toast.type">
        <i :class="toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { callAPI } from '@/utility/apiConfig';
import { useAuth } from '@/utility/authStore';
import attractionDetail from './attractionDetail.vue';
import { Log } from '@/utility/logger';

// 路由和認證
const router = useRouter();
const { isAuthenticated, userId } = useAuth();

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

// 收藏狀態
const isFavorite = ref(false);

// 載入狀態（用於按鈕旋轉動畫）
const isLoading = ref(false);

// Toast 訊息狀態
const toast = ref({
  visible: false,
  message: '',
  type: 'success' // 'success' or 'error'
});

// 顯示 Toast
const showToast = (message, type = 'success') => {
  toast.value = {
    visible: true,
    message,
    type
  };
  
  // 3 秒後自動隱藏
  setTimeout(() => {
    toast.value.visible = false;
  }, 3000);
};

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
const handleAddToCollection = async () => {
  // 檢查是否已登入
  if (!isAuthenticated.value) {
    // 未登入，導向登入頁面
    Log.msg('attraction', '使用者未登入，導向登入頁面');
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    });
    return;
  }

  // 已登入，執行收藏/取消收藏
  if (!attractionData.value || !userId.value) return;

  // 防止重複點擊
  if (isLoading.value) return;

  isLoading.value = true;

  try {
    if (isFavorite.value) {
      // 已收藏，執行刪除
      await callAPI({
        method: 'DELETE',
        url: '/favorites/',
        body: {
          user_id: userId.value,
          attraction_id: props.attractionID
        },
        funcName: 'deleteFromFavorites'
      });
      isFavorite.value = false;
      showToast(`已將 ${attractionData.value.name} 從景點庫移除！`, 'success');
      Log.msg('attraction', '成功從景點庫移除');
    } else {
      // 未收藏，執行新增
      Log.msg('attraction', userId.value, props.attractionID);
      await callAPI({
        method: 'POST',
        url: '/favorites/',
        body: {
          user_id: userId.value,
          attraction_id: props.attractionID
        },
        funcName: 'addToFavorites'
      });
      
      isFavorite.value = true;
      showToast(`已將 ${attractionData.value.name} 加入景點庫！`, 'success');
      Log.msg('attraction', '成功加入景點庫');
    }
  } catch (error) {
    Log.error('API 錯誤', '操作景點庫失敗', error);
    showToast('操作失敗，請稍後再試', 'error');
  } finally {
    isLoading.value = false;
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

// 檢查景點是否已收藏
const checkIfFavorite = async () => {
  if (!isAuthenticated.value || !userId.value) {
    isFavorite.value = false;
    return;
  }
  
  try {
    // 獲取使用者所有已收藏的景點
    const favorites = await callAPI({
      method: 'GET',
      url: `/favorites/${userId.value}`,
      funcName: 'getFavorites'
    });
    
    // 檢查當前景點是否在收藏列表中
    if (Array.isArray(favorites)) {
      isFavorite.value = favorites.some(
        favorite => favorite.attraction_id === props.attractionID
      );
    } else {
      isFavorite.value = false;
    }
    
    Log.msg('attraction', `收藏狀態: ${isFavorite.value ? '已收藏' : '未收藏'}`);
  } catch (error) {
    // 如果發生錯誤，預設為未收藏
    isFavorite.value = false;
    Log.msg('attraction', '無法檢查收藏狀態');
  }
};

// 組件掛載時取得資料
onMounted(async () => {
  await fetchAttractionData();
  await checkIfFavorite();
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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.add-button:not(:disabled):hover {
  background-color: var(--primary-brown-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.add-button:not(:disabled):active {
  transform: translateY(0);
  box-shadow: var(--shadow-light);
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
  font-size: 14px;
  margin-left: 6px;
  display: inline-block;
  opacity: 0;
  width: 0;
  transition: opacity 0.2s ease, width 0.2s ease;
}

.add-button .spinner-small.visible {
  opacity: 1;
  width: 14px;
}

/* Toast 通知樣式 */
.toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--bg-white);
  padding: 10px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Noto Sans TC', sans-serif;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  min-width: 180px;
  max-width: 90vw;
}

.toast.success {
  border-left: 4px solid #4caf50;
}

.toast.success i {
  color: #4caf50;
  font-size: 18px;
}

.toast.error {
  border-left: 4px solid #f44336;
}

.toast.error i {
  color: #f44336;
  font-size: 18px;
}

.toast span {
  color: var(--text-brown);
  flex: 1;
}

/* Toast 動畫 */
.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
}

/* 景點卡片載入中樣式 */
.card-loading {
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

.card-loading p {
  color: var(--text-brown);
  font-size: 16px;
  font-weight: 500;
}
</style>