<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { MessageType } from '../../modules/im-core'
import { isElectron } from '../../modules/electron-bridge'
import { isWeb, FileSystemAccess as WebFileAccess } from '../../modules/web-adapter'

// 定义组件属性
const props = defineProps({
  placeholder: {
    type: String,
    default: '输入消息...'
  },
  maxLength: {
    type: Number,
    default: 5000
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['send', 'typing'])

// 消息内容
const messageText = ref('')
// 输入框引用
const messageInput = ref(null)
// 是否正在输入
const isTyping = ref(false)
// 文件上传输入引用
const fileInput = ref(null)
// 是否显示表情选择器
const showEmojiPicker = ref(false)
const emojiPicker = ref(null)
// 是否显示历史记录面板
const showHistoryPanel = ref(false)
const historyPanel = ref(null)

// 历史消息记录
const historyMessages = ref([])

let typingTimeout = null

// 表情列表
const emojiList = [
  '😀', '😂', '😊', '😍', '🤔', '😎', '👍', '👏', 
  '🎉', '❤️', '🔥', '✨', '🌟', '💯', '🙏', '🤝', 
  '🤗', '🤣', '😅', '😇', '😉', '😌', '😜', '😴',
  '😷', '🤒', '🤓', '😎', '😡', '😱', '😭', '😳',
  '🥰', '🥳', '🥴', '🥺', '🤭', '🤫', '🤔', '🤨'
]

// 计算消息是否可发送
const canSend = computed(() => {
  return !props.disabled && messageText.value.trim().length > 0
})

// 发送文本消息
const sendTextMessage = () => {
  if (!canSend.value) return
  
  const text = messageText.value.trim()
  
  // 保存到历史记录
  saveToHistory(text)
  
  emit('send', {
    type: MessageType.TEXT,
    content: text
  })
  
  // 清空输入框
  messageText.value = ''
  // 重置状态
  isTyping.value = false
  
  // 重置输入框高度
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
    }
  })
}

// 保存消息到历史记录
const saveToHistory = (text) => {
  // 避免重复添加相同的消息
  if (historyMessages.value.length > 0 && historyMessages.value[0] === text) {
    return
  }
  
  // 添加到历史记录开头
  historyMessages.value.unshift(text)
  
  // 限制历史记录数量
  if (historyMessages.value.length > 20) {
    historyMessages.value = historyMessages.value.slice(0, 20)
  }
  
  // 保存到本地存储
  localStorage.setItem('chat-history', JSON.stringify(historyMessages.value))
}

// 从历史记录中使用消息
const useHistoryMessage = (text) => {
  messageText.value = text
  showHistoryPanel.value = false
  
  // 聚焦输入框
  nextTick(() => {
    messageInput.value.focus()
    autoResizeTextarea()
  })
}

// 格式化历史记录时间
const formatHistoryTime = (index) => {
  // 这里只是模拟时间，实际应用中应该存储真实的时间戳
  const now = new Date()
  const minutes = index * 5 + 1
  const time = new Date(now.getTime() - minutes * 60000)
  
  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// 处理输入事件
const handleInput = () => {
  // 调整输入框高度
  autoResizeTextarea()
  
  if (!isTyping.value) {
    isTyping.value = true
    emit('typing', true)
  }
  
  // 防抖处理
  clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    isTyping.value = false
    emit('typing', false)
  }, 2000)
}

// 自动调整文本框高度
const autoResizeTextarea = () => {
  if (!messageInput.value) return
  
  messageInput.value.style.height = 'auto'
  messageInput.value.style.height = `${Math.min(messageInput.value.scrollHeight, 120)}px`
}

// 处理按键事件
const handleKeyDown = (event) => {
  // 按Enter发送消息，按Shift+Enter换行
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendTextMessage()
  }
  
  // 如果按下ESC键，关闭表情选择器和历史记录面板
  if (event.key === 'Escape') {
    showEmojiPicker.value = false
    showHistoryPanel.value = false
  }
}

// 切换表情选择器显示状态
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
  showHistoryPanel.value = false
  
  if (showEmojiPicker.value) {
    nextTick(() => {
      // 监听点击以关闭表情选择器
      document.addEventListener('click', closeEmojiPickerOnClickOutside)
    })
  }
}

