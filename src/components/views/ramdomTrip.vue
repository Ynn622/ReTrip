<template>
  <div class="random-trip-container">
    <!-- 標題和城市選擇器 -->
    <div class="header">
      <h1 class="title">今天要 Trip 哪？</h1>
      <div class="city-selector">
        <select v-model="selectedCity" class="city-dropdown">
          <option v-for="city in cities" :key="city" :value="city">
            {{ city }}
          </option>
        </select>
        <i class="fas fa-chevron-down dropdown-icon"></i>
      </div>
    </div>

    <!-- 景點圖片 -->
    <div class="attraction-image">
      <a class="image-link">
        <img 
          :src="attractionImage" 
          alt="景點圖片"
          @error="handleImageError"
        />
      </a>
    </div>

    <!-- 景點資訊 -->
    <div class="attraction-info">
      <h2 class="attraction-name">{{ attractionName }}</h2>
      <div class="attraction-address">
        <i class="fas fa-map-marker-alt address-icon"></i>
        <a 
          :href="googleMapsUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="address-link"
        >
          {{ attractionAddress }}
        </a>
      </div>
      
      <!-- 隨機按鈕 -->
      <button 
        class="random-button" 
        :class="{ 'is-loading': isLoading }"
        :disabled="isLoading"
        @click="handleRandomClick"
      >
        <i class="fas fa-sync-alt refresh-icon"></i>
      </button>
      
      <!-- 加入景點庫按鈕 -->
      <button 
        class="add-button" 
        @click="handleAddToCollection"
        :disabled="isAddingToCollection"
        :class="{ 'button-loading': isAddingToCollection }"
      >
        <span>{{ isFavorite ? '從景點庫移除' : '加入景點庫' }}</span>
        <i class="fas fa-spinner fa-spin spinner-small" :class="{ 'visible': isAddingToCollection }"></i>
      </button>
    </div>

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
import { callAPI } from '@/utility/apiConfig';
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/utility/authStore';
import { Log } from '@/utility/logger';

// 路由和認證
const router = useRouter();
const { isAuthenticated, userId } = useAuth();

// 載入狀態
const isLoading = ref(false);
const isAddingToCollection = ref(false);

// 台灣縣市列表
const cities = ref([
  '臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市', '基隆市', '新竹市', '新竹縣', '苗栗縣', 
  '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', '澎湖縣', 
  '金門縣', '連江縣'
]);

// 城市選擇
const selectedCity = ref('臺北市');

// 景點資訊
const attraction = ref({});
const attractionName = ref('士林觀光夜市');
const attractionAddress = ref('111臺北市士林區基河路101號');
const attractionImage = ref('https://www.travel.taipei/image/221601');

// 收藏狀態
const isFavorite = ref(false);

// Toast 訊息狀態
const toast = ref({
  visible: false,
  message: '',
  type: 'success' // 'success' or 'error'
});

// 預設圖片 URL
const defaultImageUrl = 'https://skhcn.hatinh.gov.vn/storage/images.thumb.6884ae87-e99e-4995-8621-76a68fc0df7a.jpg';

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

// 圖片載入失敗處理
const handleImageError = (event) => {
  Log.error('⚠️ 圖片載入失敗，使用預設圖片');
  attractionImage.value = defaultImageUrl;
  // 避免預設圖片也失敗時造成無限循環
  event.target.onerror = null;
};

// 計算 Google Maps URL
const googleMapsUrl = computed(() => {
    const name = encodeURIComponent(attractionName.value);
    return `https://www.google.com/maps/search/?api=1&query=${name}`;
});

// 清理圖片 URL 函數
function cleanUrl(url) {
  try { 
    // 1️⃣ 先解碼（把 &amp%3B 之類還原）
    const decoded = decodeURIComponent(url.replace(/&amp;/g, '&'));
  
    // 2️⃣ 解析 URL
    const u = new URL(decoded);
  
    // 3️⃣ 只保留 id 參數
    const id = u.searchParams.get('id');
    return `${u.origin}${u.pathname}?id=${id}`;
  } catch (error) {
    return url; // 發生錯誤時回傳原始網址
  }
}

