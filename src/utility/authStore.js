import { ref, computed } from 'vue'
import { supabase, getCurrentUser, getSession, onAuthStateChange } from './supabaseClient'

// 全域狀態
const user = ref(null)
const session = ref(null)
const loading = ref(true)

/**
 * 初始化認證狀態
 */
export async function initAuth() {
  loading.value = true
  try {
    // 取得當前 Session
    const { data: sessionData } = await getSession()
    session.value = sessionData
    
    // 取得當前使用者
    if (sessionData) {
      const { data: userData } = await getCurrentUser()
      user.value = userData
    }
  } catch (error) {
    console.error('初始化認證狀態錯誤:', error)
  } finally {
    loading.value = false
  }
  
  // 監聽認證狀態變化
  onAuthStateChange(async (event, newSession) => {
    console.log('Auth state changed:', event)
    session.value = newSession
    
    if (newSession) {
      const { data: userData } = await getCurrentUser()
      user.value = userData
    } else {
      user.value = null
    }
  })
}

/**
 * 使用 Composable 方式提供認證狀態和方法
 */
export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || null)
  const userMetadata = computed(() => user.value?.user_metadata || {})
  const userId = computed(() => user.value?.id || null)
  
  return {
    user,
    session,
    loading,
    isAuthenticated,
    userEmail,
    userMetadata,
    userId
  }
}
