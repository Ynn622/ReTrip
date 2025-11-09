<template>
  <div class="home">
    <Nav />
    <main class="home__content">
      <h1>ReTrip 主頁面</h1>
      <p>歡迎來到 ReTrip！</p>
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
  padding: 2rem;
  color: var(--text-primary);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.home__content h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--primary-brown);
}

.home__content p {
  font-size: 1.2rem;
  color: var(--text-secondary);
}
</style>
