<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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
    <div v-if="screenWidth < 768" class="hamburger-menu" @click="toggleSidebar">
      <i class="icon-menu">☰</i>
    </div>
    
    <!-- 左侧图标导航栏 -->
    <div class="left-sidebar">
      <div class="nav-icons">
        <div class="nav-icon active">
          <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        </div>
        <div class="nav-icon">
          <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
        </div>
        <div class="nav-icon">
          <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
        <div class="nav-icon">
          <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 中间联系人列表区 -->
    <div class="middle-panel" :class="{ 'active': isSidebarActive }">
      <UserProfile />
      <ContactList @select="handleSelectContact" />
    </div>

    <!-- 右侧聊天主区域 -->
    <div class="main-chat">
      <ChatHeader :current-contact="currentContact" @toggle-sidebar="toggleSidebar" />
      <ChatWindow :contact="currentContact" :messages="messages" @send="handleSend" />
    </div>
  </div>
</template>

<style scoped>
:root {
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --primary-color: #007AFF;
  --bg-primary: #ffffff;
  --bg-secondary: rgba(255, 255, 255, 0.8);
  --border-color: rgba(0, 0, 0, 0.1);
  --text-primary: #000000;
  --text-secondary: #666666;
  --hover-color: rgba(0, 122, 255, 0.1);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --sidebar-width: 72px;
  --contact-list-width: 320px;
  --header-height: 0px;
}

.main-container {
  display: flex;
  height: 100vh;
  background-color: var(--bg-primary);
  position: relative;
  font-family: var(--font-family);
}

.left-sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-secondary);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
}

.nav-icons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-base);
}

.nav-icon:hover {
  background-color: var(--hover-color);
  color: var(--primary-color);
}

.nav-icon.active {
  background-color: var(--primary-color);
  color: white;
}

.nav-icon .icon {
  width: 24px;
  height: 24px;
}

.middle-panel {
  width: var(--contact-list-width);
  border-right: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
  height: 100vh;
  overflow-y: auto;
}

.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  margin-left: 0;
  height: 100vh;
  overflow: hidden;
}

/* 响应式适配 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1c1c1e;
    --bg-secondary: rgba(28, 28, 30, 0.8);
    --text-primary: #ffffff;
    --text-secondary: #98989d;
    --border-color: rgba(255, 255, 255, 0.1);
    --hover-color: rgba(0, 122, 255, 0.2);
  }
}

/* 平板设备 (768px-1199px) */
@media screen and (max-width: 1199px) and (min-width: 769px) {
  :root {
    --sidebar-width: 64px;
    --contact-list-width: 280px;
  }
}

/* 移动设备 (<768px) */
@media screen and (max-width: 768px) {
  .main-container {
    position: relative;
  }

  .left-sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 64px;
    flex-direction: row;
    justify-content: space-around;
    padding: 0;
    z-index: 100;
    box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.1);
  }

  .nav-icons {
    flex-direction: row;
    padding: 8px;
    gap: 24px;
  }
  
  .middle-panel {
    position: absolute;
    left: 0;
    top: 0;
    height: calc(100% - 64px);
    width: 100%;
    margin-left: 0;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0;
  }
  
  .middle-panel.active {
    transform: translateX(0);
  }

  .main-chat {
    margin-left: 0;
    margin-bottom: 64px;
    border-radius: 0;
  }
  
  .hamburger-menu {
    display: flex;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 1001;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background-color: var(--bg-secondary);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    color: var(--text-primary);
  }
}
</style>