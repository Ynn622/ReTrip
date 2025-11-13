<template>
    <div class="ai-chat">
        <Nav />
        <main class="chat-container">
            <!-- 聊天訊息區域 -->
            <div class="messages-area" ref="messagesArea">
                <!-- 空狀態提示 -->
                <div v-if="messages.length === 0" class="empty-state">
                    來尋找你記憶中的地方吧！
                </div>

                <!-- 訊息列表 -->
                <div v-for="(message, index) in messages" :key="index" 
                     :class="['message-bubble', message.type]">
                    <div class="message-content" v-if="message.type === 'user' || message.type === 'ai'">
                        {{ message.text }}
                    </div>
                    <!-- 景點橫向滾動區域 -->
                    <div v-if="message.type === 'attractions'" class="attractions-scroll">
                        <attraction 
                            v-for="attractionId in message.ids" 
                            :key="attractionId"
                            :attractionID="attractionId"
                            :collectionText="'相關景點'"
                        />
                    </div>
                </div>

                <!-- 載入動畫 -->
                <div v-if="isLoading" class="message-bubble ai">
                    <div class="message-content loading-message">
                        <div class="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部輸入區 -->
            <div class="input-area">
                <button class="add-btn" @click="handleAddClick">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>

                <!-- 上傳選項彈出框 -->
                <div v-if="showUploadMenu" class="upload-menu">
                    <button class="upload-option" @click="handleImageUpload">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                            <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>上傳圖片</span>
                    </button>
                    <button class="upload-option" @click="handleAudioUpload">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 1C12 1 8 1 8 5V12C8 16 12 16 12 16C12 16 16 16 16 12V5C16 1 12 1 12 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 19V23M8 23H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>上傳音檔</span>
                    </button>
                </div>

                <input 
                    v-model="userInput"
                    type="text" 
                    class="message-input"
                    placeholder="我印象中有個地方......"
                    @keyup.enter="sendMessage"
                    :disabled="isLoading"
                />
                <button class="send-btn" @click="sendMessage" :disabled="isLoading || !userInput.trim()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
                              stroke="currentColor" 
                              stroke-width="2" 
                              stroke-linecap="round" 
                              stroke-linejoin="round"/>
                    </svg>
                </button>

                <!-- 隱藏的檔案輸入 -->
                <input 
                    ref="imageInput" 
                    type="file" 
                    accept="image/*" 
                    style="display: none;"
                    @change="onImageSelected"
                />
                <input 
                    ref="audioInput" 
                    type="file" 
                    accept="audio/*" 
                    style="display: none;"
                    @change="onAudioSelected"
                />
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Nav from '@/components/views/nav.vue'
import attraction from '@/components/attraction.vue'
import { callAPI } from '@/utility/apiConfig'
import { Log } from '@/utility/logger'

const router = useRouter()
const messages = ref([])
const userInput = ref('')
const messagesArea = ref(null)
const showUploadMenu = ref(false)
const imageInput = ref(null)
const audioInput = ref(null)
const isLoading = ref(false) // 載入狀態

// 檢查是否包含記憶相關關鍵字
const hasMemoryKeywords = (text) => {
    const keywords = ['回憶', '記憶', '曾經', '曾今', '印象', '記得', '懷念', '熟悉', '想', '記憶中', '去']
    return keywords.some(keyword => text.includes(keyword))
}

// 自動滾動到最底部
const scrollToBottom = () => {
    nextTick(() => {
        if (messagesArea.value) {
            messagesArea.value.scrollTop = messagesArea.value.scrollHeight
        }
    })
}

// 發送訊息
const sendMessage = async () => {
    if (!userInput.value.trim() || isLoading.value) return

    // 設置載入狀態
    isLoading.value = true

    // 添加使用者訊息
    const userMessage = userInput.value.trim()
    messages.value.push({
        type: 'user',
        text: userMessage
    })

    // 清空輸入框
    userInput.value = ''
    scrollToBottom()

    try {
        // 檢查是否包含記憶關鍵字
        if (hasMemoryKeywords(userMessage)) {
            // 呼叫 /chat/search API
            const response = await callAPI({
                method: 'POST',
                url: '/chat/search',
                body: { message: userMessage },
                funcName: 'chatSearch'
            })

            // 過濾掉空字串的 ID
            const validIds = response.ids.filter(id => id && id.trim() !== '')

            Log.msg('找到相關景點ID:', validIds)
            
            if (validIds.length > 0) {
                // 添加景點訊息
                messages.value.push({
                    type: 'attractions',
                    ids: validIds
                })
            } else {
                // 沒有找到相關景點
                messages.value.push({
                    type: 'ai',
                    text: '抱歉，找不到相關的景點記憶。'
                })
            }
        } else {
            // 呼叫 /chat/ask API
            const response = await callAPI({
                method: 'POST',
                url: '/chat/ask',
                body: { message: userMessage },
                funcName: 'chatAsk'
            })

            // 顯示回答
            messages.value.push({
                type: 'ai',
                text: response.answer
            })
        }
    } catch (error) {
        console.error('API 呼叫失敗:', error)
        messages.value.push({
            type: 'ai',
            text: '抱歉，發生錯誤，請稍後再試。'
        })
    } finally {
        // 無論成功或失敗，都要取消載入狀態
        isLoading.value = false
    }

    scrollToBottom()
}

