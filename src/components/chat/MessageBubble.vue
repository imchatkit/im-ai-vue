<script setup>
import { ref, computed } from 'vue'
import { MessageType, MessageStatus } from '../../modules/im-core'

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
      return 'loading'
    case MessageStatus.SENT:
      return 'check'
    case MessageStatus.DELIVERED:
      return 'double-check'
    case MessageStatus.READ:
      return 'check-all'
    case MessageStatus.FAILED:
      return 'error'
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
    <div v-if="showAvatar" class="avatar">
      <img :src="isSender ? 'path/to/user-avatar.png' : 'path/to/contact-avatar.png'" alt="Avatar" />
    </div>
    
    <!-- 消息内容 -->
    <div class="content">
      <!-- 已撤回消息 -->
      <div v-if="message.isRevoked" class="revoked-message">
        <i class="icon-revoked"></i>
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
        <i class="icon-file"></i>
        <div class="file-info">
          <div class="file-name">{{ message.content.name }}</div>
          <div class="file-size">{{ message.content.size }}</div>
        </div>
        <button class="download-btn">下载</button>
      </div>
      
      <!-- 语音消息 -->
      <div v-else-if="message.type === 'voice'" class="voice-content">
        <i class="icon-voice"></i>
        <div class="voice-duration">{{ message.content.duration }}"</div>
      </div>
      
      <!-- 消息时间和状态 -->
      <div class="message-meta">
        <span class="time">{{ formatTime(message.timestamp) }}</span>
        
        <!-- 发送者才显示消息状态 -->
        <span v-if="isSender" class="status">
          <i v-if="message.status === 'failed'" 
             class="icon-error" 
             @click="retryMessage"
             title="发送失败，点击重试"></i>
          <i v-else :class="`icon-${statusIcon}`"></i>
        </span>
      </div>
    </div>
    
    <!-- 消息操作菜单 -->
    <div class="message-actions">
      <button v-if="canRevoke" @click="revokeMessage" class="revoke-btn">
        撤回
      </button>
    </div>
  </div>
</template>

<style scoped>
.message-bubble {
  display: flex;
  margin-bottom: 16px;
  position: relative;
  max-width: 70%;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
}

.sender {
  margin-left: auto;
  flex-direction: row-reverse;
}

.receiver {
  margin-right: auto;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  padding: 8px 12px;
  border-radius: 14px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.content:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
}

.sender .content {
  background-color: #007AFF;
  color: #ffffff;
  border-top-right-radius: 4px;
}

.receiver .content {
  background-color: #F2F2F7;
  color: #000000;
  border-top-left-radius: 4px;
}

.text-content {
  word-break: break-word;
  line-height: 1.4;
  font-size: 14px;
  letter-spacing: -0.01em;
}

.image-content img {
  max-width: 100%;
  border-radius: 8px;
}

.file-content {
  display: flex;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.file-info {
  margin: 0 10px;
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #000000;
  margin-bottom: 2px;
}

.file-size {
  font-size: 12px;
  color: #8E8E93;
}

.download-btn {
  padding: 4px 12px;
  border-radius: 6px;
  border: none;
  background-color: #007AFF;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.download-btn:hover {
  background-color: #0066DB;
}

.voice-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  min-width: 80px;
}

.message-meta {
  display: flex;
  align-items: center;
  margin-top: 4px;
  font-size: 11px;
}

.sender .message-meta {
  color: rgba(255, 255, 255, 0.8);
}

.receiver .message-meta {
  color: #8E8E93;
}

.time {
  margin-right: 4px;
}

.status {
  display: flex;
  align-items: center;
}

.status i {
  font-size: 12px;
  margin-left: 2px;
}

.message-actions {
  position: absolute;
  top: -24px;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(8px);
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.2s ease;
}

.message-bubble:hover .message-actions {
  opacity: 1;
  transform: translateY(0);
}

.revoke-btn {
  border: none;
  background: none;
  color: #007AFF;
  font-size: 12px;
  padding: 2px 6px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.revoke-btn:hover {
  color: #0066DB;
}

.revoked-message {
  display: flex;
  align-items: center;
  color: #8E8E93;
  font-size: 13px;
}

.icon-revoked {
  margin-right: 4px;
  font-size: 14px;
}
</style>