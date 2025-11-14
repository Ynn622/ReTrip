import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import "@/utility/logger"
import { initAuth } from './utility/authStore'
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"
import './assets/toast.css'  // 自訂 toast 樣式

// 初始化認證狀態
initAuth()

// Toast 配置
const toastOptions = {
  position: "bottom-center",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
  transition: "Vue-Toastification__bounce",
  maxToasts: 3,
  newestOnTop: true
}

createApp(App).use(router).use(Toast, toastOptions).mount('#app')
