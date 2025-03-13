<script setup>
import { ref, computed } from 'vue'
import MessageBubble from '../../components/chat/MessageBubble.vue'

// 定义组件属性
const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['retry', 'revoke'])

// 消息列表容器引用
const messageListRef = ref(null)

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

// 处理重试发送失败的消息
const handleRetry = (message) => {
  emit('retry', message)
}

// 处理撤回消息
const handleRevoke = (message) => {
  emit('revoke', message)
}

// 滚动到底部
const scrollToBottom = () => {
  if (!messageListRef.value) return
  
  const container = messageListRef.value
  container.scrollTop = container.scrollHeight
}
</script>

<template>
  <div ref="messageListRef" class="message-list">
    <!-- 空消息提示 -->
    <div v-if="messages.length === 0" class="empty-messages">
      <div class="empty-icon"></div>
      <p>暂无消息，发送一条消息开始聊天吧</p>
    </div>
    
    <!-- 消息列表内容 -->
    <template v-else>
      <div v-for="group in groupedMessages" :key="group.date" class="message-group">
        <!-- 日期分隔线 -->
        <div class="date-divider">
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
</template>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--bg-color);
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8E8E93;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  background-color: #F2F2F7;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.empty-messages:hover .empty-icon {
  transform: scale(1.05);
}

.message-group {
  margin-bottom: 24px;
  animation: fadeIn 0.3s ease;
}

.date-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px 0;
  position: relative;
}

.date-divider::before,
.date-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to var(--direction, right), transparent, #E5E5EA);
}

.date-divider::after {
  --direction: left;
}

.date-text {
  padding: 0 12px;
  font-size: 12px;
  color: #8E8E93;
  background-color: var(--bg-color);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.message-item {
  margin-bottom: 8px;
  opacity: 0;
  animation: slideIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
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
    padding: 12px 8px;
  }
  
  .date-divider {
    margin: 16px 0;
  }
}

/* 滚动条样式 */
.message-list::-webkit-scrollbar {
  width: 8px;
}

.message-list::-webkit-scrollbar-track {
  background-color: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>