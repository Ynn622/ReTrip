<template>
  <div class="profile-page">
    <Nav />
    <div class="profile-container">
      <!-- Profile Card - 移到上方,寬度填滿 -->
      <div class="profile-card">
        <!-- 左側:頭像 -->
        <div class="avatar-section">
          <img 
            :src="userAvatar" 
            alt="User Avatar" 
            class="avatar-img"
            @error="handleAvatarError"
          />
        </div>

        <!-- 右側:使用者資訊 -->
        <div class="user-info">
          <h2 class="user-name">{{ displayName }}</h2>
          <p v-if="providerName" class="user-provider">
            登入方式：{{ providerName }}
          </p>
        </div>
      </div>

      <!-- 功能按鈕區域 -->
      <div class="action-buttons">
        <button class="action-btn edit-btn" @click="editProfile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          編輯個人資料
        </button>
        
        <button class="action-btn logout-btn" @click="handleLogout" :disabled="isLoggingOut">
          <svg v-if="!isLoggingOut" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span v-if="isLoggingOut" class="spinner"></span>
          {{ isLoggingOut ? '登出中...' : '登出' }}
        </button>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Nav from '@/components/views/nav.vue'
import { useAuth } from '@/utility/authStore'
import { signOut } from '@/utility/supabaseClient'

const router = useRouter()
const { user, userEmail, userMetadata } = useAuth()
const isLoggingOut = ref(false)
const errorMessage = ref('')

// 顯示名稱
const displayName = computed(() => {
  return userMetadata.value?.full_name || 
         userMetadata.value?.name || 
         userEmail.value?.split('@')[0] || 
         '使用者'
})

// 使用者頭像
const userAvatar = computed(() => {
  return userMetadata.value?.avatar_url || 
         userMetadata.value?.picture || 
         `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName.value)}&background=8B6F47&color=fff&size=200`
})

// 登入方式名稱
const providerName = computed(() => {
  const provider = user.value?.user_metadata?.provider || user.value?.app_metadata?.provider
  const providerMap = {
    'google': 'Google',
    'facebook': 'Facebook',
  }
  return providerMap[provider] || provider || '未知'
})

// 處理頭像載入錯誤
const handleAvatarError = (event) => {
  event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName.value)}&background=8B6F47&color=fff&size=200`
}

// 編輯個人資料
const editProfile = () => {
  Log.msg('editProfile', '編輯個人資料')
  // TODO: 實作編輯功能
  alert('編輯功能開發中')
}

// 登出
const handleLogout = async () => {
  if (isLoggingOut.value) return
  
  isLoggingOut.value = true
  errorMessage.value = ''
  Log.msg('handleLogout', '開始登出流程')
  
  try {
    const { error } = await signOut()
    
    if (error) {
      Log.error('handleLogout', '登出失敗:', error)
      errorMessage.value = '登出失敗，請稍後再試'
      isLoggingOut.value = false
    } else {
      Log.msg('handleLogout', '登出成功，導向登入頁面')
      router.push('/login')
    }
  } catch (error) {
    Log.error('handleLogout', '登出發生錯誤:', error)
    errorMessage.value = '登出過程發生錯誤'
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-cream) 0%, var(--bg-cream-dark) 100%);
  display: flex;
  flex-direction: column;
}

.profile-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg) var(--spacing-md);
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

/* Profile Card - 放在上方,寬度填滿 */
.profile-card {
  background: var(--bg-white);
  border-radius: var(--radius-xlarge);
  box-shadow: var(--shadow-heavy);
  padding: var(--spacing-lg);
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
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

/* 左側:頭像區域 */
.avatar-section {
  flex-shrink: 0;
}

.avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: var(--shadow-medium);
  border: 4px solid var(--primary-brown);
}

/* 右側:使用者資訊 */
.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-xs);
}

.user-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-brown);
  margin: 0;
}

.user-provider {
  font-size: 0.9rem;
  color: var(--text-light);
  margin: 0;
}

/* 功能按鈕區域 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
}

.action-btn {
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

.action-btn svg {
  width: 20px;
  height: 20px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.action-btn:active {
  transform: translateY(0);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.edit-btn {
  background: var(--primary-brown);
  color: white;
}

.edit-btn:hover {
  background: var(--primary-brown-dark);
}

.logout-btn {
  background: white;
  color: var(--primary-brown);
  border: 2px solid var(--primary-brown);
}

.logout-btn:hover {
  background: var(--bg-cream);
}

/* 載入動畫 */
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(139, 111, 71, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary-brown);
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
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-medium);
  font-size: 0.875rem;
  text-align: center;
  border: 1px solid #fcc;
  width: 100%;
}

/* 響應式設計 */
@media (min-width: 768px) {
  .profile-card {
    padding: var(--spacing-xl);
  }

  .avatar-img {
    width: 100px;
    height: 100px;
  }

  .user-name {
    font-size: 1.75rem;
  }

  .action-buttons {
    flex-direction: row;
  }

  .action-btn {
    flex: 1;
  }
}

@media (min-width: 1024px) {
  .avatar-img {
    width: 120px;
    height: 120px;
  }

  .user-name {
    font-size: 2rem;
  }
}
</style>