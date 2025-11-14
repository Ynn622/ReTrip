# ReTrip - 舊地重遊 🗺️

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Vue 3-green.svg" alt="Vue">
  <img src="https://img.shields.io/badge/Backend-Python 3.9+-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/DataBase-SupaBase-darkgreen.svg" alt="Vue">
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o＆5-orange.svg" alt="OpenAI">
</p>
<p align="center">
  <strong>🗺️ 舊地重遊 - 喚醒靈魂深處的藏寶圖吧！</strong>
</p>

「ReTrip」是一個智慧旅遊規劃平台，提供 AI 輔助、景點探索和路線規劃功能，一起來 [ReTrip](https://ynn622.github.io/ReTrip/) 舊地重遊吧！

## ✨ 專案特色

- 🤖 **AI 旅遊助手**：智慧推薦旅遊路線與景點
- 🗺️ **互動式地圖**：使用 Mapbox GL 提供視覺化地圖體驗
- 🎯 **景點探索**：瀏覽和收藏各地熱門景點
- 👤 **使用者系統**：完整的認證和個人檔案管理
- 🎲 **隨機旅遊**：探索驚喜旅遊體驗

## 🛠️ 技術堆疊

- **前端框架**：Vue 3 
- **建構工具**：Vite
- **路由管理**：Vue Router 4
- **後端服務**：Supabase
- **地圖服務**：Mapbox GL
- **通知系統**：Vue Toastification

## 📁 專案結構

```
ReTrip/
├── public/              # 靜態資源
├── src/
│   ├── assets/          # 樣式和圖片資源
│   ├── components/      # Vue 元件
│   │   ├── attraction.vue
│   │   ├── attractionDetail.vue
│   │   ├── attractionRow.vue
│   │   └── views/       # 視圖元件
│   │       ├── hotTrip.vue
│   │       ├── nav.vue
│   │       ├── ramdomTrip.vue
│   │       └── talk.vue
│   ├── router/          # 路由配置
│   ├── utility/         # 工具函數
│   │   ├── apiConfig.js
│   │   ├── authGuard.js
│   │   ├── authStore.js
│   │   ├── logger.js
│   │   └── supabaseClient.js
│   ├── views/           # 頁面視圖
│   │   ├── Ai.vue
│   │   ├── Attraction.vue
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── Profile.vue
│   │   └── RoutePlanner.vue
│   ├── App.vue          # 根元件
│   └── main.js          # 應用程式入口
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
└── package.json         # 專案依賴
```

## 🔐 功能權限

- **公開頁面**：首頁、AI 助手
- **需登入**：景點探索、路線規劃、個人檔案
- **訪客限定**：登入頁面（已登入用戶會被重定向）

## 👥 貢獻者

歡迎提交 Pull Request 或回報問題！

