<script setup>
import { ref, computed } from 'vue'

// 生成默认头像的函数
const getDefaultAvatar = (name, id) => {
  if (!name) return `https://api.dicebear.com/7.x/initials/svg?seed=${id}&backgroundColor=0071e3,34c759,ff9f0a,ff3b30,5ac8fa,007aff,5856d6`
  
  // 提取姓名首字母
  const initial = name.charAt(0).toUpperCase()
  
  // 基于id或姓名为每个联系人生成不同的背景色
  const colors = ['0071e3', '34c759', 'ff9f0a', 'ff3b30', '5ac8fa', '007aff', '5856d6']
  const colorIndex = id ? parseInt(id) % colors.length : name.length % colors.length
  const bgColor = colors[colorIndex]
  
  // 使用DiceBear API生成头像
  return `https://api.dicebear.com/7.x/initials/svg?seed=${initial}&text=${initial}&backgroundColor=${bgColor}`
}

// 为群组生成特殊头像
const getGroupAvatar = (name, id) => {
  // 群组使用特殊的图标样式
  return `https://api.dicebear.com/7.x/icons/svg?seed=${id}&icon=users&backgroundColor=0071e3,34c759,ff9f0a,ff3b30,5ac8fa,007aff,5856d6`
}

// 联系人数据
const contacts = ref([
  {
    id: '1',
    name: '张三',
    status: 'online',
    lastMessage: '你好，最近怎么样？',
    lastMessageTime: Date.now() - 1000 * 60 * 5, // 5分钟前
    unreadCount: 2,
    category: 'friend'
  },
  {
    id: '2',
    name: '研发部',
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
    status: 'offline',
    lastMessage: '文件已发送',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
    unreadCount: 0,
    category: 'colleague'
  },
  {
    id: '4',
    name: '李四',
    status: 'busy',
    lastMessage: '我正在开会，稍后回复',
    lastMessageTime: Date.now() - 1000 * 60 * 15, // 15分钟前
    unreadCount: 0,
    category: 'friend'
  },
  {
    id: '5',
    name: '市场部',
    status: 'group',
    lastMessage: '赵六: 新的营销方案已经上传',
    lastMessageTime: Date.now() - 1000 * 60 * 60, // 1小时前
    unreadCount: 3,
    category: 'group',
    members: 12
  }
])

// 为联系人获取头像
const getContactAvatar = (contact) => {
  if (contact.status === 'group') {
    return getGroupAvatar(contact.name, contact.id)
  }
  return getDefaultAvatar(contact.name, contact.id)
}

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
          <img :src="getContactAvatar(contact)" :alt="contact.name" class="avatar" />
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
  padding: 4px 12px;
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
  padding: 8px;
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
  width: 44px;
  height: 44px;
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
    padding: 4px 8px;
  }
  
  .contact-item {
    padding: 6px;
  }
  
  .avatar {
    width: 38px;
    height: 38px;
  }
  
  .contact-name {
    font-size: 0.9rem;
  }
  
  .last-message {
    font-size: 0.8rem;
  }
}
</style>