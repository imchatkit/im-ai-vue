<script setup>
import { ref, computed } from 'vue'
import { MessageType, MessageStatus } from '../../modules/im-core'

// 生成默认头像的函数
const getDefaultAvatar = (senderId, isSender) => {
  // 当前用户头像
  if (isSender) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=user-${senderId}`
  }
  
  // 其他用户头像，使用initials样式
  return `https://api.dicebear.com/7.x/initials/svg?seed=${senderId}&backgroundColor=0071e3,34c759,ff9f0a,ff3b30,5ac8fa`
}

// 定义组件属性
const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  isSender: {
    type: Boolean,
    default: false
  },
  showAvatar: {
    type: Boolean,
    default: true
  }
})

// 定义事件
const emit = defineEmits(['retry', 'revoke'])

// 计算消息类型
const messageTypeClass = computed(() => {
  return `message-${props.message.type}`
})

// 计算消息状态图标
const statusIcon = computed(() => {
  switch(props.message.status) {
    case MessageStatus.SENDING:
      return 'sending'
    case MessageStatus.SENT:
      return 'sent'
    case MessageStatus.DELIVERED:
      return 'delivered'
    case MessageStatus.READ:
      return 'read'
    case MessageStatus.FAILED:
      return 'failed'
    default:
      return ''
  }
})

// 计算是否可以撤回消息（2分钟内）
const canRevoke = computed(() => {
  if (!props.isSender) return false
  
  const now = Date.now()
  const messageTime = props.message.timestamp
  const twoMinutes = 2 * 60 * 1000
  
  return now - messageTime <= twoMinutes
})

// 重试发送消息
const retryMessage = () => {
  emit('retry', props.message)
}

// 撤回消息
const revokeMessage = () => {
  emit('revoke', props.message)
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div 
    class="message-bubble" 
    :class="{
      'sender': isSender,
      'receiver': !isSender,
      'revoked': message.isRevoked,
      [messageTypeClass]: true
    }"
  >
    <!-- 头像 -->
    <div v-if="showAvatar" class="avatar-container">
      <div class="avatar">
        <img :src="getDefaultAvatar(message.senderId, isSender)" alt="Avatar" />
      </div>
    </div>
    <div v-else class="avatar-placeholder"></div>
    
    <!-- 消息内容 -->
    <div class="content">
      <!-- 已撤回消息 -->
      <div v-if="message.isRevoked" class="revoked-message">
        <svg class="icon-revoked" viewBox="0 0 24 24" width="14" height="14">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>
        </svg>
        <span>{{ isSender ? '你' : '对方' }}撤回了一条消息</span>
      </div>
      
      <!-- 文本消息 -->
      <div v-else-if="message.type === 'text'" class="text-content">
        {{ message.content }}
      </div>
      
      <!-- 图片消息 -->
      <div v-else-if="message.type === 'image'" class="image-content">
        <img :src="message.content" alt="Image" />
      </div>
      
      <!-- 文件消息 -->
      <div v-else-if="message.type === 'file'" class="file-content">
        <svg class="icon-file" viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
        <div class="file-info">
          <div class="file-name">{{ message.content.name }}</div>
          <div class="file-size">{{ message.content.size }}</div>
        </div>
        <button class="download-btn">
          <svg class="icon-download" viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </button>
      </div>
      
      <!-- 语音消息 -->
      <div v-else-if="message.type === 'voice'" class="voice-content">
        <svg class="icon-voice" viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
        </svg>
        <div class="voice-waveform">
          <div class="waveform-bar" v-for="i in 6" :key="i" :style="{ height: `${Math.random() * 12 + 4}px` }"></div>
        </div>
        <div class="voice-duration">{{ message.content.duration }}"</div>
      </div>
      
      <!-- 消息时间和状态 -->
      <div class="message-meta">
        <span class="time">{{ formatTime(message.timestamp) }}</span>
        
        <!-- 发送者才显示消息状态 -->
        <span v-if="isSender" class="status">
          <svg v-if="message.status === 'failed'" 
               class="icon-status icon-failed" 
               viewBox="0 0 24 24" 
               width="14" 
               height="14"
               @click="retryMessage"
               title="发送失败，点击重试">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <svg v-else-if="message.status === 'sending'" 
               class="icon-status icon-sending" 
               viewBox="0 0 24 24" 
               width="14" 
               height="14">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2zm0-10h2v8h-2z"/>
          </svg>
          <svg v-else-if="message.status === 'sent'" 
               class="icon-status icon-sent" 
               viewBox="0 0 24 24" 
               width="14" 
               height="14">
            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <svg v-else-if="message.status === 'delivered'" 
               class="icon-status icon-delivered" 
               viewBox="0 0 24 24" 
               width="14" 
               height="14">
            <path fill="currentColor" d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
          </svg>
          <svg v-else-if="message.status === 'read'" 
               class="icon-status icon-read" 
               viewBox="0 0 24 24" 
               width="14" 
               height="14">
            <path fill="currentColor" d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
          </svg>
        </span>
      </div>
    </div>
    
    <!-- 消息操作菜单 -->
    <div v-if="canRevoke" class="message-actions">
      <button @click="revokeMessage" class="action-btn">
        <svg class="icon-revoke" viewBox="0 0 24 24" width="14" height="14">
          <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
        </svg>
        <span>撤回</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.message-bubble {
  display: flex;
  margin-bottom: 8px;
  max-width: 75%;
  position: relative;
}

