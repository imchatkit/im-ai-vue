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
}

.sender {
  margin-left: auto;
  flex-direction: row-reverse;
}

.receiver {
  margin-right: auto;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 8px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  padding: 10px 12px;
  border-radius: 12px;
  position: relative;
}

.sender .content {
  background-color: var(--primary-color);
  color: white;
  border-top-right-radius: 2px;
}

.receiver .content {
  background-color: #f1f1f1;
  color: var(--text-primary);
  border-top-left-radius: 2px;
}

.text-content {
  word-break: break-word;
  white-space: pre-wrap;
}

.image-content img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
}

.file-content {
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 8px;
}

.file-info {
  margin-left: 8px;
  flex: 1;
}

.file-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.file-size {
  font-size: 12px;
  color: #666;
}

.voice-content {
  display: flex;
  align-items: center;
  min-width: 80px;
}

.voice-duration {
  margin-left: 8px;
}

.message-meta {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.time {
  margin-right: 4px;
}

.revoked-message {
  font-style: italic;
  color: #999;
  display: flex;
  align-items: center;
}

.message-actions {
  position: absolute;
  top: -20px;
  display: none;
}

.sender .message-actions {
  right: 0;
}

.receiver .message-actions {
  left: 0;
}

.message-bubble:hover .message-actions {
  display: flex;
}

.revoke-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.1);
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
  }
}
</style>