// 處理從其他頁面傳來的訊息
const handleIncomingMessage = () => {
    // 從 router state 取得訊息
    const state = history.state
    if (state && state.message) {
        // 設定輸入框內容
        userInput.value = state.message
        
        // 自動發送訊息
        nextTick(() => {
            sendMessage()
        })

        // 清除 state，避免重新整理時重複發送
        router.replace({ 
            name: 'Ai',
            state: {} 
        })
    }
}

// 處理加號按鈕點擊
const handleAddClick = () => {
    showUploadMenu.value = !showUploadMenu.value
}

// 處理圖片上傳
const handleImageUpload = () => {
    showUploadMenu.value = false
    imageInput.value?.click()
}

// 處理音檔上傳
const handleAudioUpload = () => {
    showUploadMenu.value = false
    audioInput.value?.click()
}

// 圖片選擇後的處理
const onImageSelected = (event) => {
    const file = event.target.files[0]
    if (file) {
        console.log('已選擇圖片:', file.name)
        
        // 添加訊息顯示已上傳圖片
        messages.value.push({
            type: 'user',
            text: `📷 已上傳圖片: ${file.name}`
        })
        scrollToBottom()

        // TODO: 未來上傳圖片到伺服器
        // uploadFile(file, 'image')
        
        // 模擬 AI 回覆
        setTimeout(() => {
            messages.value.push({
                type: 'ai',
                text: '敬請期待'
            })
            scrollToBottom()
        }, 500)
    }
    // 清空 input，允許重複上傳同一檔案
    event.target.value = ''
}

// 音檔選擇後的處理
const onAudioSelected = (event) => {
    const file = event.target.files[0]
    if (file) {
        console.log('已選擇音檔:', file.name)
        
        // 添加訊息顯示已上傳音檔
        messages.value.push({
            type: 'user',
            text: `🎵 已上傳音檔: ${file.name}`
        })
        scrollToBottom()

        // TODO: 未來上傳音檔到伺服器
        // uploadFile(file, 'audio')
        
        // 模擬 AI 回覆
        setTimeout(() => {
            messages.value.push({
                type: 'ai',
                text: '敬請期待'
            })
            scrollToBottom()
        }, 500)
    }
    // 清空 input，允許重複上傳同一檔案
    event.target.value = ''
}

// 點擊外部關閉選單
const handleClickOutside = (event) => {
    if (showUploadMenu.value) {
        const uploadMenu = document.querySelector('.upload-menu')
        const addBtn = document.querySelector('.add-btn')
        if (uploadMenu && !uploadMenu.contains(event.target) && !addBtn.contains(event.target)) {
            showUploadMenu.value = false
        }
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    // 檢查是否有從其他頁面傳來的訊息
    handleIncomingMessage()
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

// 未來串接 API 的函數（預留）
// const callAIAPI = async (message) => {
//     try {
//         const response = await fetch('YOUR_API_ENDPOINT', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ message })
//         })
//         const data = await response.json()
//         messages.value.push({
//             type: 'ai',
//             text: data.response
//         })
//         scrollToBottom()
//     } catch (error) {
//         console.error('API Error:', error)
//     }
// }

// 未來上傳檔案的函數（預留）
// const uploadFile = async (file, type) => {
//     const formData = new FormData()
//     formData.append('file', file)
//     formData.append('type', type)
//     
//     try {
//         const response = await fetch('YOUR_UPLOAD_ENDPOINT', {
//             method: 'POST',
//             body: formData
//         })
//         const data = await response.json()
//         console.log('上傳成功:', data)
//     } catch (error) {
//         console.error('上傳失敗:', error)
//     }
// }
</script>

<style scoped>
@import '@/assets/main.css';

/* 手機優先設計 */
.ai-chat {
    width: 100%;
    height: 100vh;
    height: 100dvh; /* 使用動態視窗高度，更適合手機 */
    background: var(--bg-cream);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
}

.chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0; /* 重要：讓 flex 子元素可以正確收縮 */
}

/* 訊息區域 */
.messages-area {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--spacing-md);
    padding-bottom: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    min-height: 0; /* 重要：讓內容可以正確滾動 */
}

