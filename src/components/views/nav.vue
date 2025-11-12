<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo 區域 - 可點擊回到主頁 -->
      <router-link to="/" class="nav-logo">
        <img :src="Icon" alt="ReTrip Logo" class="logo-icon" />
        <!-- 根據路由顯示對應的頁面名稱 -->
        <span class="logo-text">{{ currentPageName }}</span>
      </router-link>

      <!-- 漢堡選單按鈕 -->
      <button class="hamburger" @click="toggleMenu" :class="{ active: isMenuOpen }">
        <span class="line"></span>
        <span class="line"></span>
        <span class="line"></span>
      </button>

      <!-- 導航選單 -->
      <div class="nav-menu" :class="{ active: isMenuOpen }">
        <router-link to="/" class="nav-item" @click="closeMenu">
          <span class="nav-icon"><i class="fas fa-home"></i></span>
          <span class="nav-text">主頁</span>
        </router-link>
        <router-link to="/ai" class="nav-item" @click="closeMenu">
          <span class="nav-icon"><i class="fas fa-comments"></i></span>
          <span class="nav-text">ReTrip AI</span>
        </router-link>
        <router-link to="/attraction" class="nav-item" @click="closeMenu">
          <span class="nav-icon"><i class="fas fa-map-marker-alt"></i></span>
          <span class="nav-text">景點庫</span>
        </router-link>
        <a @click="handleProfileClick" class="nav-item" style="cursor: pointer;">
          <span class="nav-icon"><i class="fas fa-user"></i></span>
          <span class="nav-text">個人資料</span>
        </a>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/utility/authStore'
import Icon from '/icon.png'

const route = useRoute()
const router = useRouter()
const isMenuOpen = ref(false)
const { isAuthenticated } = useAuth()

// 根據路由路徑顯示對應的頁面名稱
const currentPageName = computed(() => {
  const pageNames = {
    '/': '主頁',
    '/ai': 'ReTrip AI',
    '/attraction': '景點庫',
    '/login': '登入',
    '/profile': '個人資料',
    '/route-planner': '路線規劃'
  }
  return pageNames[route.path] || '主頁'
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// 處理個人資料點擊
const handleProfileClick = () => {
  closeMenu()
  if (isAuthenticated.value) {
    // 已登入，導向 profile
    router.push('/profile')
  } else {
    // 未登入，導向 login
    router.push('/login')
  }
}
</script>

<style scoped>
.navbar {
  background-color: #F5EDE1;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

/* Logo 區域 */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #8B6D47;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.nav-logo:hover {
  opacity: 0.8;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 5px;
}

.logo-text {
  font-size: 1.5rem;
  color: #8B6D47;
}

/* 漢堡選單按鈕 */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.hamburger .line {
  width: 100%;
  height: 3px;
  background-color: #8B6D47;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.hamburger.active .line:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
}

.hamburger.active .line:nth-child(2) {
  opacity: 0;
}

.hamburger.active .line:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

/* 導航選單 */
.nav-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #8B6D47;
  text-decoration: none;
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: rgba(139, 109, 71, 0.1);
  transform: translateY(-2px);
}

.nav-icon {
  font-size: 1.3rem;
}

.nav-text {
  font-weight: 500;
}

/* 響應式設計 */
@media screen and (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .nav-menu {
    position: fixed;
    top: 0;
    right: -100%;
    width: 70%;
    max-width: 300px;
    height: 100vh;
    background-color: #F5EDE1;
    flex-direction: column;
    align-items: flex-start;
    padding: 4rem 2rem 2rem;
    gap: 1.5rem;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease;
  }

  .nav-menu.active {
    right: 0;
  }

  .nav-item {
    width: 100%;
    padding: 1rem;
    font-size: 1.2rem;
  }

  .nav-icon {
    font-size: 1.5rem;
  }
}

@media screen and (max-width: 480px) {
  .nav-container {
    padding: 0 1rem;
  }

  .logo-text {
    font-size: 1.25rem;
  }

  .nav-menu {
    width: 65%;
  }
}
</style> 