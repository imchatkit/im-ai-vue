<script setup>
import { ref, computed } from 'vue'

// 联系人数据
const contacts = ref([
  {
    id: '1',
    name: '张三',
    avatar: '/avatars/user1.png',
    status: 'online',
    lastMessage: '你好，最近怎么样？',
    lastMessageTime: Date.now() - 1000 * 60 * 5, // 5分钟前
    unreadCount: 2,
    category: 'friend'
  },
  {
    id: '2',
    name: '研发部',
    avatar: '/avatars/group1.png',
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
    avatar: '/avatars/user2.png',
    status: 'offline',
    lastMessage: '文件已发送',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
    unreadCount: 0,
    category: 'colleague'
  },
  {
    id: '4',
    name: '李四',
    avatar: '/avatars/user3.png',
    status: 'busy',
    lastMessage: '我正在开会，稍后回复',
    lastMessageTime: Date.now() - 1000 * 60 * 15, // 15分钟前
    unreadCount: 0,
    category: 'friend'
  },
  {
    id: '5',
    name: '市场部',
    avatar: '/avatars/group2.png',
    status: 'group',
    lastMessage: '赵六: 新的营销方案已经上传',
    lastMessageTime: Date.now() - 1000 * 60 * 60, // 1小时前
    unreadCount: 3,
    category: 'group',
    members: 12
  }
])
</script>

<template>
  <div class="contact-list">
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input type="search" placeholder="搜索" class="search-input" />
      </div>
    </div>

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
            <span class="last-time">{{ contact.lastMessageTime }}</span>
          </div>
          <div class="contact-footer">
            <p class="last-message">{{ contact.lastMessage }}</p>
            <div v-if="contact.unreadCount > 0" class="unread-badge">
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
}

.search-bar {
  padding: 12px 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--bg-primary);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 0 12px 0 36px;
  border: none;
  border-radius: var(--radius-lg);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: var(--transition-base);
}

.search-input:focus {
  outline: none;
  background-color: var(--hover-color);
}

.contacts-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin: 4px 0;
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
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
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
  background-color: #34c759;
}

.status-indicator.offline {
  background-color: #8e8e93;
}

.status-indicator.busy {
  background-color: #ff3b30;
}

.status-indicator.group {
  background-color: var(--primary-color);
}

.contact-info {
  flex: 1;
  min-width: 0;
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
}

.last-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
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

.unread-badge {
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
}

@media (prefers-color-scheme: dark) {
  .search-input {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .search-input:focus {
    background-color: rgba(255, 255, 255, 0.15);
  }
}
</style>