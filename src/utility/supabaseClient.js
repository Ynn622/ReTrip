import { createClient } from '@supabase/supabase-js'

// Supabase 配置
// 請將這些值替換為你的 Supabase 專案資訊
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// 取得完整的重定向 URL（包含 base path）
const getRedirectUrl = (path = '/profile') => {
  const baseUrl = window.location.origin
  const basePath = import.meta.env.BASE_URL || '/'
  // 確保路徑格式正確
  const fullPath = `${basePath}${path}`.replace(/\/+/g, '/').replace(/\/$/, '')
  return `${baseUrl}${fullPath}`
}

// 建立 Supabase 客戶端
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

/**
 * 使用 Google 登入
 * @returns {Promise<{data, error}>}
 */
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl('/profile'),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    return { data, error }
  } catch (error) {
    console.error('Google 登入錯誤:', error)
    return { data: null, error }
  }
}

/**
 * 使用 Facebook 登入
 * @returns {Promise<{data, error}>}
 */
export async function signInWithFacebook() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: getRedirectUrl('/profile'),
        scopes: 'email'
      }
    })
    return { data, error }
  } catch (error) {
    console.error('Facebook 登入錯誤:', error)
    return { data: null, error }
  }
}

/**
 * 登出
 * @returns {Promise<{error}>}
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error('登出錯誤:', error)
    return { error }
  }
}

/**
 * 取得當前使用者
 * @returns {Promise<{data, error}>}
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { data: user, error }
  } catch (error) {
    console.error('取得使用者錯誤:', error)
    return { data: null, error }
  }
}

/**
 * 取得當前 Session
 * @returns {Promise<{data, error}>}
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { data: session, error }
  } catch (error) {
    console.error('取得 Session 錯誤:', error)
    return { data: null, error }
  }
}

/**
 * 監聽認證狀態變化
 * @param {Function} callback - 狀態變化時的回調函數
 * @returns {Object} - 取消訂閱的函數
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
  return subscription
}
