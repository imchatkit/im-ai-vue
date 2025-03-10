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
    console.error('加载历史消息失败:', error)
  } finally {
    loadingHistory.value = false
  }
}

// 处理消息列表滚动
const handleScroll = (event) => {
  const { scrollTop } = event.target
  
  // 当滚动到顶部时，加载更多历史消息
  if (scrollTop < 50 && hasMoreHistory.value) {
    loadMoreHistory()
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (!messageListRef.value) return
  
  const container = messageListRef.value
  container.scrollTop = container.scrollHeight
}

// 处理发送消息
const handleSend = (message) => {
  emit('send', {
    ...message,
    receiverId: props.contact?.id
  })
  
  // 发送后滚动到底部
  setTimeout(scrollToBottom, 100)
}

// 重试发送失败的消息
const handleRetry = (message) => {
  emit('retry', message)
}

// 撤回消息
const handleRevoke = (message) => {
  emit('revoke', message)
}

// 监听消息变化，滚动到底部
watch(() => props.messages.length, () => {
  setTimeout(scrollToBottom, 100)
})

// 监听当前联系人变化，标记消息已读
watch(() => props.contact, (newContact) => {
  if (newContact) {
    emit('read', newContact.id)
    setTimeout(scrollToBottom, 100)
  }
})

// 组件挂载后滚动到底部
onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="chat-window">
    <!-- 消息列表 -->
    <div 
      ref="messageListRef"
      class="message-list"
      @scroll="handleScroll"
    >
      <!-- 加载更多提示 -->
      <div v-if="loadingHistory" class="loading-history">
        <div class="loading-spinner"></div>
        <span>加载更多消息...</span>
      </div>
      
      <!-- 没有更多消息提示 -->
      <div v-else-if="!hasMoreHistory && messages.length > 0" class="no-more-history">
        没有更多消息了
      </div>
      
      <!-- 空消息提示 -->
      <div v-if="messages.length === 0" class="empty-messages">
        <div class="empty-icon"></div>
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
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: var(--bg-color);
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
}

.loading-history,
.no-more-history {
  text-align: center;
  padding: 8px 0;
  font-size: 12px;
  color: #999;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.input-container {
  border-top: 1px solid var(--border-color);
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .message-list {
    padding: 12px 8px;
  }
}
</style>