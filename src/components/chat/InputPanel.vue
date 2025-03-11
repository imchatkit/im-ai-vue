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
    </div>
    
    <div class="input-toolbar">
      <div class="toolbar-left">
        <button class="toolbar-btn" @click="selectImage" :disabled="disabled">
          <i class="icon-image"></i>
        </button>
        <button class="toolbar-btn" @click="selectFile" :disabled="disabled">
          <i class="icon-file"></i>
        </button>
        <button class="toolbar-btn" @click="recordVoice" :disabled="disabled">
          <i class="icon-voice"></i>
        </button>
        <button class="toolbar-btn" @click="showEmojiPicker = !showEmojiPicker" :disabled="disabled">
          <i class="icon-emoji"></i>
        </button>
      </div>
      
      <div class="toolbar-right">
        <span class="char-counter" :class="{
          'warning': remainingChars < 100,
          'danger': remainingChars < 20
        }">
          {{ remainingChars }}
        </span>
        <button 
          class="send-btn" 
          @click="sendTextMessage" 
          :disabled="!canSend"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-panel {
  display: flex;
  flex-direction: column;
  background-color: #F8F9FA;
  border-top: 1px solid #CED4DA;
  padding: 12px;
  font-family: 微软雅黑, Arial, sans-serif;
}

.input-area {
  display: flex;
  flex-direction: column;
}

.message-textarea {
  resize: none;
  border: 1px solid #CED4DA;
  border-radius: 4px;
  padding: 8px;
  min-height: 80px;
  font-family: 微软雅黑, Arial, sans-serif;
  font-size: 14px;
  color: #343A40;
  background-color: #FFFFFF;
  transition: border-color 0.2s ease;
}

.message-textarea:focus {
  outline: none;
  border-color: #007BFF;
}

.input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.toolbar-btn {
  background: none;
  border: none;
  color: #6C757D;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.toolbar-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #007BFF;
}

.send-btn {
  background-color: #007BFF;
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  padding: 6px 16px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.send-btn:disabled {
  background-color: #CED4DA;
  cursor: not-allowed;
}

.send-btn:not(:disabled):hover {
  background-color: #0069D9;
}

.char-counter {
  font-size: 12px;
  color: #86909c;
  margin-right: 8px;
}

.char-counter.warning {
  color: #F59E0B;
}

.char-counter.danger {
  color: #EF4444;
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .input-panel {
    padding: 8px;
  }
  
  .message-textarea {
    min-height: 60px;
  }
}
</style>