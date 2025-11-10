<template>
  <div class="home">
    <Nav />
    <main class="main-content">
      <Talk />
      <RamdomTrip />
      <HotTrip />
    </main>
  </div>
</template>

<script setup>
import HotTrip from '@/components/views/hotTrip.vue';
import Nav from '@/components/views/nav.vue'
import RamdomTrip from '@/components/views/ramdomTrip.vue';
import Talk from '@/components/views/talk.vue';
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

.main-content {
  padding-top: 16px;
  gap: 2px;
}
</style>
