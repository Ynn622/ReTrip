import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import "@/utility/logger"
import { initAuth } from './utility/authStore'

// 初始化認證狀態
initAuth()

createApp(App).use(router).mount('#app')