// 檢查景點是否已收藏
const checkIfFavorite = async () => {
  if (!isAuthenticated.value || !userId.value || !attraction.value.id) {
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
        favorite => favorite.attraction_id === attraction.value.id
      );
    } else {
      isFavorite.value = false;
    }
    
    Log.msg('🔖 收藏狀態:', isFavorite.value ? '已收藏' : '未收藏');
  } catch (error) {
    // 如果發生錯誤，預設為未收藏
    isFavorite.value = false;
    Log.msg('⚠️ 無法檢查收藏狀態');
  }
};

// 加入景點庫按鈕點擊事件
const handleAddToCollection = async () => {
  // 檢查是否已登入
  if (!isAuthenticated.value) {
    // 未登入，導向登入頁面
    Log.msg('⚠️ 使用者未登入，導向登入頁面');
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    });
    return;
  }

  // 已登入，執行收藏/取消收藏
  if (!attraction.value.id || !userId.value) {
    showToast('景點資訊不完整，請重新載入', 'error');
    return;
  }

  // 防止重複點擊
  if (isAddingToCollection.value) return;

  isAddingToCollection.value = true;

  try {
    if (isFavorite.value) {
      // 已收藏，執行刪除
      await callAPI({
        method: 'DELETE',
        url: '/favorites/',
        body: {
          user_id: userId.value,
          attraction_id: attraction.value.id
        },
        funcName: 'deleteFromFavorites'
      });
      isFavorite.value = false;
      showToast(`已將 ${attractionName.value} 從景點庫移除！`, 'success');
      Log.msg('✅ 成功從景點庫移除');
    } else {
      // 未收藏，執行新增
      await callAPI({
        method: 'POST',
        url: '/favorites/',
        body: {
          user_id: userId.value,
          attraction_id: attraction.value.id
        },
        funcName: 'addToFavorites'
      });
      
      isFavorite.value = true;
      showToast(`已將 ${attractionName.value} 加入景點庫！`, 'success');
      Log.msg('✅ 成功加入景點庫');
    }
  } catch (error) {
    Log.error('❌ 操作景點庫失敗:', error);
    showToast('操作失敗，請稍後再試', 'error');
  } finally {
    isAddingToCollection.value = false;
  }
};

// 隨機按鈕點擊事件（先留空）
const handleRandomClick = async () => {
  // 防止重複點擊
  if (isLoading.value) return;
  
  isLoading.value = true;
  Log.msg('🔄 隨機按鈕被點擊，正在取得新的隨機景點資料...');

  try {
    const res = await callAPI({
      url: '/attractions/random', 
      params: { city: selectedCity.value }
    });

    if (res) {
      attraction.value = res;
      attractionName.value = res.name;
      attractionAddress.value = `${res.city}${res.town}${res.street_address ? res.street_address : ''}`;
      attractionImage.value = cleanUrl(res.main_image_url) || defaultImageUrl;
      Log.msg('✅ 已更新隨機景點資料:', attraction.value);
      
      // 檢查新景點的收藏狀態
      await checkIfFavorite();
    } else {
      Log.error('❌ 無法取得隨機景點資料');
    }
  } catch (error) {
    Log.error('❌ 取得隨機景點資料時發生錯誤:', error);
  } finally {
    isLoading.value = false;
  }
};

// 監聽景點變化，檢查收藏狀態
watch(() => attraction.value.id, () => {
  if (attraction.value.id) {
    checkIfFavorite();
  }
});

// 組件掛載時獲取初始隨機景點
onMounted(async () => {
  Log.msg('🚀 組件掛載，獲取初始隨機景點...');
  await handleRandomClick();
});
</script>

<style scoped>
@import '@/assets/main.css';

/* 手機版設計（預設） */
.random-trip-container {
  min-width: 95%;
  margin: 0 auto;
  padding: 14px;
  margin: 1em;
  background-color: var(--bg-card);
  border-radius: var(--radius-large);
  font-family: 'Noto Sans TC', sans-serif;
}

/* 標題和城市選擇器 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-brown);
  margin: 0;
}

.city-selector {
  position: relative;
  display: inline-block;
}

.city-dropdown {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 20px;
  padding: 8px 35px 8px 16px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-brown);
  cursor: pointer;
  outline: none;
  min-width: 100px;
}

.city-dropdown:hover {
  border-color: var(--border-medium);
}

.city-dropdown:focus {
  border-color: var(--text-brown);
}

.dropdown-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-brown);
  font-size: 14px;
  pointer-events: none;
}

/* 景點圖片 */
.attraction-image {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 2px;
}

