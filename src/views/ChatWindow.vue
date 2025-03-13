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
    <div class="message-list" ref="messageListRef">
      <div v-if="loadingHistory" class="loading-history">
        <div class="loading-spinner"></div>
      </div>
      
      <div v-for="group in groupedMessages" :key="group.date" class="message-group">
        <div v-if="showDateDivider" class="date-divider">
          <span>{{ formatDate(group.date) }}</span>
        </div>
        
        <div v-for="message in group.messages" 
             :key="message.id" 
             class="message-wrapper"
             :class="{ 'sender': isSender(message) }">
          <MessageBubble
            :message="message"
            :is-sender="isSender(message)"
            :is-first="isFirstInSequence(message)"
            :is-last="isLastInSequence(message)"
            @retry="handleRetry"
            @revoke="handleRevoke"
          />
        </div>
      </div>
    </div>
    
    <InputPanel @send="handleSend" />
  </div>
</template>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-primary);
  position: relative;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  scroll-behavior: smooth;
}

.loading-history {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.date-divider {
  text-align: center;
  margin: 12px 0;
  position: relative;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 1px 0;
  animation: message-appear 0.3s ease-out;
}

.message-wrapper.sender {
  align-items: flex-end;
}

@keyframes message-appear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-color-scheme: dark) {
  .message-bubble {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .message-bubble.sender {
    background-color: var(--primary-color);
  }
}
</style>