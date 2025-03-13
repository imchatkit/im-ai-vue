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
// 是否显示更多功能面板
const showMorePanel = ref(false)
const morePanel = ref(null)

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
  
  // 重置输入框高度
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
    }
  })
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
  
  // 如果按下ESC键，关闭表情选择器和更多面板
  if (event.key === 'Escape') {
    showEmojiPicker.value = false
    showMorePanel.value = false
  }
}

// 切换表情选择器显示状态
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
  showMorePanel.value = false
  
  if (showEmojiPicker.value) {
    nextTick(() => {
      // 监听点击以关闭表情选择器
      document.addEventListener('click', closeEmojiPickerOnClickOutside)
    })
  }
}

// 切换更多面板显示状态
const toggleMorePanel = () => {
  showMorePanel.value = !showMorePanel.value
  showEmojiPicker.value = false
  
  if (showMorePanel.value) {
    nextTick(() => {
      // 监听点击以关闭更多面板
      document.addEventListener('click', closeMorePanelOnClickOutside)
    })
  }
}

// 点击外部关闭表情选择器
const closeEmojiPickerOnClickOutside = (event) => {
  if (emojiPicker.value && !emojiPicker.value.contains(event.target) && 
      !event.target.closest('.tool-button[title="表情"]')) {
    showEmojiPicker.value = false
    document.removeEventListener('click', closeEmojiPickerOnClickOutside)
  }
}

// 点击外部关闭更多面板
const closeMorePanelOnClickOutside = (event) => {
  if (morePanel.value && !morePanel.value.contains(event.target) && 
      !event.target.closest('.tool-button[title="更多"]')) {
    showMorePanel.value = false
    document.removeEventListener('click', closeMorePanelOnClickOutside)
  }
}

// 添加表情
const addEmoji = (emoji) => {
  messageText.value += emoji
  showEmojiPicker.value = false
  
  // 聚焦输入框
  messageInput.value.focus()
}

// 选择并发送图片
const selectImage = async () => {
  if (props.disabled) return
  
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
      
      const file = {
        path: filePaths[0],
        name: filePaths[0].split('/').pop()
      }
      
      emit('send', {
        type: MessageType.IMAGE,
        content: file
      })
    } else if (isWeb()) {
      // 使用Web API选择文件
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        
        emit('send', {
          type: MessageType.IMAGE,
          content: file
        })
      }
      
      input.click()
    }
  } catch (error) {
    console.error('选择图片失败:', error)
  }
}

// 选择并发送文件
const selectFile = async () => {
  if (props.disabled) return
  
  try {
    if (isElectron()) {
      // 使用Electron的文件选择对话框
      const { FileSystemAccess } = await import('../../modules/electron-bridge')
      const filePaths = await FileSystemAccess.openFileDialog({
        properties: ['openFile']
      })
      
      if (!filePaths || filePaths.length === 0) return
      
      const file = {
        path: filePaths[0],
        name: filePaths[0].split('/').pop()
      }
      
      emit('send', {
        type: MessageType.FILE,
        content: file
      })
    } else if (isWeb()) {
      // 使用Web API选择文件
      const input = document.createElement('input')
      input.type = 'file'
      
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        
        emit('send', {
          type: MessageType.FILE,
          content: file
        })
      }
      
      input.click()
    }
  } catch (error) {
    console.error('选择文件失败:', error)
  }
}

// 录制语音
const recordVoice = async () => {
  if (props.disabled) return
  
  try {
    if (isElectron()) {
      // 使用Electron的录音API
      const { MediaBridge } = await import('../../modules/electron-bridge')
      const voiceResult = await MediaBridge.recordVoice()
      
      if (!voiceResult) return
      
      emit('send', {
        type: MessageType.VOICE,
        content: voiceResult
      })
    } else if (isWeb()) {
      // 使用Web API录制语音
      // 这里简化实现，实际应用中需要请求麦克风权限并录制音频
      console.log('网页版暂不支持语音消息')
    }
  } catch (error) {
    console.error('录制语音失败:', error)
  }
}

// 挂载时
onMounted(() => {
  // 聚焦输入框
  if (messageInput.value) {
    messageInput.value.focus()
  }
})

// 卸载时
onUnmounted(() => {
  // 清除计时器
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  
  // 移除事件监听器
  document.removeEventListener('click', closeEmojiPickerOnClickOutside)
  document.removeEventListener('click', closeMorePanelOnClickOutside)
})
</script>

