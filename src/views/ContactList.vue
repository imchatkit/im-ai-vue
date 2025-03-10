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
.contact-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.category-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-color);
  transition: all 0.3s;
}

.tab.active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}

.search-box {
  padding: 12px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  font-size: 14px;
  outline: none;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.contacts {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.contact-item {
  display: flex;
  padding: 12px 8px;
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.contact-item:hover {
  background-color: var(--hover-color);
}

.contact-item.selected {
  background-color: rgba(74, 138, 244, 0.1);
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
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.status-indicator.online {
  background-color: #4caf50;
}

.status-indicator.offline {
  background-color: #9e9e9e;
}

.group-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 10px;
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
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
}

.last-time {
  font-size: 12px;
  color: #999;
}

.contact-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message {
  margin: 0;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.unread-count {
  background-color: var(--primary-color);
  color: #fff;
  font-size: 12px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
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
  color: #999;
  padding: 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .category-tabs {
    display: none;
  }
  
  .contact-item {
    padding: 8px 4px;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
  }
}
</style>