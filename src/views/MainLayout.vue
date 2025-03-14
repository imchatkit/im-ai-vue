<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import UserProfile from './components/UserProfile.vue'
import ContactSearch from './components/ContactSearch.vue'
import ContactCategoryTabs from './components/ContactCategoryTabs.vue'
import ChatHeader from './components/ChatHeader.vue'
import MessageList from './components/MessageList.vue'
import MessageInputPanel from '../components/chat/InputPanel.vue'
import ChatToolsPanel from './components/ChatToolsPanel.vue'
import FilePreviewPanel from './components/FilePreviewPanel.vue'
import SystemStatusBar from './components/SystemStatusBar.vue'
import Sidebar from '../components/sidebar/Sidebar.vue'
import ChatWindow from './ChatWindow.vue'
import Settings from './Settings.vue'
// import ThemeToggle from '../components/ThemeToggle.vue'

// 主题设置
const isDarkTheme = ref(false)

// 是否显示设置页面
const showSettings = ref(false)

// 主题管理函数
const themeManager = {
  // 应用主题到DOM
  applyTheme(isDark) {
    console.log('应用主题:', isDark ? '深色' : '浅色');
    
    // 移除所有主题相关的类
    document.documentElement.classList.remove('dark-theme', 'light-theme');
    
    // 添加当前主题类
    const themeName = isDark ? 'dark-theme' : 'light-theme';
    document.documentElement.classList.add(themeName);
    
    // 保存到本地存储
    localStorage.setItem('theme-preference', isDark ? 'dark' : 'light');
  },
  
  // 从本地存储加载主题
  loadTheme() {
    const savedTheme = localStorage.getItem('theme-preference');
    console.log('从存储加载主题:', savedTheme);
    return savedTheme === 'dark';
  },
  
  // 初始化主题
  initTheme() {
    const isDark = this.loadTheme();
    isDarkTheme.value = isDark;
    this.applyTheme(isDark);
    console.log('主题初始化完成:', isDark ? '深色' : '浅色');
  }
};

// 切换主题
const toggleTheme = (themeValue) => {
  console.log('MainLayout received theme change:', themeValue);
  
  // 如果提供了主题值参数，直接使用
  if (themeValue) {
    isDarkTheme.value = themeValue === 'dark';
  } else {
    // 对于直接调用（不应该发生，因为我们已经移除了左侧栏的直接切换功能）
    isDarkTheme.value = !isDarkTheme.value;
  }
  
  // 应用主题
  themeManager.applyTheme(isDarkTheme.value);
  
  console.log('Theme updated to:', isDarkTheme.value ? 'dark' : 'light');
}

// 切换设置页面显示状态
const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

// 初始化主题
onMounted(() => {
  // 初始化主题
  themeManager.initTheme();
  
  // 设置默认头像
  currentUser.value.avatar = getDefaultAvatar(currentUser.value.name, currentUser.value.id);
  
  // 添加事件监听器
  window.addEventListener('resize', handleResize);
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
})

