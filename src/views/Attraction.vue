<template>
    <div class="home">
        <Nav />
        <main class="main-content">
            <!-- 載入中 -->
            <div v-if="isLoading" class="loading-container">
                <p>載入中...</p>
            </div>
            
            <!-- 空狀態 -->
            <div v-else-if="attractions.length === 0" class="empty-state">
                <p>目前沒有收藏的景點</p>
                <p class="empty-hint">快去探索並加入喜歡的景點吧！</p>
            </div>
            
            <!-- 景點列表 -->
            <AttractionRow 
                v-else
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AttractionRow from '@/components/attractionRow.vue';
import Nav from '@/components/views/nav.vue';
import { callAPI } from '@/utility/apiConfig';
import { useAuth } from '@/utility/authStore';

// 路由和認證
const router = useRouter();
const { isAuthenticated, userId } = useAuth();

// 景點列表
const attractions = ref([]);

// 載入狀態
const isLoading = ref(true);

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
const handleDelete = async (attractionID) => {
    const confirmed = confirm('確定要從景點庫移除此景點嗎？');
    if (!confirmed) return;

    try {
        // 調用刪除 API
        await callAPI({
            method: 'DELETE',
            url: '/favorites/',
            body: {
                user_id: userId.value,
                attraction_id: attractionID
            },
            funcName: 'deleteFromFavorites'
        });

        // 從列表中移除
        const index = attractions.value.findIndex(a => a.id === attractionID);
        if (index !== -1) {
            attractions.value.splice(index, 1);
        }

        Log.msg('Attraction', '成功從景點庫移除');
    } catch (error) {
        Log.error('API 錯誤', '刪除景點失敗', error);
        alert('刪除失敗，請稍後再試');
    }
};

// 載入收藏的景點
const fetchFavorites = async () => {
    // 檢查是否已登入
    if (!isAuthenticated.value || !userId.value) {
        Log.msg('Attraction', '使用者未登入');
        router.push('/login');
        return;
    }

    isLoading.value = true;
    try {
        const favorites = await callAPI({
            method: 'GET',
            url: `/favorites/${userId.value}`,
            funcName: 'getFavorites'
        });

        // 將收藏的景點轉換為列表格式
        if (Array.isArray(favorites)) {
            attractions.value = favorites.map(fav => ({
                id: fav.attraction_id,
                checked: false
            }));
            Log.msg('Attraction', `載入了 ${attractions.value.length} 個收藏景點`);
        } else {
            attractions.value = [];
        }
    } catch (error) {
        Log.error('API 錯誤', '取得收藏景點失敗', error);
        attractions.value = [];
    } finally {
        isLoading.value = false;
    }
};

// 產生路線
const generateRoute = () => {
    const selectedAttractions = attractions.value.filter(a => a.checked);
    if (selectedAttractions.length === 0) {
        alert('請至少選擇一個景點');
        return;
    }
    
    // 提取選中的景點 IDs
    const selectedIds = selectedAttractions.map(a => a.id);
    
    Log.msg('Attraction', `準備為 ${selectedIds.length} 個景點產生路線`);
    
    // 導向路線規劃頁面，並傳遞景點 IDs
    router.push({
        path: '/route-planner',
        query: { ids: selectedIds }
    });
};

// 組件掛載時載入收藏景點
onMounted(async () => {
    await fetchFavorites();
});
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

/* 載入中狀態 */
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    font-size: 18px;
    color: var(--text-brown);
    font-weight: 500;
}

/* 空狀態 */
.empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    padding: 40px 20px;
    text-align: center;
}

.empty-state p {
    font-size: 18px;
    color: var(--text-brown);
    font-weight: 500;
    margin: 8px 0;
}

.empty-hint {
    font-size: 16px;
    color: var(--text-gray);
    font-weight: 400;
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
