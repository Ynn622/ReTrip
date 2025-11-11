<template>
  <div class="login-page">
    <Nav />
    <div class="login-container">
      <div class="login-card">
        <!-- Logo 區域 -->
        <div class="logo-section">
          <img :src="logoIcon" alt="ReTrip Logo" class="logo-icon" />
          <h1 class="logo-title">ReTrip</h1>
          <p class="welcome-text">一起成為追憶旅人吧！</p>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 登入按鈕區域 -->
        <div class="login-buttons">
          <!-- Facebook 登入按鈕 -->
          <button 
            class="login-btn facebook-btn" 
            @click="loginWithFacebook"
            :disabled="isLoading"
          >
            <span v-if="!isLoading" class="btn-icon facebook-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </span>
            <span v-if="isLoading" class="spinner"></span>
            <span class="btn-text">{{ isLoading ? '登入中...' : '以 Facebook 帳號登入' }}</span>
          </button>

          <!-- Google 登入按鈕 -->
          <button 
            class="login-btn google-btn" 
            @click="loginWithGoogle"
            :disabled="isLoading"
          >
            <span v-if="!isLoading" class="btn-icon google-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4" />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853" />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05" />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335" />
              </svg>
            </span>
            <span v-if="isLoading" class="spinner"></span>
            <span class="btn-text">{{ isLoading ? '登入中...' : '以 Google 帳號登入' }}</span>
          </button>
        </div>

        <!-- 條款說明 -->
        <p class="terms-text">
          登入即表示您同意我們的
          <a href="#" class="terms-link">服務條款</a>
          和
          <a href="#" class="terms-link">隱私政策</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logoIcon from '@/assets/images/icon.png'
import Nav from '@/components/views/nav.vue'
import { signInWithGoogle, signInWithFacebook } from '@/utility/supabaseClient'
import { useAuth } from '@/utility/authStore'

const router = useRouter()
const route = useRoute()
const { isAuthenticated } = useAuth()
const isLoading = ref(false)
const errorMessage = ref('')

// 錯誤訊息對應
const errorMessages = {
  'server_error': '伺服器錯誤，請稍後再試',
  'unexpected_failure': 'Supabase 設定錯誤，請檢查以下設定：\n1. 確認已在 Supabase Dashboard 啟用 Google 和 Facebook 登入\n2. 確認 OAuth 回調 URL 設定正確\n3. 檢查資料庫是否正常運作',
  'access_denied': '存取被拒絕，請重試',
  'unauthorized_client': '應用程式未授權，請檢查 OAuth 設定'
}

// 檢查是否已登入或有錯誤
onMounted(() => {
  // 檢查 URL 中的錯誤參數
  const urlError = route.query.error || route.hash.match(/error=([^&]+)/)?.[1]
  const errorDescription = route.query.error_description || route.hash.match(/error_description=([^&]+)/)?.[1]
  
  if (urlError) {
    Log.error('Login', '登入錯誤:', { error: urlError, description: errorDescription })
    
    // 顯示友善的錯誤訊息
    if (errorDescription?.includes('Database error')) {
      errorMessage.value = '⚠️ Supabase 資料庫設定錯誤\n\n請確認：\n1. Supabase 專案已建立且正常運作\n2. 已在 Authentication > Providers 啟用 Google/Facebook\n3. 已設定正確的 OAuth 回調 URL\n4. 資料庫 public.users 表格已建立'
    } else {
      errorMessage.value = errorMessages[urlError] || `登入失敗: ${decodeURIComponent(errorDescription || urlError)}`
    }
    
    // 清除 URL 中的錯誤參數
    router.replace({ path: '/login', query: {} })
    return
  }
  
  if (isAuthenticated.value) {
    Log.msg('Login', '使用者已登入，導向首頁')
    router.push('/')
  }
})

