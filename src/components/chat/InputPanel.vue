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
  
  // 不再调整高度，只处理输入事件
  // 高度已固定，只需确保滚动条正常工作
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
  <div class="chat-input-panel">
    <!-- 表情包和图标工具栏 -->
    <div class="icons-toolbar">
      <div class="icons-group">
        <button 
          class="icon-btn emoji-btn" 
          title="表情"
          @click="toggleEmojiPicker"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </button>
        
        <button 
          class="icon-btn history-btn" 
          title="历史记录"
          @click="toggleHistoryPanel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </button>
        
        <button 
          class="icon-btn file-btn" 
          title="发送文件"
          @click="selectFile"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <!-- 聊天输入区域 -->
    <div class="input-area">
      <div class="input-container">
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
.chat-input-panel {
  width: 100%;
  position: relative;
  background-color: var(--ios-bg-primary);
  border-top: 1px solid var(--ios-border-color);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 表情包和图标工具栏 */
.icons-toolbar {
  width: 100%;
  margin-bottom: 10px;
}

.icons-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ios-bg-tertiary);
  color: var(--ios-text-secondary);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background-color: var(--ios-bg-quaternary);
  color: var(--ios-text-primary);
  transform: translateY(-1px);
}

.icon-btn:active {
  transform: scale(0.95);
}

/* 聊天输入区域 */
.input-area {
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.input-container {
  flex: 1;
  position: relative;
}

.message-input {
  width: 100%;
  height: 120px;
  padding: 12px 15px;
  border-radius: 18px;
  background-color: var(--ios-bg-tertiary);
  border: 1px solid var(--ios-border-color);
  outline: none;
  resize: none;
  font-size: 15px;
  line-height: 1.5;
  color: var(--ios-text-primary);
  overflow-y: auto;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.message-input:focus {
  border-color: var(--ios-accent-color-lighter);
  box-shadow: 0 1px 5px rgba(var(--ios-accent-color-rgb), 0.2);
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

.message-input::placeholder {
  color: var(--ios-text-tertiary);
  opacity: 0.7;
}

.send-button {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ios-accent-color);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.5;
  pointer-events: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  margin-bottom: 10px;
}

.send-button.active {
  opacity: 1;
  pointer-events: auto;
}

.send-button.active:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(var(--ios-accent-color-rgb), 0.3);
}

/* 表情选择器 */
.emoji-picker {
  position: absolute;
  top: 50px;
  left: 12px;
  background-color: var(--ios-bg-primary);
  border-radius: 12px;
  border: 1px solid var(--ios-border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 100;
  animation: fadeIn 0.2s ease;
  max-height: 280px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--ios-text-quaternary) transparent;
}

.emoji-picker::-webkit-scrollbar {
  width: 4px;
}

.emoji-picker::-webkit-scrollbar-track {
  background: transparent;
}

.emoji-picker::-webkit-scrollbar-thumb {
  background-color: var(--ios-text-quaternary);
  border-radius: 2px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.emoji-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
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
  top: 50px;
  left: 50px;
  background-color: var(--ios-bg-primary);
  border-radius: 12px;
  border: 1px solid var(--ios-border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  width: 260px;
  max-height: 280px;
  z-index: 100;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--ios-border-color);
}

.history-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0;
}

.close-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ios-bg-tertiary);
  color: var(--ios-text-tertiary);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: var(--ios-bg-quaternary);
  color: var(--ios-text-primary);
}

.history-content {
  max-height: 230px;
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
  padding: 16px 12px;
  text-align: center;
  color: var(--ios-text-tertiary);
}

.history-list {
  padding: 6px 0;
}

.history-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  background-color: var(--ios-bg-tertiary);
}

.history-text {
  margin: 0 0 3px;
  font-size: 13px;
  line-height: 1.4;
  color: var(--ios-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 11px;
  color: var(--ios-text-tertiary);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .chat-input-panel {
    padding: 8px 10px;
  }
  
  .icons-toolbar {
    margin-bottom: 8px;
  }
  
  .icons-group {
    gap: 10px;
  }
  
  .icon-btn {
    width: 28px;
    height: 28px;
  }
  
  .icon-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .input-area {
    gap: 6px;
  }
  
  .message-input {
    height: 50px;
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .send-button {
    width: 36px;
    height: 36px;
    min-width: 36px;
    margin-bottom: 7px;
  }
  
  .send-button svg {
    width: 18px;
    height: 18px;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 5px;
  }
  
  .emoji-item {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
  
  .history-panel {
    width: 240px;
    left: 40px;
  }
  
  .emoji-picker,
  .history-panel {
    top: 45px;
    max-height: 240px;
  }
}
</style>
