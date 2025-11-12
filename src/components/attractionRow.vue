<template>
  <div class="attraction-card" v-if="attractionData">
    <!-- 左側 Checkbox -->
    <div class="checkbox-container">
      <input 
        type="checkbox" 
        :id="`checkbox-${attractionData.id}`" 
        v-model="isChecked"
        class="custom-checkbox"
      />
      <label :for="`checkbox-${attractionData.id}`" class="checkbox-label"></label>
    </div>

    <!-- 景點圖片 -->
    <div class="attraction-image-container">
      <img :src="attractionData.main_image_url" :alt="attractionData.name" class="attraction-image" />
    </div>

    <!-- 景點資訊 -->
    <div class="attraction-content">
      <!-- 景點名稱 -->
      <h3 class="attraction-name">{{ attractionData.name }}</h3>

      <!-- 地點 -->
      <div class="location">
        <i class="fas fa-map-marker-alt location-icon"></i>
        <span class="location-text">{{ getLocationText() }}</span>
      </div>
    </div>

    <!-- 右側刪除按鈕 -->
    <button class="delete-button" @click="handleDelete">
      <i class="fas fa-minus-circle"></i>
    </button>
  </div>
  <div v-else class="loading">
    <p>載入中...</p>
  </div>
</template>

<script setup>
import { callAPI } from '@/utility/apiConfig';
import { Log } from '@/utility/logger';
import { ref, onMounted, watch } from 'vue';

// Props 定義
const props = defineProps({
    attractionID: {
        type: String,
        required: true,
        default: "55290abd-14c6-4bed-832d-985e5992bfda"
    },
    modelValue: {
        type: Boolean,
        default: false
    }
});

// Emit 定義
const emit = defineEmits(['update:modelValue', 'delete']);

// 景點資料
const attractionData = ref(null);

// Checkbox 狀態
const isChecked = ref(props.modelValue);

// 監聽 modelValue 變化
watch(() => props.modelValue, (newVal) => {
  isChecked.value = newVal;
});

// 監聽 isChecked 變化，通知父組件
watch(isChecked, (newVal) => {
  emit('update:modelValue', newVal);
});

// 取得地點文字
const getLocationText = () => {
  if (!attractionData.value) return '';
  const { city, town } = attractionData.value;
  return town ? `${city}${town}` : city || '';
};

// 刪除按鈕點擊事件
const handleDelete = () => {
  if (attractionData.value) {
    emit('delete', props.attractionID);
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
onMounted( async() => {
  await fetchAttractionData();
});
</script>

<style scoped>
@import '@/assets/main.css';

.attraction-card {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 95dvw;
  max-width: 800px;
  background-color: var(--bg-white);
  border-radius: var(--radius-large);
  padding: 12px;
  box-shadow: var(--shadow-medium);
  font-family: 'Noto Sans TC', sans-serif;
  margin: 1em auto;
}

/* 左側 Checkbox */
.checkbox-container {
  position: relative;
  flex-shrink: 0;
}

.custom-checkbox {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid var(--accent-coral);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.custom-checkbox:checked {
  background-color: var(--accent-coral);
}

.custom-checkbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.custom-checkbox:hover {
  border-color: var(--primary-brown-dark);
}

/* 景點圖片 */
.attraction-image-container {
  position: relative;
  width: 100px;
  height: 80px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--radius-large);
}

.attraction-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 景點內容 */
.attraction-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.attraction-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-brown);
  margin: 0;
  text-align: left;
  line-height: 1.4;
}

/* 地點 */
.location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.location-icon {
  color: var(--accent-coral);
  font-size: 14px;
}

.location-text {
  color: var(--text-brown);
  font-weight: 500;
}

/* 右側刪除按鈕 */
.delete-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.delete-button:hover {
  background-color: rgba(255, 99, 71, 0.1);
}

.delete-button:active {
  transform: scale(0.95);
}

.delete-button i {
  color: var(--accent-coral);
  font-size: 28px;
  transition: color 0.3s ease;
}

.delete-button:hover i {
  color: #ff6347;
}

/* 載入中樣式 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 95dvw;
  max-width: 800px;
  min-height: 120px;
  background-color: var(--bg-white);
  border-radius: var(--radius-large);
  margin: 0.7em auto;
  padding: 12px;
  box-shadow: var(--shadow-medium);
}

.loading p {
  color: var(--text-brown);
  font-size: 16px;
  font-weight: 500;
}
</style>