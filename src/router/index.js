import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Ai from '../views/Ai.vue'
import Attraction from '../views/Attraction.vue'

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
  },
  {
    path: '/attraction',
    name: 'Attraction',
    component: Attraction
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
