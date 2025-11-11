import { useAuth } from './authStore'

/**
 * 需要認證的路由守衛
 * 使用方式: 在 router 的 meta 中加入 { requiresAuth: true }
 */
export function requireAuth(to, from, next) {
  const { isAuthenticated, loading } = useAuth()
  
  Log.msg('authGuard', `檢查路由 ${to.path} 是否需要認證`)
  
  // 等待認證狀態載入完成
  if (loading.value) {
    Log.msg('authGuard', '認證狀態載入中，等待...')
    // 可以顯示載入畫面
    setTimeout(() => requireAuth(to, from, next), 100)
    return
  }
  
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    Log.msg('authGuard', '使用者未登入，導向登入頁面')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}

/**
 * 已登入用戶不能訪問的路由守衛
 * 例如: 登入頁面，已登入用戶訪問時導向首頁
 * 使用方式: 在 router 的 meta 中加入 { guestOnly: true }
 */
export function guestOnly(to, from, next) {
  const { isAuthenticated, loading } = useAuth()
  
  // 等待認證狀態載入完成
  if (loading.value) {
    setTimeout(() => guestOnly(to, from, next), 100)
    return
  }
  
  if (to.meta.guestOnly && isAuthenticated.value) {
    Log.msg('authGuard', '使用者已登入，導向首頁')
    next('/')
  } else {
    next()
  }
}

/**
 * 通用路由守衛 - 同時處理需要認證和訪客限制
 */
export function authGuard(to, from, next) {
  const { isAuthenticated, loading } = useAuth()
  
  // 等待認證狀態載入完成
  if (loading.value) {
    setTimeout(() => authGuard(to, from, next), 100)
    return
  }
  
  // 檢查是否需要認證
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    Log.msg('authGuard', '使用者未登入，導向登入頁面')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // 檢查是否僅供訪客
  if (to.meta.guestOnly && isAuthenticated.value) {
    Log.msg('authGuard', '使用者已登入，導向首頁')
    next('/')
    return
  }
  
  next()
}
