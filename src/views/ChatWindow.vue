<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MessageBubble from '../components/chat/MessageBubble.vue'
import InputPanel from '../components/chat/InputPanel.vue'
import { MessageType, MessageStatus } from '../modules/im-core'

// 定义组件属性
const props = defineProps({
  contact: {
    type: Object,
    default: () => null
  },
  messages: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['send', 'retry', 'revoke', 'read', 'update:messages'])

// 消息列表容器引用
const messageListRef = ref(null)

// 是否显示日期分隔线
const showDateDivider = ref(true)

// 是否正在加载历史消息
const loadingHistory = ref(false)

// 是否有更多历史消息
const hasMoreHistory = ref(true)

// 当前用户ID (实际应用中应从用户状态获取)
const currentUserId = 'current-user-id'

// 计算消息是否由当前用户发送
const isSender = (message) => {
  return message.senderId === currentUserId
}

// 判断消息是否是序列中的第一条
const isFirstInSequence = (message) => {
  const index = props.messages.findIndex(m => m.id === message.id)
  if (index === 0) return true
  const prevMessage = props.messages[index - 1]
  return prevMessage.senderId !== message.senderId
}

// 判断消息是否是序列中的最后一条
const isLastInSequence = (message) => {
  const index = props.messages.findIndex(m => m.id === message.id)
  if (index === props.messages.length - 1) return true
  const nextMessage = props.messages[index + 1]
  return nextMessage.senderId !== message.senderId
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 按日期分组消息
const groupedMessages = computed(() => {
  if (!props.messages || props.messages.length === 0) {
    return []
  }
  
  const groups = []
  let currentDate = null
  let currentGroup = null
  
  props.messages.forEach(message => {
    const messageDate = new Date(message.timestamp).toLocaleDateString()
    
    if (messageDate !== currentDate) {
      currentDate = messageDate
      currentGroup = {
        date: messageDate,
        messages: []
      }
      groups.push(currentGroup)
    }
    
    currentGroup.messages.push(message)
  })
  
  return groups
})

// 格式化日期
const formatDate = (dateString) => {
  const today = new Date().toLocaleDateString()
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString()
  
  if (dateString === today) {
    return '今天'
  } else if (dateString === yesterday) {
    return '昨天'
  }
  
  return dateString
}

// 加载更多历史消息
const loadMoreHistory = async () => {
  if (loadingHistory.value || !hasMoreHistory.value) return
  
  loadingHistory.value = true
  
  try {
    // 这里应该调用API加载更多历史消息
    // const oldestMessageId = props.messages[0]?.id
    // const olderMessages = await messageService.loadHistory(props.contact.id, oldestMessageId)
    
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟没有更多消息
    hasMoreHistory.value = false
  } catch (error) {
    console.error('加载历史消息失败', error)
  } finally {
    loadingHistory.value = false
  }
}

// 处理消息重试
const handleRetry = (messageId) => {
  emit('retry', messageId)
}

// 处理消息撤回
const handleRevoke = (messageId) => {
  emit('revoke', messageId)
}

// 处理发送消息
const handleSend = (content, type = MessageType.TEXT) => {
  if (!props.contact) return
  
  emit('send', {
    content,
    type,
    timestamp: Date.now()
  })
}

// 加载示例历史消息
const loadExampleMessages = () => {
  if (!props.contact) return
  
  // 清空现有消息
  emit('update:messages', [])
  
  // 根据联系人ID加载不同的示例消息
  const exampleMessages = [
    {
      id: '1',
      senderId: props.contact.id,
      receiverId: currentUserId,
      content: `你好，我是${props.contact.name}`,
      type: MessageType.TEXT,
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1天前
      status: MessageStatus.READ
    },
    {
      id: '2',
      senderId: currentUserId,
      receiverId: props.contact.id,
      content: `你好，${props.contact.name}，最近工作怎么样？`,
      type: MessageType.TEXT,
      timestamp: Date.now() - 1000 * 60 * 60 * 23, // 23小时前
      status: MessageStatus.READ
    },
    {
      id: '3',
      senderId: props.contact.id,
      receiverId: currentUserId,
      content: '工作还不错，正在处理一些项目文档',
      type: MessageType.TEXT,
      timestamp: Date.now() - 1000 * 60 * 60 * 22, // 22小时前
      status: MessageStatus.READ
    },
    {
      id: '4',
      senderId: currentUserId,
      receiverId: props.contact.id,
      content: '好的，有需要帮忙的地方随时告诉我',
      type: MessageType.TEXT,
      timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
      status: MessageStatus.READ
    },
    {
      id: '5',
      senderId: props.contact.id,
      receiverId: currentUserId,
      content: '谢谢，明天我们讨论一下项目进度吧',
      type: MessageType.TEXT,
      timestamp: Date.now() - 1000 * 60 * 30, // 30分钟前
      status: MessageStatus.READ
    }
  ]
  
  // 更新消息列表
  emit('update:messages', exampleMessages)
}

// 监听消息列表变化，自动滚动到底部
watch(() => props.messages, () => {
  setTimeout(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  }, 100)
}, { deep: true })

// 监听联系人变化
watch(() => props.contact, (newContact) => {
  if (newContact) {
    // 设置消息已读
    emit('read', newContact.id)
    
    // 重置历史消息加载状态
    hasMoreHistory.value = true
    loadingHistory.value = false
    
    // 加载示例历史消息
    loadExampleMessages()
    
    // 滚动到底部
    setTimeout(() => {
      if (messageListRef.value) {
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight
      }
    }, 100)
  }
})

// 组件挂载后初始化
onMounted(() => {
  // 初始化滚动到底部
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
  
  // 设置消息已读
  if (props.contact) {
    emit('read', props.contact.id)
    
    // 加载示例历史消息
    loadExampleMessages()
  }
})
</script>

<template>
  <div class="chat-window">
    <!-- 聊天头部 -->
    <div class="chat-header glass-container" v-if="contact">
      <div class="contact-info">
        <div class="avatar-wrapper">
          <img :src="contact.avatar" :alt="contact.name" class="avatar" />
          <span class="status-indicator" :class="contact.status"></span>
        </div>
        <div class="contact-details">
          <h2 class="contact-name">{{ contact.name }}</h2>
          <p class="contact-status">
            <span v-if="contact.status === 'online'">在线</span>
            <span v-else-if="contact.status === 'offline'">离线</span>
            <span v-else-if="contact.status === 'busy'">忙碌</span>
            <span v-else-if="contact.status === 'group'">{{ contact.members }}人</span>
          </p>
        </div>
      </div>
      
      <div class="header-actions">
        <button class="icon-button">
          <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M20 5.41L18.59 4 12 10.59 5.41 4 4 5.41 10.59 12 4 18.59 5.41 20 12 13.41 18.59 20 20 18.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="!contact" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24">
          <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </div>
      <h3 class="empty-title">选择一个联系人开始聊天</h3>
      <p class="empty-desc">您的消息将在这里显示</p>
    </div>
    
    <!-- 消息列表 -->
    <div v-else class="message-list-container">
      <!-- 加载更多按钮 -->
      <div v-if="hasMoreHistory" class="load-more-container">
        <button 
          class="load-more-btn"
          @click="loadMoreHistory"
          :disabled="loadingHistory"
        >
          <span v-if="loadingHistory">加载中...</span>
          <span v-else>加载更多</span>
        </button>
      </div>
      
      <!-- 消息列表 -->
      <div class="message-list" ref="messageListRef">
        <div v-for="group in groupedMessages" :key="group.date" class="message-group">
          <!-- 日期分隔线 -->
          <div v-if="showDateDivider" class="date-divider">
            <span class="date-text">{{ formatDate(group.date) }}</span>
          </div>
          
          <!-- 消息气泡 -->
          <div 
            v-for="message in group.messages" 
            :key="message.id"
            class="message-container"
          >
            <MessageBubble
              :message="message"
              :isSender="isSender(message)"
              :showAvatar="isFirstInSequence(message)"
              @retry="handleRetry"
              @revoke="handleRevoke"
            />
          </div>
        </div>
      </div>
      
      <!-- 输入面板 -->
      <div class="input-container glass-container">
        <InputPanel
          :placeholder="'发送给 ' + contact.name"
          @send="handleSend"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background-color: var(--bg-secondary);
}