.image-link {
  display: block;
  width: 100%;
}

.attraction-image img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
  /* 防止顯示 alt 文字 */
  font-size: 0;
  color: transparent;
  text-indent: -9999px;
  background-color: var(--bg-card);
}

.image-link:active img {
  transform: scale(0.98);
}

/* 景點資訊 */
.attraction-info {
  border-radius: var(--radius-large);
  padding: 0.5em;
  position: relative;
  padding-bottom: 0.5em;
}

.attraction-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-brown);
  margin: 0 0 6px 0;
  text-align: left;
  line-height: 1.4;
}

.attraction-address {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  padding-right: 50px;
}

.address-icon {
  color: var(--accent-coral);
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.address-link {
  font-size: 14px;
  color: var(--text-gray);
  text-decoration: none;
  transition: color 0.3s ease;
  line-height: 1.4;
  text-align: left;
}

.address-link:active {
  color: var(--text-brown);
}

/* 加入景點庫按鈕 */
.add-button {
  width: 100%;
  padding: 8px;
  background-color: var(--text-brown);
  color: var(--bg-white);
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Noto Sans TC', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.add-button:not(:disabled):active {
  transform: translateY(1px);
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

/* 隨機按鈕 */
.random-button {
  position: absolute;
  right: 2px;
  bottom: 70px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--accent-coral);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(212, 117, 107, 0.3);
  transition: all 0.3s ease;
}

.random-button:active {
  transform: scale(0.95);
  box-shadow: 0 2px 6px rgba(212, 117, 107, 0.3);
}

.random-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.random-button.is-loading .refresh-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.refresh-icon {
  color: var(--bg-white);
  font-size: 20px;
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

/* 平板尺寸（大於 768px） */
@media (min-width: 768px) {
  .random-trip-container {
    padding: 0.9em 1.3em;
    border-radius: var(--radius-xlarge);
  }

  .header {
    margin-bottom: 1em;
  }

  .title {
    font-size: 32px;
  }

  .city-dropdown {
    padding: 10px 40px 10px 20px;
    font-size: 18px;
    border-radius: 24px;
    min-width: 120px;
  }

  .dropdown-icon {
    right: 16px;
    font-size: 16px;
  }

  .attraction-image {
    margin-bottom: 1em;
  }

  .attraction-image img {
    height: 320px;
  }

  .image-link:hover img {
    transform: scale(1.02);
  }

  .attraction-name {
    font-size: 28px;
  }

  .attraction-address {
    gap: 10px;
  }

  .address-icon {
    font-size: 18px;
  }

  .address-link {
    font-size: 16px;
  }

  .address-link:hover {
    color: var(--text-brown);
    text-decoration: underline;
  }

  .add-button {
    font-size: 19px;
    min-height: 48px;
  }

  .add-button:not(:disabled):hover {
    background-color: var(--primary-brown-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
  }

  .random-button {
    right: 16px;
    bottom: 68px;
    width: 52px;
    height: 52px;
  }

  .random-button:hover {
    background-color: var(--accent-coral-hover);
    transform: rotate(180deg) scale(1.05);
    box-shadow: 0 3px 12px rgba(212, 117, 107, 0.4);
  }

  .random-button:active {
    transform: rotate(180deg) scale(0.95);
  }

  .refresh-icon {
    font-size: 22px;
  }
}

/* 桌面尺寸（大於 1024px） */
@media (min-width: 1024px) {
  .random-trip-container {
    padding: 1em 1.5em;
  }

  .header {
    margin-bottom: 1.1em;
  }

  .title {
    font-size: 36px;
  }

  .city-dropdown {
    padding: 12px 45px 12px 24px;
    font-size: 20px;
    min-width: 140px;
  }

  .dropdown-icon {
    right: 18px;
    font-size: 18px;
  }

  .attraction-image {
    margin-bottom: 1.1em;
  }

  .attraction-image img {
    height: 400px;
  }

  .attraction-name {
    font-size: 32px;
  }

  .attraction-address {
    gap: 12px;
  }

  .address-icon {
    font-size: 20px;
  }

  .address-link {
    font-size: 17px;
  }

  .add-button {
    font-size: 20px;
    min-height: 50px;
  }

  .random-button {
    right: 20px;
    bottom: 70px;
    width: 58px;
    height: 58px;
  }

  .refresh-icon {
    font-size: 24px;
  }
}
</style>