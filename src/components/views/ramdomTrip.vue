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
        <img :src="attractionImage" alt="景點圖片" />
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
      <button class="random-button" @click="handleRandomClick">
        <i class="fas fa-sync-alt refresh-icon"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 台灣縣市列表
const cities = ref([
  '全台', 
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市', '基隆市', '新竹市', '新竹縣', '苗栗縣', 
  '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣', '澎湖縣', 
  '金門縣', '連江縣'
]);

// 城市選擇
const selectedCity = ref('全台');

// 景點資訊
const attractionName = ref('士林觀光夜市');
const attractionAddress = ref('111臺北市士林區基河路101號');
const attractionImage = ref('https://www.travel.taipei/image/221601');

// 計算 Google Maps URL
const googleMapsUrl = computed(() => {
    const name = encodeURIComponent(attractionName.value);
    return `https://www.google.com/maps/search/?api=1&query=${name}`;
});

// 隨機按鈕點擊事件（先留空）
const handleRandomClick = () => {
  console.log('隨機按鈕被點擊');
  // TODO: 實現隨機景點邏輯
};
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
}

.image-link:active img {
  transform: scale(0.98);
}

/* 景點資訊 */
.attraction-info {
  border-radius: var(--radius-large);
  padding: 0.5em;
  position: relative;
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

/* 隨機按鈕 */
.random-button {
  position: absolute;
  right: 2px;
  bottom: 4px;
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

.refresh-icon {
  color: var(--bg-white);
  font-size: 20px;
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

  .random-button {
    right: 16px;
    bottom: 16px;
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

  .random-button {
    right: 20px;
    bottom: 20px;
    width: 58px;
    height: 58px;
  }

  .refresh-icon {
    font-size: 24px;
  }
}
</style>