/* 聊天头部 */
.chat-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
  z-index: 10;
}

.contact-info {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  margin-right: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color-light);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
}

.status-indicator.online {
  background-color: var(--success-color);
}

.status-indicator.offline {
  background-color: var(--text-quaternary);
}

.status-indicator.busy {
  background-color: var(--error-color);
}

.status-indicator.group {
  background-color: var(--primary-color);
}

.contact-details {
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.contact-status {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: var(--text-tertiary);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.empty-desc {
  font-size: 14px;
  color: var(--text-tertiary);
}

/* 消息列表容器 */
.message-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* 加载更多按钮 */
.load-more-container {
  padding: 8px 0;
  display: flex;
  justify-content: center;
}

.load-more-btn {
  font-size: 12px;
  padding: 4px 12px;
  background-color: transparent;
  color: var(--text-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: var(--transition-base);
}

.load-more-btn:hover:not(:disabled) {
  background-color: var(--hover-color);
  color: var(--text-primary);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

/* 日期分隔线 */
.date-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  position: relative;
}

.date-divider::before,
.date-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--border-color);
}

.date-text {
  padding: 0 12px;
  font-size: 12px;
  color: var(--text-tertiary);
  background-color: var(--bg-secondary);
  position: relative;
}

/* 消息容器 */
.message-container {
  margin-bottom: 4px;
}

/* 输入容器 */
.input-container {
  padding: 12px;
  border-top: 1px solid var(--border-color);
  background-color: rgba(255, 255, 255, var(--blur-opacity));
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  z-index: 10;
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .chat-header {
    height: 50px;
  }
  
  .message-list {
    padding: 12px;
  }
  
  .input-container {
    padding: 8px;
  }
}
</style>