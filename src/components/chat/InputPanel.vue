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
    <!-- 工具栏 -->
    <div class="toolbar">
      <button 
        class="tool-btn emoji-btn" 
        @click="showEmojiPicker = !showEmojiPicker"
        title="表情"
      >
        <i class="icon-emoji"></i>
      </button>
      
      <button 
        class="tool-btn image-btn" 
        @click="selectImage"
        title="图片"
      >
        <i class="icon-image"></i>
      </button>
      
      <button 
        class="tool-btn file-btn" 
        @click="selectFile"
        title="文件"
      >
        <i class="icon-file"></i>
      </button>
      
      <button 
        class="tool-btn voice-btn" 
        @click="recordVoice"
        title="语音"
      >
        <i class="icon-microphone"></i>
      </button>
      
      <button 
        class="tool-btn more-btn" 
        @click="showMorePanel = !showMorePanel"
        title="更多"
      >
        <i class="icon-more"></i>
      </button>
    </div>
    
    <!-- 表情选择器 -->
    <div v-if="showEmojiPicker" class="emoji-picker">
      <!-- 表情列表 -->
      <div class="emoji-list">
        <span 
          v-for="emoji in ['😀', '😂', '😊', '😍', '🤔', '😎', '👍', '❤️', '🎉']"
          :key="emoji"
          class="emoji-item"
          @click="addEmoji(emoji)"
        >
          {{ emoji }}
        </span>
      </div>
    </div>
    
    <!-- 更多功能面板 -->
    <div v-if="showMorePanel" class="more-panel">
      <!-- 更多功能列表 -->
      <div class="more-list">
        <div class="more-item">
          <i class="icon-screen-share"></i>
          <span>屏幕共享</span>
        </div>
        <div class="more-item">
          <i class="icon-whiteboard"></i>
          <span>白板</span>
        </div>
        <div class="more-item">
          <i class="icon-translate"></i>
          <span>翻译</span>
        </div>
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-area">
      <textarea
        v-model="messageText"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :disabled="disabled"
        class="message-input"
        @input="handleInput"
        @keydown="handleKeydown"
      ></textarea>
      
      <!-- 字符计数 -->
      <div v-if="messageText.length > 0" class="char-counter">
        {{ remainingChars }}
      </div>
    </div>
    
    <!-- 发送按钮 -->
    <div class="send-area">
      <button 
        class="send-btn" 
        :class="{ 'active': canSend }"
        :disabled="!canSend"
        @click="sendTextMessage"
      >
        发送
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-panel {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #e0e0e0;
  background-color: #fff;
  position: relative;
}

.toolbar {
  display: flex;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.tool-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  margin-right: 12px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.tool-btn:hover {
  background-color: #f0f0f0;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px;
  z-index: 10;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.emoji-item {
  font-size: 24px;
  cursor: pointer;
  text-align: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.emoji-item:hover {
  background-color: #f0f0f0;
}

.more-panel {
  position: absolute;
  bottom: 100%;
  right: 0;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px;
  z-index: 10;
}

.more-list {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.more-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.more-item:hover {
  background-color: #f0f0f0;
}

.more-item i {
  margin-right: 8px;
  font-size: 18px;
  color: #666;
}

.input-area {
  position: relative;
  flex: 1;
  padding: 8px 12px;
}

.message-input {
  width: 100%;
  height: 80px;
  resize: none;
  border: none;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  font-family: inherit;
}

.char-counter {
  position: absolute;
  right: 16px;
  bottom: 8px;
  font-size: 12px;
  color: #999;
}
</style>