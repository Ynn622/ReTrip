<template>
    <div class="home">
        <Nav />
        <main class="main-content">
            <AttractionRow 
                v-for="attraction in attractions" 
                :key="attraction.id"
                :attractionID="attraction.id"
                v-model="attraction.checked"
                @delete="handleDelete"
            />
        </main>

        <!-- 底部操作欄 -->
        <div class="bottom-bar">
            <div class="left-section">
                <div class="checkbox-container">
                    <input 
                        type="checkbox" 
                        id="select-all"
                        v-model="selectAll"
                        @change="toggleSelectAll"
                        class="custom-checkbox"
                    />
                    <label for="select-all" class="checkbox-label">全選</label>
                </div>
                <div class="selected-count">
                    已選取 {{ selectedCount }} 個景點
                </div>
            </div>
            <button class="generate-route-btn" @click="generateRoute" :disabled="selectedCount === 0">
                產生路線
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import AttractionRow from '@/components/attractionRow.vue';
import Nav from '@/components/views/nav.vue';

// 景點列表
const attractions = ref([
    { id: '55290abd-14c6-4bed-832d-985e5992bfda', checked: false },
    { id: 'b5ee0db5-b10f-496d-b050-d22c231fe5b3', checked: false },
]);

// 計算已選取的景點數量
const selectedCount = computed(() => {
    return attractions.value.filter(a => a.checked).length;
});

// 全選狀態 - 使用 computed 自動同步
const selectAll = computed({
    get() {
        if (attractions.value.length === 0) {
            return false;
        }
        return attractions.value.every(a => a.checked);
    },
    set(value) {
        attractions.value.forEach(attraction => {
            attraction.checked = value;
        });
    }
});

// 切換全選
const toggleSelectAll = () => {
    // selectAll 是 computed，直接賦值會觸發 set
    // 不需要額外處理
};

// 刪除景點
const handleDelete = (attractionID) => {
    const confirmed = confirm('確定要刪除此景點嗎？');
    if (confirmed) {
        const index = attractions.value.findIndex(a => a.id === attractionID);
        if (index !== -1) {
            attractions.value.splice(index, 1);
        }
    }
};

// 產生路線
const generateRoute = () => {
    const selectedAttractions = attractions.value.filter(a => a.checked);
    if (selectedAttractions.length === 0) {
        alert('請至少選擇一個景點');
        return;
    }
    alert(`準備為 ${selectedAttractions.length} 個景點產生路線`);
    // TODO: 實作產生路線的邏輯
};
</script>

<style scoped>
@import '@/assets/main.css';
/* 手機優先設計 */
.home {
    min-height: 100vh;
    background: var(--bg-cream);
    display: flex;
    flex-direction: column;
    padding-bottom: 80px; /* 為底部欄留出空間 */
}

.main-content {
    flex: 1;
    padding-bottom: 20px;
}

/* 底部操作欄 */
.bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--bg-white);
    padding: 12px 16px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 50;
    font-family: 'Noto Sans TC', sans-serif;
}

.left-section {
    display: flex;
    align-items: center;
    gap: 16px;
}

.checkbox-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.custom-checkbox {
    appearance: none;
    width: 24px;
    height: 24px;
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
    font-size: 16px;
    font-weight: bold;
}

.checkbox-label {
    font-size: 18px;
    font-weight: 500;
    color: var(--text-brown);
    cursor: pointer;
    user-select: none;
}

.selected-count {
    font-size: 16px;
    color: var(--text-brown);
    font-weight: 500;
}

.generate-route-btn {
    background-color: var(--accent-coral);
    color: white;
    border: none;
    border-radius: 25px;
    padding: 12px 32px;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Noto Sans TC', sans-serif;
    box-shadow: 0 2px 8px rgba(255, 138, 101, 0.3);
}

.generate-route-btn:hover:not(:disabled) {
    background-color: #ff7a50;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 138, 101, 0.4);
}

.generate-route-btn:active:not(:disabled) {
    transform: translateY(0);
}

.generate-route-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    box-shadow: none;
}

/* 響應式設計 */
@media (max-width: 480px) {
    .bottom-bar {
        padding: 10px 12px;
    }

    .left-section {
        gap: 12px;
    }

    .checkbox-label {
        font-size: 16px;
    }

    .selected-count {
        font-size: 14px;
    }

    .generate-route-btn {
        padding: 10px 24px;
        font-size: 16px;
    }
}
</style>
