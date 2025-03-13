<script setup>
import { ref, computed } from 'vue'

// 联系人数据
const contacts = ref([
  {
    id: '1',
    name: '张三',
    avatar: 'https://via.placeholder.com/48',
    status: 'online',
    lastMessage: '你好，最近怎么样？',
    lastMessageTime: Date.now() - 1000 * 60 * 5, // 5分钟前
    unreadCount: 2,
    category: 'friend'
  },
  {
    id: '2',
    name: '研发部',
    avatar: 'https://via.placeholder.com/48?text=RD',
    status: 'group',
    lastMessage: '李四: 明天开会讨论新功能',
    lastMessageTime: Date.now() - 1000 * 60 * 30, // 30分钟前
    unreadCount: 5,
    category: 'group',
    members: 8
  },
  {
    id: '3',
    name: '王五',
    avatar: 'https://via.placeholder.com/48',
    status: 'offline',
    lastMessage: '文件已发送',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
    unreadCount: 0,
    category: 'colleague'
  },
  {
    id: '4',
    name: '李四',
    avatar: 'https://via.placeholder.com/48',
    status: 'busy',
    lastMessage: '我正在开会，稍后回复',
    lastMessageTime: Date.now() - 1000 * 60 * 15, // 15分钟前
    unreadCount: 0,
    category: 'friend'
  },
  {
    id: '5',
    name: '市场部',
    avatar: 'https://via.placeholder.com/48?text=MK',
    status: 'group',
    lastMessage: '赵六: 新的营销方案已经上传',
    lastMessageTime: Date.now() - 1000 * 60 * 60, // 1小时前
    unreadCount: 3,
    category: 'group',
    members: 12
  }
])

// 格式化最后消息时间
const formatLastTime = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  
  // 一分钟内
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  // 一小时内
  if (diff < 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + '分钟前'
  }
  
  // 今天内
  if (diff < 24 * 60 * 60 * 1000) {
    const date = new Date(timestamp)
    return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0')
  }
  
  // 一周内
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[new Date(timestamp).getDay()]
  }
  
  // 更早
  const date = new Date(timestamp)
  return (date.getMonth() + 1) + '月' + date.getDate() + '日'
}
</script>

<template>
  <div class="contact-list">
    <div class="contacts-wrapper">
      <div v-for="contact in contacts" 
           :key="contact.id" 
           class="contact-item"
           @click="$emit('select', contact)">
        <div class="avatar-wrapper">
          <img :src="contact.avatar" :alt="contact.name" class="avatar" />
          <span class="status-indicator" 
                :class="contact.status"
                :title="contact.status">
          </span>
        </div>

        <div class="contact-info">
          <div class="contact-header">
            <h3 class="contact-name">{{ contact.name }}</h3>
            <span class="last-time">{{ formatLastTime(contact.lastMessageTime) }}</span>
          </div>
          <div class="contact-footer">
            <p class="last-message">{{ contact.lastMessage }}</p>
            <div v-if="contact.unreadCount > 0" class="badge">
              {{ contact.unreadCount }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  overflow: hidden;
}

.contacts-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
  scrollbar-width: thin;
  scrollbar-color: var(--text-quaternary) transparent;
}

.contacts-wrapper::-webkit-scrollbar {
  width: 4px;
}

.contacts-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.contacts-wrapper::-webkit-scrollbar-thumb {
  background-color: var(--text-quaternary);
  border-radius: 2px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 2px 0;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-base);
}

.contact-item:hover {
  background-color: var(--hover-color);
}

.avatar-wrapper {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-xs);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
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

.contact-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.contact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.contact-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  flex-shrink: 0;
  margin-left: 8px;
}

.contact-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.badge {
  background-color: var(--primary-color);
  color: white;
  font-size: 0.75rem;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  flex-shrink: 0;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .contacts-wrapper {
    padding: 8px 12px;
  }
  
  .contact-item {
    padding: 8px;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
  }
  
  .contact-name {
    font-size: 0.9rem;
  }
  
  .last-message {
    font-size: 0.8rem;
  }
}
</style>