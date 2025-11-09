<template>
    <div class="home">
        <Nav />
        <main class="home__content">
            ReTrip AI 
        </main>
    </div>
</template>

<script setup>
import Nav from '../components/nav.vue'
</script>

<style scoped>
/* 手機優先設計 */
.home {
    min-height: 100vh;
    background: var(--bg-cream);
    display: flex;
    flex-direction: column;
}

.home__content {
    flex: 1;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    color: var(--text-primary);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
