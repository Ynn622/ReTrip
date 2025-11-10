<template>
    <div class="home">
        <Nav />
        <main class="main-content">
            ReTrip 景點庫
        </main>
    </div>
</template>

<script setup>
import Nav from '@/components/views/nav.vue'
</script>

<style scoped>
@import '@/assets/main.css';
/* 手機優先設計 */
.home {
    min-height: 100vh;
    background: var(--bg-cream);
    display: flex;
    flex-direction: column;
}
</style>
