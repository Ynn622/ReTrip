<template>
    <div class="hot-container">
        <div class="hot-header">
            <i class="fas fa-solid fa-fire header-icon"></i>
            <h2 class="hot-title">最燙的 Trip</h2>
        </div>

        <div class="hot-wrapper">
            <Attraction />
            <Attraction />
            <Attraction />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Attraction from '../attraction.vue';

const router = useRouter();
const userInput = ref('');
</script>

<style scoped>
@import '@/assets/main.css';

/* 手機版設計（預設） */
.hot-container {
    width: min(95%, 100%);
    margin: 0 auto;
    padding: 14px;
    background-color: var(--bg-card);
    border-radius: var(--radius-large);
    font-family: 'Noto Sans TC', sans-serif;
    box-sizing: border-box;
}

.hot-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.header-icon {
    color: var(--text-brown);
    font-size: 24px;
}

.hot-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-brown);
    margin: 0;
}

.hot-wrapper {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0 4px;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: var(--border-light) transparent;
}

/* 自訂滾動條樣式 (Webkit) */
.hot-wrapper::-webkit-scrollbar {
    height: 8px;
}

.hot-wrapper::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
}

.hot-wrapper::-webkit-scrollbar-thumb {
    background-color: var(--border-light);
    border-radius: 10px;
    transition: background-color 0.3s ease;
}

.hot-wrapper::-webkit-scrollbar-thumb:hover {
    background-color: var(--border-medium);
}

/* 確保卡片不會被壓縮 */
.hot-wrapper > * {
    flex-shrink: 0;
}

/* 平板尺寸（大於 768px） */
@media (min-width: 768px) {
    .hot-container {
        padding: 24px 20px;
        border-radius: var(--radius-xlarge);
    }

    .hot-header {
        gap: 16px;
        margin-bottom: 20px;
    }

    .header-icon {
        font-size: 28px;
    }

    .hot-title {
        font-size: 28px;
    }

    .hot-wrapper {
        gap: 20px;
        padding: 8px 4px 20px 4px;
    }

    .hot-wrapper::-webkit-scrollbar {
        height: 10px;
    }
}

/* 桌面尺寸（大於 1024px） */
@media (min-width: 1024px) {
    .hot-container {
        padding: 28px 24px;
    }

    .hot-header {
        gap: 18px;
        margin-bottom: 24px;
    }

    .header-icon {
        font-size: 32px;
    }

    .hot-title {
        font-size: 32px;
    }

    .hot-wrapper {
        gap: 24px;
        padding: 8px 4px 24px 4px;
    }
}
</style>