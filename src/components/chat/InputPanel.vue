<script setup>
import { ref, computed } from 'vue'
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
// 是否正在输入
const isTyping = ref(false)
// 文件上传输入引用
const fileInput = ref(null)
// 是否显示表情选择器
const showEmojiPicker = ref(false)
// 是否显示更多功能面板
const showMorePanel = ref(false)

// 计算消息是否可发送
const canSend = computed(() => {
  return !props.disabled && messageText.value.trim().length > 0
})

// 计算剩余字符数
const remainingChars = computed(() => {
  return props.maxLength - messageText.value.length
})

// 发送文本消息
const sendTextMessage = () => {
  if (!canSend.value) return
  
  const text = messageText.value.trim()
  
  emit('send', {
    type: MessageType.TEXT,
    content: text
  })
  
  // 清空输入框
  messageText.value = ''
  // 重置状态
  isTyping.value = false
}

// 处理输入事件
const handleInput = () => {
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

// 处理按键事件
const handleKeydown = (event) => {
  // 按Enter发送消息，按Shift+Enter换行
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendTextMessage()
  }
}

// 选择并发送图片
const selectImage = async () => {
  try {
    let files
    
    if (isElectron()) {
      // 使用Electron的文件选择对话框
      const { FileSystemAccess } = await import('../../modules/electron-bridge')
      const filePaths = await FileSystemAccess.openFileDialog({
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
        properties: ['openFile']
      })
      
      if (!filePaths || filePaths.length === 0) return
      
      // 读取文件内容
      const fs = window.require('fs').promises
      const buffer = await fs.readFile(filePaths[0])
      const blob = new Blob([buffer])
      const file = new File([blob], filePaths[0].split(/[\\/]/).pop(), { type: getFileType(filePaths[0]) })
      files = [file]
    } else {
      // 使用Web的文件选择对话框
      files = await WebFileAccess.openFileDialog({
        filters: [{ extensions: ['jpg', 'jpeg', 'png', 'gif'] }]
      })
      
      if (!files || files.length === 0) return
    }
    
    // 处理选中的图片文件
    handleImageFile(files[0])
  } catch (error) {
    console.error('选择图片失败:', error)
  }
}

// 处理图片文件
const handleImageFile = (file) => {
  const reader = new FileReader()
  
  reader.onload = (e) => {
    // 发送图片消息
    emit('send', {
      type: MessageType.IMAGE,
      content: e.target.result
    })
  }
  
  reader.readAsDataURL(file)
}

// 选择并发送文件
const selectFile = async () => {
  try {
    let files
    
    if (isElectron()) {
      // 使用Electron的文件选择对话框
      const { FileSystemAccess } = await import('../../modules/electron-bridge')
      const filePaths = await FileSystemAccess.openFileDialog({
        properties: ['openFile']
      })
      
      if (!filePaths || filePaths.length === 0) return
      
      // 读取文件信息
      const fs = window.require('fs').promises
      const stats = await fs.stat(filePaths[0])
      const fileName = filePaths[0].split(/[\\/]/).pop()
      
      // 发送文件消息
      emit('send', {
        type: MessageType.FILE,
        content: {
          path: filePaths[0],
          name: fileName,
          size: formatFileSize(stats.size)
        }
      })
    } else {
      // 使用Web的文件选择对话框
      files = await WebFileAccess.openFileDialog({})
      
      if (!files || files.length === 0) return
      
      // 发送文件消息
      emit('send', {
        type: MessageType.FILE,
        content: {
          file: files[0],
          name: files[0].name,
          size: formatFileSize(files[0].size)
        }
      })
    }
  } catch (error) {
    console.error('选择文件失败:', error)
  }
}

// 录制并发送语音消息
const recordVoice = () => {
  // 语音录制功能实现
  // ...
}

// 添加表情
const addEmoji = (emoji) => {
  messageText.value += emoji
  showEmojiPicker.value = false
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

// 获取文件类型
const getFileType = (filePath) => {
  const extension = filePath.split('.').pop().toLowerCase()
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif'
  }
  return mimeTypes[extension] || 'application/octet-stream'
}

// 防抖计时器
let typingTimeout
</script>

<template>
  <div class="input-panel">
    <div class="toolbar">
      <button class="toolbar-btn" @click="selectImage" :disabled="disabled" title="发送图片">
        <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      </button>
      <button class="toolbar-btn" @click="selectFile" :disabled="disabled" title="发送文件">
        <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
      </button>
      <button class="toolbar-btn" @click="recordVoice" :disabled="disabled" title="发送语音">
        <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
        </svg>
      </button>
      <button class="toolbar-btn" @click="showEmojiPicker = !showEmojiPicker" :disabled="disabled" title="表情">
        <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
      </button>
    </div>
    
    <div class="input-area">
      <textarea
        v-model="messageText"
        class="message-textarea"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :disabled="disabled"
        @input="handleInput"
        @keydown="handleKeydown"
      ></textarea>
      
      <div class="input-footer">
        <div class="char-counter" v-if="messageText.length > 0">
          {{ messageText.length }}/{{ maxLength }}
        </div>
        
        <button 
          class="send-btn" 
          :class="{ 'active': canSend }"
          @click="sendTextMessage" 
          :disabled="!canSend || disabled"
        >
          <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 表情选择器 -->
    <div v-if="showEmojiPicker" class="emoji-picker glass-container">
      <div class="emoji-grid">
        <button 
          v-for="emoji in ['😀', '😂', '😊', '😍', '🤔', '😎', '👍', '👏', '🎉', '❤️', '🔥', '✨', '🌟', '💯', '🙏', '🤝', '🤗', '🤣', '😅', '😇']" 
          :key="emoji" 
          class="emoji-btn"
          @click="addEmoji(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-panel {
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 4px;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 4px 0;
  gap: 4px;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: var(--transition-base);
}

.toolbar-btn:hover:not(:disabled) {
  background-color: var(--hover-color);
  color: var(--text-primary);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-area {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  border: 1px solid transparent;
}

.input-area:focus-within {
  background-color: var(--bg-quaternary);
  border-color: var(--border-color);
}

.message-textarea {
  width: 100%;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 12px;
  border: none;
  border-radius: var(--radius-lg);
  background-color: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  overflow-y: auto;
}

.message-textarea:focus {
  outline: none;
}

.message-textarea::placeholder {
  color: var(--text-tertiary);
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 8px;
}

.char-counter {
  font-size: 11px;
  color: var(--text-tertiary);
}

.send-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-quaternary);
  color: var(--text-tertiary);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: var(--transition-base);
}

.send-btn.active {
  background-color: var(--primary-color);
  color: white;
}

.send-btn.active:hover {
  background-color: var(--primary-dark);
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 表情选择器 */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 280px;
  max-height: 200px;
  background-color: rgba(255, 255, 255, var(--blur-opacity));
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  padding: 12px;
  margin-bottom: 8px;
  z-index: 100;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.emoji-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  border-radius: var(--radius-md);
  font-size: 18px;
  cursor: pointer;
  transition: var(--transition-base);
}

.emoji-btn:hover {
  background-color: var(--hover-color);
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .toolbar-btn {
    width: 28px;
    height: 28px;
  }
  
  .message-textarea {
    min-height: 36px;
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .send-btn {
    width: 28px;
    height: 28px;
  }
  
  .emoji-picker {
    width: 240px;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
  }
  
  .emoji-btn {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
}
</style>