<template>
  <div class="input-panel">
    <!-- 工具栏 -->
    <div class="toolbar">
      <button class="tool-button" title="图片" @click="selectImage">
        <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      </button>
      <button class="tool-button" title="文件" @click="selectFile">
        <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
        </svg>
      </button>
      <button class="tool-button" title="语音" @click="recordVoice">
        <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
        </svg>
      </button>
      <button class="tool-button" title="表情" @click="toggleEmojiPicker">
        <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
      </button>
      <button class="tool-button" title="更多" @click="toggleMorePanel">
        <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-container">
      <textarea 
        ref="messageInput"
        class="input-area"
        :placeholder="placeholder"
        v-model="messageText"
        @input="handleInput"
        @keydown="handleKeyDown"
      ></textarea>
      
      <button 
        class="send-button" 
        :class="{ active: canSend }"
        @click="sendTextMessage"
        :disabled="!canSend"
      >
        <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
      
      <!-- 字符计数器 -->
      <div 
        v-if="maxLength" 
        class="character-counter"
        :class="{
          'warning': messageText.length > maxLength * 0.8,
          'error': messageText.length > maxLength * 0.95
        }"
      >
        {{ messageText.length }} / {{ maxLength }}
      </div>
    </div>
    
    <!-- 表情选择器 -->
    <div v-if="showEmojiPicker" class="emoji-picker" ref="emojiPicker">
      <div class="emoji-grid">
        <div 
          v-for="emoji in emojiList" 
          :key="emoji"
          class="emoji-item"
          @click="addEmoji(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </div>
    
    <!-- 更多功能面板 -->
    <div v-if="showMorePanel" class="more-panel" ref="morePanel">
      <div class="more-grid">
        <div class="more-item" @click="selectFile">
          <div class="more-item-icon">
            <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <div class="more-item-text">文件</div>
        </div>
        <div class="more-item" @click="selectImage">
          <div class="more-item-icon">
            <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
          <div class="more-item-text">图片</div>
        </div>
        <div class="more-item" @click="recordVoice">
          <div class="more-item-icon">
            <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          </div>
          <div class="more-item-text">语音</div>
        </div>
        <div class="more-item">
          <div class="more-item-icon">
            <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div class="more-item-text">位置</div>
        </div>
        <div class="more-item">
          <div class="more-item-icon">
            <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
          </div>
          <div class="more-item-text">投票</div>
        </div>
        <div class="more-item">
          <div class="more-item-icon">
            <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </div>
          <div class="more-item-text">提醒</div>
        </div>
        <div class="more-item">
          <div class="more-item-icon">
            <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
          </div>
          <div class="more-item-text">分享</div>
        </div>
        <div class="more-item">
          <div class="more-item-icon">
            <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
          </div>
          <div class="more-item-text">转账</div>
        </div>
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
  gap: 4px;
  margin-bottom: 4px;
  padding: 0 4px;
}

.tool-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background-color: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s var(--easing-standard);
  padding: 0;
  position: relative;
  overflow: hidden;
}

.tool-button:hover {
  background-color: var(--hover-color);
  color: var(--text-primary);
  transform: translateZ(0);
}

.tool-button:active {
  transform: scale(0.95);
}

.tool-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background-color: var(--hover-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: width 0.4s ease, height 0.4s ease, opacity 0.4s ease;
}

.tool-button:hover::before {
  width: 120%;
  height: 120%;
  opacity: 0.15;
}

.tool-button .icon {
  width: 20px;
  height: 20px;
  position: relative;
  z-index: 1;
  transition: transform 0.2s var(--easing-standard);
}

.tool-button:hover .icon {
  transform: scale(1.1);
}

.input-container {
  position: relative;
  display: flex;
}

.input-area {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 12px;
  padding-right: 40px;
  border-radius: var(--radius-lg);
  background-color: var(--bg-tertiary);
  border: 1px solid transparent;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  transition: all 0.2s var(--easing-standard);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) inset;
}

.input-area:focus {
  background-color: var(--bg-quaternary);
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 1px rgba(0, 113, 227, 0.2), 0 1px 3px rgba(0, 0, 0, 0.05) inset;
}

.input-area::placeholder {
  color: var(--text-tertiary);
}

.send-button {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background-color: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s var(--easing-standard);
  transform-origin: center;
  opacity: 0;
  transform: scale(0.8);
  pointer-events: none;
}

.send-button.active {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.send-button:hover {
  background-color: var(--primary-dark);
  transform: scale(1.05);
}

.send-button:active {
  transform: scale(0.95);
}

.send-button .icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s var(--easing-standard);
}

.send-button:hover .icon {
  transform: translateX(1px);
}

.character-counter {
  position: absolute;
  right: 10px;
  bottom: -20px;
  font-size: 12px;
  color: var(--text-tertiary);
  transition: color 0.2s var(--easing-standard);
}

.character-counter.warning {
  color: var(--warning-color);
}

.character-counter.error {
  color: var(--error-color);
}

.emoji-picker {
  position: absolute;
  bottom: 38px;
  right: 0;
  z-index: 10;
  background-color: var(--bg-glass-primary);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 8px;
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.2s var(--easing-standard);
  transform-origin: bottom right;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s var(--easing-standard);
}

.emoji-item:hover {
  background-color: var(--hover-color);
  transform: scale(1.1);
}

.emoji-item:active {
  transform: scale(0.95);
}

/* 更多面板 */
.more-panel {
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  background-color: var(--bg-glass-primary);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  padding: 12px;
  animation: slideUp 0.3s var(--easing-decelerate);
}

.more-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.more-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s var(--easing-standard);
}

.more-item:hover {
  background-color: var(--hover-color);
  transform: translateY(-2px);
}

.more-item:active {
  transform: translateY(0) scale(0.98);
}

.more-item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  margin-bottom: 8px;
  color: white;
  background: linear-gradient(120deg, var(--primary-color), var(--primary-dark));
  transition: transform 0.2s var(--easing-standard);
}

.more-item:hover .more-item-icon {
  transform: scale(1.05);
}

.more-item-text {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

@media screen and (max-width: 768px) {
  .input-area {
    min-height: 36px;
    padding: 8px 10px;
    padding-right: 36px;
    font-size: 13px;
  }
  
  .tool-button {
    width: 28px;
    height: 28px;
  }
  
  .tool-button .icon {
    width: 18px;
    height: 18px;
  }
  
  .send-button {
    width: 24px;
    height: 24px;
    right: 6px;
    bottom: 6px;
  }
  
  .send-button .icon {
    width: 14px;
    height: 14px;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .emoji-item {
    width: 28px;
    height: 28px;
    font-size: 18px;
  }
  
  .more-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