// Facebook 登入
const loginWithFacebook = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  Log.msg('loginWithFacebook', '開始 Facebook 登入流程')
  
  try {
    const { data, error } = await signInWithFacebook()
    
    if (error) {
      Log.error('loginWithFacebook', 'Facebook 登入失敗:', error)
      errorMessage.value = '登入失敗，請稍後再試'
    } else {
      Log.msg('loginWithFacebook', 'Facebook 登入成功')
      // OAuth 會自動重導向，不需要手動導向
    }
  } catch (error) {
    Log.error('loginWithFacebook', 'Facebook 登入發生錯誤:', error)
    errorMessage.value = '登入過程發生錯誤，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

// Google 登入
const loginWithGoogle = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  Log.msg('loginWithGoogle', '開始 Google 登入流程')
  
  try {
    const { data, error } = await signInWithGoogle()
    
    if (error) {
      Log.error('loginWithGoogle', 'Google 登入失敗:', error)
      errorMessage.value = '登入失敗，請稍後再試'
    } else {
      Log.msg('loginWithGoogle', 'Google 登入成功')
      // OAuth 會自動重導向，不需要手動導向
    }
  } catch (error) {
    Log.error('loginWithGoogle', 'Google 登入發生錯誤:', error)
    errorMessage.value = '登入過程發生錯誤，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 整體頁面佈局 */
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-cream) 0%, var(--bg-cream-dark) 100%);
  display: flex;
  flex-direction: column;
}

.login-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-md);
}

.login-card {
  background: var(--bg-white);
  border-radius: var(--radius-xlarge);
  box-shadow: var(--shadow-heavy);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 420px;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo 區域 */
.logo-section {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin-bottom: var(--spacing-md);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.logo-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-brown);
  margin-bottom: var(--spacing-xs);
}

.welcome-text {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
}

/* 登入按鈕區域 */
.login-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-medium);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-light);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.login-btn:active {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-btn:disabled:hover {
  transform: none;
  box-shadow: var(--shadow-light);
}

/* 載入動畫 */
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 錯誤訊息 */
.error-message {
  background: #fee;
  color: #c33;
  padding: var(--spacing-md);
  border-radius: var(--radius-medium);
  margin-bottom: var(--spacing-md);
  font-size: 0.875rem;
  text-align: left;
  border: 1px solid #fcc;
  animation: shake 0.5s ease-in-out;
  white-space: pre-line;
  line-height: 1.6;
  max-height: 300px;
  overflow-y: auto;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

/* Facebook 按鈕 */
.facebook-btn {
  background: #1877F2;
  color: white;
}

.facebook-btn:hover {
  background: #166FE5;
}

/* Google 按鈕 */
.google-btn {
  background: white;
  color: var(--text-dark);
  border: 2px solid var(--border-light);
}

.google-btn:hover {
  background: var(--bg-cream);
  border-color: var(--border-medium);
}

/* 按鈕圖標 */
.btn-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.facebook-icon svg {
  width: 20px;
  height: 20px;
}

.google-icon svg {
  width: 20px;
  height: 20px;
}

.btn-text {
  flex: 1;
  text-align: center;
}

/* 分隔線 */
.divider {
  position: relative;
  text-align: center;
  margin: var(--spacing-lg) 0;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: var(--border-light);
}

.divider-text {
  position: relative;
  display: inline-block;
  padding: 0 var(--spacing-md);
  background: var(--bg-white);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* 訪客區域 */
.guest-section {
  margin-bottom: var(--spacing-lg);
}

.guest-btn {
  width: 100%;
  padding: var(--spacing-md);
  background: transparent;
  border: 2px solid var(--primary-brown);
  border-radius: var(--radius-medium);
  color: var(--primary-brown);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.guest-btn:hover {
  background: var(--primary-brown);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

.guest-btn:active {
  transform: translateY(0);
}

/* 條款說明 */
.terms-text {
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.terms-link {
  color: var(--primary-brown);
  text-decoration: none;
  font-weight: 600;
}

.terms-link:hover {
  text-decoration: underline;
}

/* 平板以上尺寸 */
@media (min-width: 768px) {
  .login-card {
    padding: 48px;
  }

  .logo-icon {
    width: 100px;
    height: 100px;
  }

  .logo-title {
    font-size: 2.5rem;
  }

  .login-btn {
    font-size: 1.05rem;
  }
}

/* 桌面尺寸 */
@media (min-width: 1024px) {
  .login-card {
    max-width: 480px;
  }
}
</style>