// 生成默认头像
const getDefaultAvatar = (name = 'User', id = '') => {
  // 使用DiceBear API生成头像
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${id || name}`
}

// 当前用户
const currentUser = ref({
  id: 'current-user-id',
  name: '当前用户',
  avatar: ''
})

// 当前选中的联系人
const currentContact = ref(null)

// 消息列表
const messages = ref([])

// 侧边栏是否激活（用于移动端）
const isSidebarActive = ref(false)

// 当前屏幕宽度
const screenWidth = ref(window.innerWidth)

// 联系人数据
const contactsData = ref([
  {
    id: '1',
    name: '张三',
    status: 'online',
    type: 'friend',
    description: '前端开发工程师'
  },
  {
    id: '2',
    name: '李四',
    status: 'busy',
    type: 'friend',
    description: '产品经理'
  },
  {
    id: '3',
    name: '王五',
    status: 'offline',
    type: 'stranger',
    description: '后端开发工程师'
  },
  {
    id: '4',
    name: '赵六',
    status: 'online',
    type: 'friend',
    description: 'UI设计师'
  },
  {
    id: '5',
    name: '钱七',
    status: 'offline',
    type: 'stranger',
    description: '产品运营'
  }
])

// 群组数据
const groupsData = ref([
  {
    id: '101',
    name: '研发部',
    isCreator: true,
    memberCount: 8,
    unreadCount: 5,
    description: '研发部技术交流群'
  },
  {
    id: '102',
    name: '市场部',
    isCreator: false,
    memberCount: 12,
    unreadCount: 3,
    description: '市场部日常沟通'
  },
  {
    id: '103',
    name: '项目A组',
    isCreator: true,
    memberCount: 5,
    description: '项目A开发小组'
  },
  {
    id: '104',
    name: '设计部',
    isCreator: false,
    memberCount: 6,
    description: '设计部交流群'
  }
])

// 最近会话数据
const recentChatsData = ref([
  {
    id: '1',
    name: '张三',
    lastMessage: '你好，最近怎么样？',
    lastMessageTime: Date.now() - 1000 * 60 * 5, // 5分钟前
    status: 'online',
    unreadCount: 2,
    isGroup: false
  },
  {
    id: '101',
    name: '研发部',
    lastMessage: '明天开会讨论新功能',
    lastMessageSender: '李四',
    lastMessageTime: Date.now() - 1000 * 60 * 30, // 30分钟前
    unreadCount: 5,
    isGroup: true,
    memberCount: 8
  },
  {
    id: '3',
    name: '王五',
    lastMessage: '文件已发送',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
    status: 'offline',
    unreadCount: 0,
    isGroup: false
  },
  {
    id: '102',
    name: '市场部',
    lastMessage: '新的营销方案已经上传',
    lastMessageSender: '赵六',
    lastMessageTime: Date.now() - 1000 * 60 * 60, // 1小时前
    unreadCount: 3,
    isGroup: true,
    memberCount: 12
  }
])

// 处理选择联系人
const handleSelectContact = (contact) => {
  currentContact.value = contact
  // 在移动端选择联系人后自动关闭侧边栏
  if (screenWidth.value < 768) {
    isSidebarActive.value = false
  }
  // 清空当前消息列表
  messages.value = []
  // 模拟添加示例消息
  messages.value = [
    {
      id: Date.now().toString(),
      senderId: contact.id,
      receiverId: 'current-user-id',
      content: `你好，我是${contact.name}`,
      type: 'text',
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
      status: 'read'
    }
  ]
}

// 处理选择群组
const handleSelectGroup = (group) => {
  currentContact.value = {
    ...group,
    isGroup: true
  }
  // 在移动端选择群组后自动关闭侧边栏
  if (screenWidth.value < 768) {
    isSidebarActive.value = false
  }
  // 清空当前消息列表
  messages.value = []
  // 模拟添加示例消息
  messages.value = [
    {
      id: Date.now().toString(),
      senderId: 'system',
      receiverId: 'group',
      content: `欢迎加入${group.name}`,
      type: 'system',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
      status: 'read'
    }
  ]
}

// 处理选择最近会话
const handleSelectChat = (chat) => {
  if (chat.isGroup) {
    const group = groupsData.value.find(g => g.id === chat.id);
    if (group) {
      handleSelectGroup(group);
    }
  } else {
    const contact = contactsData.value.find(c => c.id === chat.id);
    if (contact) {
      handleSelectContact(contact);
    }
  }
}

// 处理发送消息
const handleSend = (message) => {
  // 这里应该调用消息服务发送消息
  console.log('发送消息:', message)
  
  // 模拟添加到消息列表
  messages.value.push({
    ...message,
    id: Date.now().toString(),
    senderId: 'current-user-id',
    receiverId: currentContact.value?.id,
    timestamp: Date.now(),
    status: 'sending'
  })
}

// 切换侧边栏显示状态
const toggleSidebar = () => {
  isSidebarActive.value = !isSidebarActive.value
}

// 监听窗口大小变化
const handleResize = () => {
  screenWidth.value = window.innerWidth
  // 如果屏幕宽度大于768px，自动关闭移动端侧边栏
  if (screenWidth.value >= 768) {
    isSidebarActive.value = false
  }
}
</script>

<template>
  <!-- 三栏响应式布局 -->
  <div class="main-container">
    <!-- 移动端汉堡菜单 -->
    <div v-if="screenWidth < 768" class="hamburger-menu glass-container" @click="toggleSidebar">
      <svg class="icon" viewBox="0 0 24 24" width="18" height="18">
        <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
      </svg>
    </div>
    
    <!-- 左侧图标导航栏 -->
    <div class="left-sidebar glass-container">
      <div class="nav-icons">
        <button class="nav-button active">
          <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
          <span class="nav-label">聊天</span>
        </button>
        <button class="nav-button">
          <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          <span class="nav-label">联系人</span>
        </button>
        <button class="nav-button">
          <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <span class="nav-label">搜索</span>
        </button>
        <button class="nav-button" @click="toggleSettings">
          <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
          <span class="nav-label">设置</span>
        </button>
      </div>
      
      <div class="bottom-nav">
        <div class="profile-controls">
          <div class="user-avatar" title="个人资料">
            <img :src="currentUser.avatar" alt="用户头像" class="avatar-img" />
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域包装器 -->
    <div class="content-wrapper">
      <!-- 显示设置页面或聊天内容 -->
      <template v-if="showSettings">
        <div class="settings-container">
          <div class="settings-header">
            <button class="back-button" @click="toggleSettings">
              <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              <span>返回</span>
            </button>
            <h1>设置</h1>
          </div>
          <Settings @theme-change="toggleTheme" />
        </div>
      </template>
      <template v-else>
        <!-- 中间联系人列表区 -->
        <div class="middle-panel glass-container" :class="{ 'active': isSidebarActive }">
          <UserProfile />
          
          <div class="panel-header">
            <h2 class="panel-title">消息</h2>
            <button class="icon-button">
              <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
          </div>
          
          <!-- 替换ContactList为新的Sidebar组件 -->
          <Sidebar 
            :recent-chats-data="recentChatsData" 
            :contacts-data="contactsData"
            :groups-data="groupsData"
            @select-contact="handleSelectContact"
            @select-group="handleSelectGroup"
            @select-chat="handleSelectChat"
          />
        </div>

        <!-- 右侧聊天主区域 -->
        <div class="main-chat">
          <ChatHeader :current-contact="currentContact" @toggle-sidebar="toggleSidebar" />
          <ChatWindow :contact="currentContact" :messages="messages" @send="handleSend" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  height: 100vh;
  background-color: var(--bg-primary);
  position: relative;
  padding-top: 0;
}

/* 内容区域包装器 */
.content-wrapper {
  display: flex;
  flex: 1;
  margin-left: var(--sidebar-min-width);
}

/* 左侧导航栏 - macOS风格 */
.left-sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-min-width);
  max-width: var(--sidebar-max-width);
  background-color: var(--bg-glass-secondary);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  box-shadow: 1px 0 0 0 var(--border-color-light);
  transition: width var(--transition-smooth);
}

.nav-icons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 0 8px;
}

.nav-button {
  width: 100%;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 12px;
  color: var(--text-secondary);
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: none;
  font-size: 12px;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.nav-button:hover {
  background-color: var(--hover-color);
  color: var(--text-primary);
  transform: translateZ(0);
}

.nav-button:active {
  transform: scale(0.98);
}

.nav-button.active {
  background-color: var(--primary-color);
  color: white;
}

.nav-button.active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0));
  border-radius: inherit;
  pointer-events: none;
}

.nav-button .icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  transition: transform 0.2s var(--easing-standard);
}

.nav-button:hover .icon {
  transform: scale(1.1);
}

.nav-label {
  display: none;
  font-weight: 500;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s var(--easing-decelerate);
}

.bottom-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: auto;
  padding-bottom: 16px;
}

.profile-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 48px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.theme-indicator {
  font-size: 10px;
  margin-left: auto;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.theme-indicator.dark {
  background-color: #3A3A3C;
  color: #EBEBF5;
}

.theme-indicator.light {
  background-color: #E5E5EA;
  color: #4D4D4D;
}

/* 中间联系人列表区 */
.middle-panel {
  width: var(--contact-list-width);
  background-color: var(--bg-glass-primary);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  flex-shrink: 0;
  transition: transform 0.3s var(--easing-standard), 
              width 0.3s var(--easing-standard),
              box-shadow 0.3s var(--easing-standard);
}

.panel-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-glass-primary);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 右侧聊天主区域 */
.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  height: 100vh;
  overflow: hidden;
  border-left: none;
  position: relative;
  box-shadow: var(--shadow-xs);
  transition: box-shadow 0.3s var(--easing-standard);
}

/* 移动端汉堡菜单 */
.hamburger-menu {
  display: none;
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 1001;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  color: var(--text-primary);
  background-color: var(--bg-glass-primary);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border: 1px solid var(--border-color-light);
  transition: background-color 0.2s var(--easing-standard), 
              transform 0.2s var(--easing-standard);
}

.hamburger-menu:hover {
  background-color: var(--bg-glass-secondary);
  transform: scale(1.05);
}

.hamburger-menu:active {
  transform: scale(0.95);
}

.hamburger-menu .icon {
  transition: transform 0.3s var(--easing-standard);
}

/* 响应式适配 */
@media screen and (min-width: 1400px) {
  .nav-label {
    display: block;
    opacity: 1;
    transform: translateX(0);
  }
  
  .left-sidebar {
    width: var(--sidebar-max-width);
  }
  
  .middle-panel {
    margin-left: 0;
  }
  
  .content-wrapper {
    margin-left: var(--sidebar-max-width);
  }
  
  .nav-button {
    padding: 0 16px;
  }
  
  .bottom-nav {
    width: 100%;
  }
}

/* 平板设备 (768px-1199px) */
@media screen and (max-width: 1199px) and (min-width: 769px) {
  .middle-panel {
    width: 240px;
  }
  
  .profile-controls {
    flex-direction: column;
    gap: 10px;
  }
}

/* 移动设备 (<768px) */
@media screen and (max-width: 768px) {
  .main-container {
    position: relative;
  }

  .hamburger-menu {
    display: flex;
  }
  
  .hamburger-menu.active .icon {
    transform: rotate(180deg);
  }

  .left-sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    top: auto;
    width: 100%;
    height: 60px;
    flex-direction: row;
    justify-content: space-between;
    padding: 0 10px;
    z-index: 100;
    box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.1);
  }

  .nav-icons {
    flex-direction: row;
    padding: 8px;
    gap: 8px;
    justify-content: flex-start;
    flex: 1;
  }
  
  .nav-button {
    width: auto;
    height: 44px;
    justify-content: center;
    padding: 0 16px;
  }
  
  .bottom-nav {
    display: flex;
    flex-direction: row;
    width: auto;
    height: 100%;
    margin: 0;
    padding: 10px 0;
    justify-content: center;
  }
  
  .profile-controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    max-width: none;
  }
  
  .theme-indicator {
    display: none;
  }
  
  .content-wrapper {
    margin-left: 0;
  }
  
  .middle-panel {
    position: fixed;
    left: 0;
    top: 0;
    height: calc(100% - 60px);
    width: 100%;
    margin-left: 0;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s var(--easing-decelerate);
    border-radius: 0;
    box-shadow: var(--shadow-lg);
  }
  
  .middle-panel.active {
    transform: translateX(0);
  }

  .main-chat {
    margin-left: 0;
    margin-bottom: 60px;
    border-radius: 0;
  }
  
  .settings-container {
    padding-bottom: 60px;
  }
}

.settings-container {
  width: 100%;
  height: 100%;
  background-color: var(--bg-primary);
  overflow-y: auto;
}

.settings-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-glass-primary);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  position: sticky;
  top: 0;
  z-index: 10;
}

.settings-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  text-align: center;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-secondary);
  transition: var(--transition-base);
}

.back-button:hover {
  background-color: var(--hover-color);
  color: var(--text-primary);
}

.back-button .icon {
  width: 20px;
  height: 20px;
}
</style>