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
  },
  {
    id: '6',
    name: '赵六',
    avatar: '/avatars/user4.png',
    status: 'away',
    lastMessage: '请查看我发送的文档',
    lastMessageTime: Date.now() - 1000 * 60 * 45, // 45分钟前
    unreadCount: 1,
    category: 'colleague'
  },
  {
    id: '7',
    name: '产品讨论组',
    avatar: '/avatars/group3.png',
    status: 'group',
    lastMessage: '王五: 已更新最新原型设计',
    lastMessageTime: Date.now() - 1000 * 60 * 120, // 2小时前
    unreadCount: 0,
    category: 'group',
    members: 5
  },
  {
    id: '8',
    name: '孙七',
    avatar: '/avatars/user5.png',
    status: 'online',
    lastMessage: '下午3点开会讨论项目进度',
    lastMessageTime: Date.now() - 1000 * 60 * 180, // 3小时前
    unreadCount: 0,
    category: 'colleague'
  }
])

// 当前选中的联系人ID
const selectedContactId = ref('')

// 当前显示的分类
const currentCategory = ref('all')

// 搜索关键词
const searchKeyword = ref('')

// 根据分类和搜索关键词过滤联系人
const filteredContacts = computed(() => {
  return contacts.value.filter(contact => {
    // 分类过滤
    const categoryMatch = 
      currentCategory.value === 'all' || 
      contact.category === currentCategory.value
    
    // 搜索关键词过滤
    const searchMatch = 
      !searchKeyword.value || 
      contact.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      (contact.lastMessage && contact.lastMessage.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    
    return categoryMatch && searchMatch
  })
})

// 选择联系人
const selectContact = (contactId) => {
  selectedContactId.value = contactId
  // 触发选择事件，通知父组件
  emit('select', contacts.value.find(c => c.id === contactId))
}

// 切换分类
const changeCategory = (category) => {
  currentCategory.value = category
}

// 格式化最后消息时间
const formatLastMessageTime = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  
  // 一分钟内
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  // 一小时内
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }
  
  // 一天内
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  }
  
  // 显示日期
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 定义事件
const emit = defineEmits(['select'])
</script>

<template>
  <div class="contact-list">
    <!-- 分类选项卡 -->
    <div class="category-tabs">
      <div 
        class="tab" 
        :class="{ active: currentCategory === 'all' }"
        @click="changeCategory('all')"
      >
        全部
      </div>
      <div 
        class="tab" 
        :class="{ active: currentCategory === 'friend' }"
        @click="changeCategory('friend')"
      >
        好友
      </div>
      <div 
        class="tab" 
        :class="{ active: currentCategory === 'colleague' }"
        @click="changeCategory('colleague')"
      >
        同事
      </div>
      <div 
        class="tab" 
        :class="{ active: currentCategory === 'group' }"
        @click="changeCategory('group')"
      >
        群组
      </div>
    </div>
    
    <!-- 搜索框 -->
    <div class="search-box">
      <input 
        v-model="searchKeyword"
        type="text" 
        placeholder="搜索联系人或消息" 
        class="search-input"
      />
      <i class="search-icon"></i>
    </div>
    
    <!-- 联系人列表 -->
    <div class="contacts">
      <div 
        v-for="contact in filteredContacts" 
        :key="contact.id"
        class="contact-item"
        :class="{ 
          'selected': selectedContactId === contact.id,
          'unread': contact.unreadCount > 0
        }"
        @click="selectContact(contact.id)"
      >
        <!-- 头像和状态 -->
        <div class="avatar-container">
          <img :src="contact.avatar" alt="Avatar" class="avatar" />
          <span 
            v-if="contact.status !== 'group'" 
            class="status-indicator" 
            :class="contact.status"
          ></span>
          <span 
            v-else 
            class="group-indicator"
          >
            {{ contact.members }}
          </span>
        </div>
        
        <!-- 联系人信息 -->
        <div class="contact-info">
          <div class="contact-header">
            <h3 class="contact-name">{{ contact.name }}</h3>
            <span class="last-time">{{ formatLastMessageTime(contact.lastMessageTime) }}</span>
          </div>
          <div class="contact-footer">
            <p class="last-message">{{ contact.lastMessage }}</p>
            <span v-if="contact.unreadCount > 0" class="unread-count">
              {{ contact.unreadCount > 99 ? '99+' : contact.unreadCount }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredContacts.length === 0" class="empty-state">
        <i class="empty-icon"></i>
        <p>没有找到匹配的联系人</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #4a8af4;
  --text-color: #333;
  --text-secondary: #666;
  --text-light: #999;
  --border-color: #e5e7eb;
  --bg-color: #fff;
  --bg-secondary: #f9fafb;
  --hover-color: #f3f4f6;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --transition-base: all 0.3s ease;
}

.contact-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  max-height: calc(100vh - 120px);
}

.category-tabs {
  display: flex;
  padding: 0 8px;
  border-bottom: 1px solid var(--border-color);
  background-color: #fff;
  position: sticky;
  top: 56px; /* 搜索框高度 */
  z-index: 10;
}

.tab {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-color-secondary);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.tab:hover {
  color: var(--primary-color);
  background-color: rgba(0, 0, 0, 0.02);
}

.tab.active {
  color: var(--primary-color);
  font-weight: 500;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
}

.search-box {
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  font-size: 14px;
  color: var(--text-color);
  transition: all 0.2s ease;
  background-color: var(--bg-secondary);
}

.search-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.contacts {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 4px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.contact-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.contact-item.selected {
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

.contacts {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.contact-item {
  display: flex;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: var(--transition-base);
  position: relative;
}

.contact-item:hover {
  background-color: #f0f0f0;
}

.contact-item.selected {
  background-color: rgba(74, 138, 244, 0.2);
  border-left: 3px solid var(--primary-color);
}

.avatar-container {
  position: relative;
  margin-right: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: var(--shadow-sm);
  border: 2px solid var(--bg-color);
  transition: var(--transition-base);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--bg-color);
  transition: var(--transition-base);
}

.status-indicator.online {
  background-color: #22c55e;
}

.status-indicator.offline {
  background-color: var(--text-light);
}

.group-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid var(--bg-color);
}

.contact-info {
  flex: 1;
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
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color);
}

.last-time {
  font-size: 12px;
  color: var(--text-light);
}

.contact-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.unread-count {
  background-color: var(--primary-color);
  color: #fff;
  font-size: 12px;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  font-weight: 500;
}

.contact-item.unread .last-message {
  color: var(--text-color);
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-light);
  padding: 32px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 响应式适配 */
@media screen and (max-width: 1199px) {
  .contact-info {
    max-width: 160px;
  }
  
  .contact-name {
    font-size: 14px;
  }
  
  .last-message {
    font-size: 12px;
  }
}

@media screen and (max-width: 768px) {
  .contact-list {
    max-height: calc(100vh - 112px);
  }
  
  .category-tabs {
    overflow-x: auto;
    white-space: nowrap;
    justify-content: flex-start;
    padding: 0 4px;
    top: 52px;
  }
  
  .tab {
    flex: none;
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .contact-item {
    padding: 8px;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
  }
  
  .contact-name {
    font-size: 14px;
  }
  
  .last-message {
    font-size: 12px;
  }
  
  .contact-info {
    max-width: calc(100% - 100px);
  }
}
</style>