.receiver {
  align-self: flex-start;
}

.sender {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar-container {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 8px;
  flex-shrink: 0;
  background-color: var(--ios-bg-tertiary);
}

.avatar-placeholder {
  width: 36px;
  height: 36px;
  margin: 0 8px;
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.content {
  display: flex;
  flex-direction: column;
  position: relative;
}

.text-content {
  padding: 8px 12px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.receiver .text-content {
  background-color: var(--ios-bg-tertiary);
  color: var(--ios-text-primary);
  border-bottom-left-radius: 4px;
}

.sender .text-content {
  background-color: var(--ios-accent-color);
  color: white;
  border-bottom-right-radius: 4px;
}

.image-content {
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.image-content img {
  max-width: 240px;
  max-height: 320px;
  display: block;
  object-fit: contain;
  border-radius: 12px;
  background-color: var(--ios-bg-tertiary);
}

.file-content {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background-color: var(--ios-bg-tertiary);
  color: var(--ios-text-primary);
}

.sender .file-content {
  background-color: var(--ios-accent-color-light);
  color: var(--ios-accent-color);
}

.file-icon {
  margin-right: 8px;
  font-size: 24px;
}

.file-info {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 500;
  margin-bottom: 2px;
  font-size: 14px;
}

.file-size {
  font-size: 12px;
  color: var(--ios-text-tertiary);
}

.sender .file-size {
  color: var(--ios-accent-color);
  opacity: 0.8;
}

.audio-content {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 18px;
  background-color: var(--ios-bg-tertiary);
  color: var(--ios-text-primary);
  min-width: 160px;
}

.sender .audio-content {
  background-color: var(--ios-accent-color);
  color: white;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.audio-play {
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--ios-bg-primary);
  color: var(--ios-accent-color);
}

.sender .audio-play {
  background-color: white;
  color: var(--ios-accent-color);
}

.audio-duration {
  font-size: 12px;
  color: var(--ios-text-tertiary);
}

.sender .audio-duration {
  color: white;
  opacity: 0.9;
}

.audio-waveform {
  flex: 1;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  overflow: hidden;
  margin: 0 8px;
}

.sender .audio-waveform {
  background-color: rgba(255, 255, 255, 0.2);
}

.system-content {
  align-self: center;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--ios-bg-tertiary);
  border-radius: 16px;
  color: var(--ios-text-tertiary);
  font-size: 13px;
  font-style: italic;
}

.icon-revoked {
  margin-right: 6px;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 4px;
  padding: 0 4px;
  gap: 4px;
}

.time {
  font-size: 11px;
  color: var(--ios-text-tertiary);
}

.status {
  display: flex;
  align-items: center;
}

.icon-status {
  opacity: 0.7;
}

.icon-failed {
  color: #FF3B30;
  cursor: pointer;
}

.icon-sending {
  color: var(--ios-text-tertiary);
}

.icon-sent, .icon-delivered, .icon-read {
  color: var(--ios-text-tertiary);
}

.sender .icon-sent, .sender .icon-delivered, .sender .icon-read {
  color: white;
  opacity: 0.9;
}

.message-actions {
  position: absolute;
  top: -24px;
  right: 0;
  display: none;
}

.sender:hover .message-actions {
  display: flex;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background-color: var(--ios-bg-primary);
  border: 0.5px solid var(--ios-border-color);
  border-radius: 16px;
  font-size: 12px;
  color: var(--ios-text-secondary);
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.action-btn:hover {
  background-color: var(--ios-bg-tertiary);
  color: var(--ios-text-primary);
}

.icon-revoke {
  margin-right: 4px;
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }
  
  .avatar-container, .avatar-placeholder {
    width: 32px;
    height: 32px;
    margin: 0 6px;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
  }
  
  .text-content {
    font-size: 13px;
    padding: 6px 10px;
  }
  
  .image-content img {
    max-width: 200px;
    max-height: 280px;
  }
}
</style>