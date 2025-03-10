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
const emit = defineEmits(['send', 'retry', 'revoke', 'read'])

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

// 监听消息列表变化，自动滚动到底部
watch(() => props.messages, () => {
  setTimeout(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  }, 100)
}, { deep: true })

// 组件挂载后初始化
onMounted(() => {
  // 初始化滚动到底部
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
  
  // 设置消息已读
  if (props.contact) {
    emit('read', props.contact.id)
  }
})

// 监听联系人变化
watch(() => props.contact, (newContact) => {
  if (newContact) {
    // 设置消息已读
    emit('read', newContact.id)
    
    // 重置历史消息加载状态
    hasMoreHistory.value = true
    loadingHistory.value = false
    
    // 滚动到底部
    setTimeout(() => {
      if (messageListRef.value) {
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight
      }
    }, 100)
  }
})
</script>

<template>
  <div class="chat-window">
    <!-- 消息列表区域 -->
    <div class="message-list" ref="messageListRef" @scroll="onScroll">
      <!-- 加载更多历史消息 -->
      <div v-if="hasMoreHistory" class="loading-history">
        <button 
          class="load-more-btn" 
          @click="loadMoreHistory" 
          :disabled="loadingHistory"
        >
          {{ loadingHistory ? '加载中...' : '加载更多' }}
        </button>
      </div>
      <div v-else class="no-more-history">
        <span>没有更多消息了</span>
      </div>
      
      <!-- 无消息提示 -->
      <div v-if="!props.messages || props.messages.length === 0" class="empty-state">
        <p>暂无消息，发送一条消息开始聊天吧</p>
      </div>
      
      <!-- 消息列表内容 -->
      <template v-else>
        <div v-for="group in groupedMessages" :key="group.date" class="message-group">
          <!-- 日期分隔线 -->
          <div v-if="showDateDivider" class="date-divider">
            <span class="date-text">{{ formatDate(group.date) }}</span>
          </div>
          
          <!-- 消息气泡 -->
          <div v-for="(message, index) in group.messages" :key="message.id" class="message-item">
            <MessageBubble 
              :message="message"
              :is-sender="isSender(message)"
              :show-avatar="index === 0 || isSender(message) !== isSender(group.messages[index - 1])"
              @retry="handleRetry"
              @revoke="handleRevoke"
            />
          </div>
        </div>
      </template>
    </div>
    
    <!-- 输入面板 -->
    <div class="input-container">
      <InputPanel 
        :placeholder="contact ? `发送给 ${contact.name}` : '请选择联系人'"
        :disabled="!contact"
        @send="handleSend"
      />
    </div>
  </div>
</template>

<style scoped>
:root {
  --message-bg-self: #2B7BF2; /* 企业微信发送者消息背景色 */
  --message-bg-other: #f3f4f6; /* 企业微信接收者消息背景色 */
  --message-text-self: #fff;
  --message-text-other: #222222;
}

.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-color);
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

.message-group {
  margin-bottom: 24px;
}

.date-divider {
  text-align: center;
  margin: 16px 0;
  position: relative;
}

.date-divider::before,
.date-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 50px);
  height: 1px;
  background-color: var(--border-color);
}

.date-divider::before {
  left: 0;
}

.date-divider::after {
  right: 0;
}

.date-text {
  display: inline-block;
  padding: 4px 12px;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  font-size: 12px;
  color: var(--text-light);
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  animation: message-fade-in 0.3s ease;
}

.message-item.self {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 12px;
  object-fit: cover;
  box-shadow: var(--shadow-sm);
  border: 2px solid var(--bg-color);
}

.message-content {
  max-width: 60%;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
  transition: var(--transition-base);
}

.message-item.self .message-bubble {
  background-color: var(--message-bg-self);
  color: var(--message-text-self);
  border-bottom-right-radius: 4px;
}

.message-item:not(.self) .message-bubble {
  background-color: var(--message-bg-other);
  color: var(--message-text-other);
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
  opacity: 0.8;
}

.message-status {
  font-size: 12px;
  margin-top: 4px;
}

.status-sending {
  color: var(--text-light);
}

.status-sent {
  color: var(--text-secondary);
}

.status-error {
  color: #ef4444;
}

.loading-history {
  text-align: center;
  padding: 16px;
  color: var(--text-light);
}

@keyframes message-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .message-list {
    padding: 12px;
  }

  .message-content {
    max-width: 75%;
  }

  .avatar {
    width: 32px;
    height: 32px;
    margin: 0 8px;
  }

  .message-bubble {
    padding: 8px 12px;
  }
}
</style>