// 切换历史记录面板显示状态
const toggleHistoryPanel = () => {
  showHistoryPanel.value = !showHistoryPanel.value
  showEmojiPicker.value = false
  
  if (showHistoryPanel.value) {
    nextTick(() => {
      // 监听点击以关闭历史记录面板
      document.addEventListener('click', closeHistoryPanelOnClickOutside)
    })
  }
}

// 点击外部关闭表情选择器
const closeEmojiPickerOnClickOutside = (event) => {
  if (emojiPicker.value && !emojiPicker.value.contains(event.target) && 
      !event.target.closest('.emoji-btn')) {
    showEmojiPicker.value = false
    document.removeEventListener('click', closeEmojiPickerOnClickOutside)
  }
}

// 点击外部关闭历史记录面板
const closeHistoryPanelOnClickOutside = (event) => {
  if (historyPanel.value && !historyPanel.value.contains(event.target) && 
      !event.target.closest('.history-btn')) {
    showHistoryPanel.value = false
    document.removeEventListener('click', closeHistoryPanelOnClickOutside)
  }
}

// 添加表情
const addEmoji = (emoji) => {
  messageText.value += emoji
  showEmojiPicker.value = false
  
  // 聚焦输入框
  messageInput.value.focus()
}

// 选择文件
const selectFile = () => {
  if (props.disabled) return
  
  // 触发文件选择
  fileInput.value.click()
}

// 处理文件选择
const handleFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 根据文件类型发送不同类型的消息
  const isImage = file.type.startsWith('image/')
  
  emit('send', {
    type: isImage ? MessageType.IMAGE : MessageType.FILE,
    content: file
  })
  
  // 清空文件输入，以便下次选择同一文件时也能触发change事件
  event.target.value = ''
}

// 组件挂载时
onMounted(() => {
  // 从本地存储加载历史记录
  const savedHistory = localStorage.getItem('chat-history')
  if (savedHistory) {
    try {
      historyMessages.value = JSON.parse(savedHistory)
    } catch (e) {
      console.error('解析历史记录失败:', e)
    }
  }
  
  // 聚焦输入框
  if (messageInput.value) {
    messageInput.value.focus()
  }
})

// 组件卸载时
onUnmounted(() => {
  // 清除事件监听
  document.removeEventListener('click', closeEmojiPickerOnClickOutside)
  document.removeEventListener('click', closeHistoryPanelOnClickOutside)
  
  // 清除定时器
  clearTimeout(typingTimeout)
})
</script>

<template>
  <div class="input-panel">
    <div class="input-toolbar">
      <div class="toolbar-left">
        <button 
          class="toolbar-btn emoji-btn" 
          title="表情"
          @click="toggleEmojiPicker"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </button>
        <button 
          class="toolbar-btn history-btn" 
          title="历史记录"
          @click="toggleHistoryPanel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </button>
        <button 
          class="toolbar-btn file-btn" 
          title="发送文件"
          @click="selectFile"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <div class="input-container">
      <div class="input-wrapper">
        <textarea
          ref="messageInput"
          v-model="messageText"
          :placeholder="placeholder"
          class="message-input"
          :maxlength="maxLength"
          :disabled="disabled"
          @input="handleInput"
          @keydown="handleKeyDown"
        ></textarea>
      </div>
      
      <button 
        class="send-button" 
        :class="{ 'active': canSend }"
        :disabled="!canSend"
        @click="sendTextMessage"
        title="发送"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>

    <!-- 表情选择器 -->
    <div 
      v-if="showEmojiPicker" 
      ref="emojiPicker" 
      class="emoji-picker"
    >
      <div class="emoji-grid">
        <div 
          v-for="(emoji, index) in emojiList" 
          :key="index"
          class="emoji-item"
          @click="addEmoji(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </div>

    <!-- 历史记录面板 -->
    <div 
      v-if="showHistoryPanel" 
      ref="historyPanel" 
      class="history-panel"
    >
      <div class="history-header">
        <h3>历史记录</h3>
        <button class="close-btn" @click="toggleHistoryPanel">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="history-content">
        <div v-if="historyMessages.length === 0" class="empty-history">
          <p>暂无历史记录</p>
        </div>
        <div v-else class="history-list">
          <div 
            v-for="(msg, index) in historyMessages" 
            :key="index"
            class="history-item"
            @click="useHistoryMessage(msg)"
          >
            <p class="history-text">{{ msg }}</p>
            <span class="history-time">{{ formatHistoryTime(index) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件上传输入 -->
    <input 
      ref="fileInput"
      type="file"
      style="display: none"
      @change="handleFileSelected"
    />
  </div>
</template>

<style scoped>
.input-panel {
  width: 100%;
  position: relative;
  background-color: var(--ios-bg-primary);
  border-top: 0.5px solid var(--ios-border-color);
  padding: 8px 0;
}

.input-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 0 12px 8px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: var(--ios-text-tertiary);
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.toolbar-btn:hover {
  background-color: var(--ios-bg-tertiary);
  color: var(--ios-text-secondary);
}

.toolbar-btn:active {
  transform: scale(0.95);
}

.input-container {
  display: flex;
  align-items: flex-end;
  padding: 0 12px;
  position: relative;
}

.input-wrapper {
  flex: 1;
  position: relative;
  margin-right: 10px;
}

.message-input {
  width: 100%;
  min-height: 36px;
  max-height: 120px;
  padding: 8px 12px;
  border-radius: 18px;
  background-color: var(--ios-bg-tertiary);
  border: none;
  outline: none;
  resize: none;
  font-size: 14px;
  line-height: 1.4;
  color: var(--ios-text-primary);
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--ios-text-quaternary) transparent;
  box-shadow: none;
}

.message-input::-webkit-scrollbar {
  width: 4px;
}

.message-input::-webkit-scrollbar-track {
  background: transparent;
}

.message-input::-webkit-scrollbar-thumb {
  background-color: var(--ios-text-quaternary);
  border-radius: 2px;
}

.message-input:focus {
  background-color: var(--ios-bg-tertiary);
  border: none;
  box-shadow: none;
}

.message-input::placeholder {
  color: var(--ios-text-tertiary);
  opacity: 0.7;
}

.send-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ios-accent-color);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  opacity: 0.5;
  pointer-events: none;
  margin-bottom: 0;
  align-self: center;
}

