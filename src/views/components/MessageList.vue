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
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  padding: 20px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  background-color: #f0f0f0;
  border-radius: 50%;
}

.message-group {
  margin-bottom: 16px;
}

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
  background-color: #e0e0e0;
}

.date-text {
  padding: 0 12px;
  font-size: 12px;
  color: #999;
  background-color: var(--bg-color);
}

.message-item {
  margin-bottom: 8px;
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .message-list {
    padding: 12px 8px;
  }
}
</style>