/* 空狀態提示 */
.empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #ccc;
    font-weight: 300;
    letter-spacing: 0.5px;
}

/* 訊息氣泡 */
.message-bubble {
    max-width: 80%;
    animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 使用者訊息（右側） */
.message-bubble.user {
    align-self: flex-end;
    margin-left: auto;
}

.message-bubble.user .message-content {
    background: var(--bg-white);
    color: var(--text-primary);
    border-radius: var(--radius-large);
    border-bottom-right-radius: 4px;
    padding: 12px 16px;
    box-shadow: var(--shadow-light);
}

/* AI 訊息（左側） */
.message-bubble.ai {
    align-self: flex-start;
}

.message-bubble.ai .message-content {
    background: var(--bg-white);
    color: var(--text-primary);
    border-radius: var(--radius-large);
    border-bottom-left-radius: 4px;
    padding: 12px 16px;
    box-shadow: var(--shadow-light);
    line-height: 1.5;
    white-space: pre-line;
}

/* 景點橫向滾動區域 */
.message-bubble.attractions {
    width: 100%;
    max-width: 100%;
}

.attractions-scroll {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding: 12px 0;
    scrollbar-width: thin;
    scrollbar-color: var(--border-light) transparent;
}

.attractions-scroll::-webkit-scrollbar {
    height: 6px;
}

.attractions-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.attractions-scroll::-webkit-scrollbar-thumb {
    background: var(--border-light);
    border-radius: 3px;
}

.attractions-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--border-medium);
}

/* 載入動畫 */
.loading-message {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 80px;
}

.typing-indicator {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--primary-brown);
    opacity: 0.4;
    animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
    animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 60%, 100% {
        opacity: 0.4;
        transform: scale(1);
    }
    30% {
        opacity: 1;
        transform: scale(1.3);
    }
}

/* 底部輸入區 */
.input-area {
    background: var(--bg-cream);
    padding: var(--spacing-md);
    padding-bottom: max(var(--spacing-md), env(safe-area-inset-bottom));
    border-top: 1px solid var(--border-light);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    position: relative;
    flex-shrink: 0; /* 防止輸入區被壓縮 */
}

/* 上傳選項彈出框 */
.upload-menu {
    position: absolute;
    bottom: calc(100% + 8px);
    left: var(--spacing-md);
    background: var(--bg-white);
    border-radius: var(--radius-medium);
    box-shadow: var(--shadow-medium);
    padding: var(--spacing-xs);
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 100;
    animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.upload-option {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: 12px 16px;
    border: none;
    background: transparent;
    color: var(--text-primary);
    border-radius: var(--radius-small);
    cursor: pointer;
    transition: background 0.2s ease;
    font-size: 15px;
    white-space: nowrap;
}

.upload-option:hover {
    background: var(--bg-cream-dark);
}

.upload-option:active {
    background: var(--bg-cream);
}

.upload-option svg {
    width: 24px;
    height: 24px;
    color: var(--primary-brown);
    flex-shrink: 0;
}

/* 加號按鈕 */
.add-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: transparent;
    border: 2px solid var(--primary-brown);
    color: var(--primary-brown);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.add-btn:hover {
    background: var(--primary-brown);
    color: white;
}

.add-btn:active {
    transform: scale(0.95);
}

/* 輸入框 */
.message-input {
    flex: 1;
    height: 44px;
    border: 1px solid var(--border-medium);
    border-radius: 22px;
    padding: 0 20px;
    font-size: 16px;
    background: var(--bg-white);
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s ease;
}

.message-input::placeholder {
    color: #999;
}

.message-input:focus {
    border-color: var(--primary-brown);
}

.message-input:disabled {
    background: var(--bg-cream);
    color: var(--text-secondary);
    cursor: not-allowed;
    opacity: 0.6;
}

/* 傳送按鈕 */
.send-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--primary-brown);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
    background: var(--primary-brown-dark);
}

.send-btn:active:not(:disabled) {
    transform: scale(0.95);
}

.send-btn:disabled {
    background: var(--text-secondary);
    cursor: not-allowed;
    opacity: 0.5;
}

/* 平板以上 */
@media (min-width: 768px) {
    .messages-area {
        padding: var(--spacing-lg);
    }

    .message-bubble {
        max-width: 70%;
    }
}

/* 桌面 */
@media (min-width: 1024px) {
    .message-bubble {
        max-width: 60%;
    }
}

/* 滾動條美化 */
.messages-area::-webkit-scrollbar {
    width: 6px;
}

.messages-area::-webkit-scrollbar-track {
    background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
    background: var(--border-light);
    border-radius: 3px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
    background: var(--border-medium);
}
</style>
