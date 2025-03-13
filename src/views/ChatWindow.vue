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
  <div class="chat-window" v-if="contact">
    <!-- 消息列表 -->
    <div 
      ref="messageListRef" 
      class="message-list"
      @scroll="handleScroll"
    >
      <!-- 加载更多历史消息 -->
      <div v-if="hasMoreHistory" class="load-more-container">
        <button 
          class="load-more-btn"
          :class="{ 'loading': loadingHistory }"
          @click="loadMoreHistory"
        >
          <svg v-if="loadingHistory" class="loading-icon" viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"/>
          </svg>
          <span>{{ loadingHistory ? '加载中...' : '加载更多' }}</span>
        </button>
      </div>
      
      <!-- 消息分组 -->
      <div v-for="group in groupedMessages" :key="group.date" class="message-group">
        <!-- 日期分隔线 -->
        <div v-if="showDateDivider" class="date-divider">
          <div class="date-line"></div>
          <div class="date-text">{{ formatDate(group.date) }}</div>
          <div class="date-line"></div>
        </div>
        
        <!-- 消息气泡 -->
        <div v-for="message in group.messages" :key="message.id" class="message-container">
          <MessageBubble
            :message="message"
            :isSender="isSender(message)"
            :showAvatar="isFirstInSequence(message)"
            @retry="handleRetry"
            @revoke="handleRevoke"
          />
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!props.messages || props.messages.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        </div>
        <h3 class="empty-title">没有消息</h3>
        <p class="empty-desc">开始与{{ contact.name }}聊天吧</p>
      </div>
    </div>
    
    <!-- 输入面板 -->
    <div class="input-container">
      <InputPanel 
        :placeholder="`发送消息给 ${contact.name}...`"
        :maxLength="2000"
        @send="handleSend"
      />
    </div>
  </div>
  
  <!-- 未选择联系人 -->
  <div v-else class="no-contact">
    <div class="no-contact-content">
      <svg class="no-contact-icon" viewBox="0 0 24 24" width="64" height="64">
        <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 13h-2v-2h2v2zm0-4h-2V7h2v4z"/>
      </svg>
      <h2 class="no-contact-title">选择一个联系人开始聊天</h2>
      <p class="no-contact-desc">从左侧列表选择一个联系人或群组</p>
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  background-color: var(--bg-primary);
  transition: background-color 0.3s var(--easing-standard);
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scrollbar-width: thin;
  scrollbar-color: var(--text-quaternary) transparent;
  scroll-behavior: smooth;
}

.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background-color: var(--text-quaternary);
  border-radius: 3px;
}

/* 加载更多按钮 */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.load-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.3s var(--easing-standard);
  position: relative;
  overflow: hidden;
}

.load-more-btn:hover {
  background-color: var(--bg-quaternary);
  color: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-xs);
}

.load-more-btn:active {
  transform: translateY(0);
}

.load-more-btn.loading {
  cursor: default;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 日期分隔线 */
.date-divider {
  display: flex;
  align-items: center;
  margin: 12px 0;
  color: var(--text-tertiary);
  animation: fadeIn 0.5s var(--easing-decelerate);
}

.date-line {
  flex: 1;
  height: 1px;
  background-color: var(--border-color-light);
}

.date-text {
  padding: 0 12px;
  font-size: 12px;
  font-weight: 500;
  background-color: var(--bg-primary);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xs);
  padding: 4px 12px;
}

/* 消息容器 */
.message-container {
  margin-bottom: 2px;
  animation: slideUp 0.3s var(--easing-decelerate);
  transform-origin: center bottom;
}

/* 输入面板容器 */
.input-container {
  padding: 6px 12px 12px;
  border-top: 1px solid var(--border-color-light);
  background-color: var(--bg-glass-primary);
  backdrop-filter: blur(var(--blur-sm));
  -webkit-backdrop-filter: blur(var(--blur-sm));
  position: relative;
  z-index: 2;
  box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.02);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
  text-align: center;
  padding: 24px;
  margin-top: auto;
  margin-bottom: auto;
  animation: scaleIn 0.5s var(--easing-standard) forwards;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
  transform: scale(0);
  animation: popIn 0.5s var(--easing-standard) forwards 0.2s;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-secondary);
  opacity: 0;
  animation: fadeIn 0.5s var(--easing-decelerate) forwards 0.3s;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-tertiary);
  opacity: 0;
  animation: fadeIn 0.5s var(--easing-decelerate) forwards 0.4s;
}

/* 未选择联系人 */
.no-contact {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: var(--bg-secondary);
  color: var(--text-tertiary);
  animation: fadeIn 0.5s var(--easing-decelerate);
}

.no-contact-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 300px;
  padding: 24px;
  background-color: var(--bg-glass-primary);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color-light);
  animation: slideUp 0.5s var(--easing-decelerate);
}

.no-contact-icon {
  margin-bottom: 20px;
  opacity: 0.5;
  transform: scale(0);
  animation: popIn 0.5s var(--easing-standard) forwards 0.2s;
}

.no-contact-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-secondary);
  opacity: 0;
  animation: fadeIn 0.5s var(--easing-decelerate) forwards 0.3s;
}

.no-contact-desc {
  font-size: 14px;
  color: var(--text-tertiary);
  opacity: 0;
  animation: fadeIn 0.5s var(--easing-decelerate) forwards 0.4s;
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 0.5; }
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .message-list {
    padding: 8px;
  }
  
  .input-container {
    padding: 4px 8px 8px;
  }
  
  .empty-state {
    padding: 16px;
  }
  
  .no-contact-content {
    padding: 16px;
  }
}
</style>