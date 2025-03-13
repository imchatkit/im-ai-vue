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
import ContactList from './ContactList.vue'
import ChatWindow from './ChatWindow.vue'

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

// 设置默认头像
onMounted(() => {
  currentUser.value.avatar = getDefaultAvatar(currentUser.value.name, currentUser.value.id)
})

// 当前选中的联系人
const currentContact = ref(null)

// 消息列表
const messages = ref([])

// 侧边栏是否激活（用于移动端）
const isSidebarActive = ref(false)

// 当前屏幕宽度
const screenWidth = ref(window.innerWidth)

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

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
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
            <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          <span class="nav-label">联系人</span>
        </button>
        <button class="nav-button">
          <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <span class="nav-label">搜索</span>
        </button>
        <button class="nav-button">
          <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
          <span class="nav-label">设置</span>
        </button>
      </div>
      
      <div class="user-avatar" title="个人资料">
        <img :src="currentUser.avatar" alt="用户头像" class="avatar-img" />
      </div>
    </div>

    <!-- 内容区域包装器 -->
    <div class="content-wrapper">
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
        
        <ContactList @select="handleSelectContact" />
      </div>

      <!-- 右侧聊天主区域 -->
      <div class="main-chat">
        <ChatHeader :current-contact="currentContact" @toggle-sidebar="toggleSidebar" />
        <ChatWindow :contact="currentContact" :messages="messages" @send="handleSend" />
      </div>
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
  margin-left: var(--sidebar-width);
}

/* 左侧导航栏 - macOS风格 */
.left-sidebar {
  width: var(--sidebar-width);
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
  background-color: rgba(250, 250, 252, 0.8);
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
    width: 160px;
  }
  
  .middle-panel {
    margin-left: 0;
  }
  
  .content-wrapper {
    margin-left: 160px;
  }
  
  .nav-button {
    padding: 0 16px;
  }
}

/* 平板设备 (768px-1199px) */
@media screen and (max-width: 1199px) and (min-width: 769px) {
  .middle-panel {
    width: 240px;
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
    justify-content: space-around;
    padding: 0;
    z-index: 100;
    box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.1);
  }

  .nav-icons {
    flex-direction: row;
    padding: 8px;
    gap: 8px;
    justify-content: center;
  }
  
  .nav-button {
    width: auto;
    height: 44px;
    justify-content: center;
    padding: 0 16px;
  }
  
  .user-avatar {
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
}
</style>