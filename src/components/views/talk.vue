<template>
  <div class="talk-container">
    <div class="talk-header">
      <i class="fas fa-comment-dots header-icon"></i>
      <h2 class="talk-title">回遊 ReTrip AI</h2>
    </div>
    
    <div class="talk-input-wrapper">
      <input 
        v-model="userInput"
        type="text"
        class="talk-input"
        placeholder="我印象中有個地方....."
        @keyup.enter="handleSubmit"
      />
      <button 
        class="talk-submit-button"
        @click="handleSubmit"
        :disabled="!userInput.trim()"
      >
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userInput = ref('');

// 送出按鈕點擊事件
const handleSubmit = () => {
  if (userInput.value.trim()) {
    // 導航到 AI 頁面，使用 state 安全地傳遞用戶輸入（不會出現在 URL）
    router.push({
      name: 'Ai',
      state: {
        message: userInput.value
      }
    });
  }
};
</script>

<style scoped>
@import '@/assets/main.css';

/* 手機版設計（預設） */
.talk-container {
  width: min(95%, 100%);
  margin: 0 auto;
  padding: 14px;
  background-color: var(--bg-card);
  border-radius: var(--radius-large);
  font-family: 'Noto Sans TC', sans-serif;
  box-sizing: border-box;
}

.talk-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.header-icon {
  color: var(--text-brown);
  font-size: 24px;
}

.talk-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-brown);
  margin: 0;
}

.talk-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.talk-input {
  flex: 1 1 auto; /* 讓它能撐滿也能收縮 */
  padding: 12px 16px;
  min-width: 0;
  font-size: 16px;
  color: var(--text-primary);
  background-color: var(--bg-white);
  border: 2px solid var(--border-light);
  border-radius: 25px;
  outline: none;
  transition: border-color 0.3s ease;
  font-family: 'Noto Sans TC', sans-serif;
}

.talk-input::placeholder {
  color: var(--text-secondary);
}

.talk-input:focus {
  border-color: var(--text-brown);
}

.talk-submit-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--accent-coral);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(212, 117, 107, 0.3);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.talk-submit-button:disabled {
  background-color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.5;
}

.talk-submit-button:not(:disabled):active {
  transform: scale(0.95);
  box-shadow: 0 2px 6px rgba(212, 117, 107, 0.3);
}

.talk-submit-button i {
  color: var(--bg-white);
  font-size: 20px;
}

/* 平板尺寸（大於 768px） */
@media (min-width: 768px) {
  .talk-container {
    padding: 24px 20px;
    border-radius: var(--radius-xlarge);
  }

  .talk-header {
    gap: 16px;
    margin-bottom: 20px;
  }

  .header-icon {
    font-size: 28px;
  }

  .talk-title {
    font-size: 28px;
  }

  .talk-input-wrapper {
    gap: 16px;
  }

  .talk-input {
    padding: 14px 20px;
    font-size: 17px;
  }

  .talk-submit-button {
    width: 56px;
    height: 56px;
  }

  .talk-submit-button:not(:disabled):hover {
    background-color: var(--accent-coral-hover);
    transform: scale(1.05);
    box-shadow: 0 3px 12px rgba(212, 117, 107, 0.4);
  }

  .talk-submit-button:not(:disabled):active {
    transform: scale(0.95);
  }

  .talk-submit-button i {
    font-size: 22px;
  }
}

/* 桌面尺寸（大於 1024px） */
@media (min-width: 1024px) {
  .talk-container {
    padding: 28px 24px;
  }

  .talk-header {
    gap: 18px;
    margin-bottom: 24px;
  }

  .header-icon {
    font-size: 32px;
  }

  .talk-title {
    font-size: 32px;
  }

  .talk-input {
    padding: 16px 24px;
    font-size: 18px;
  }

  .talk-submit-button {
    width: 60px;
    height: 60px;
  }

  .talk-submit-button i {
    font-size: 24px;
  }
}
</style>