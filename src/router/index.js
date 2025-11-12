import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Ai from '../views/Ai.vue'
import Attraction from '../views/Attraction.vue'
import RoutePlanner from '../views/RoutePlanner.vue'
import { authGuard } from '../utility/authGuard'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/ai',
    name: 'Ai',
    component: Ai
    // AI 功能開放給所有使用者使用，不需要登入
  },
  {
    path: '/attraction',
    name: 'Attraction',
    component: Attraction,
    meta: { requiresAuth: true } // 需要登入才能訪問
  },
  {
    path: '/route-planner',
    name: 'RoutePlanner',
    component: RoutePlanner,
    meta: { requiresAuth: true } // 需要登入才能訪問
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guestOnly: true } // 已登入用戶不能訪問
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true } // 需要登入才能訪問
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全域路由守衛
router.beforeEach(authGuard)

export default router