.send-button.active {
  opacity: 1;
  pointer-events: auto;
}

.send-button.active:hover {
  transform: scale(1.05);
}

.send-button.active:active {
  transform: scale(0.95);
}

/* 表情选择器 */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 12px;
  margin-bottom: 8px;
  background-color: var(--ios-bg-primary);
  border-radius: 16px;
  border: 0.5px solid var(--ios-border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 12px;
  z-index: 100;
  animation: slideUp 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.emoji-item {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.emoji-item:hover {
  background-color: var(--ios-bg-tertiary);
  transform: scale(1.1);
}

.emoji-item:active {
  transform: scale(0.95);
}

/* 历史记录面板 */
.history-panel {
  position: absolute;
  bottom: 100%;
  left: 12px;
  margin-bottom: 8px;
  background-color: var(--ios-bg-primary);
  border-radius: 16px;
  border: 0.5px solid var(--ios-border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  width: 300px;
  max-height: 400px;
  z-index: 100;
  animation: slideUp 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--ios-border-color);
}

.history-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0;
}

.close-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: var(--ios-text-tertiary);
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.close-btn:hover {
  background-color: var(--ios-bg-tertiary);
  color: var(--ios-text-secondary);
}

.history-content {
  max-height: 350px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--ios-text-quaternary) transparent;
}

.history-content::-webkit-scrollbar {
  width: 4px;
}

.history-content::-webkit-scrollbar-track {
  background: transparent;
}

.history-content::-webkit-scrollbar-thumb {
  background-color: var(--ios-text-quaternary);
  border-radius: 2px;
}

.empty-history {
  padding: 24px 16px;
  text-align: center;
  color: var(--ios-text-tertiary);
}

.history-list {
  padding: 8px 0;
}

.history-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.history-item:hover {
  background-color: var(--ios-bg-tertiary);
}

.history-text {
  margin: 0 0 4px;
  font-size: 14px;
  color: var(--ios-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 12px;
  color: var(--ios-text-tertiary);
}

@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .input-toolbar {
    padding: 0 8px 6px;
  }
  
  .toolbar-btn {
    width: 28px;
    height: 28px;
  }
  
  .input-container {
    padding: 0 8px;
  }
  
  .message-input {
    min-height: 32px;
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .send-button {
    width: 32px;
    height: 32px;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .emoji-item {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }
  
  .history-panel {
    width: calc(100% - 24px);
    max-height: 300px;
  }
}
</style>
