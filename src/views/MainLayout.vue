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
          <i class="icon-chat">💬</i>
        </div>
        <div class="nav-icon">
          <i class="icon-contacts">👥</i>
        </div>
        <div class="nav-icon">
          <i class="icon-discover">🔍</i>
        </div>
        <div class="nav-icon">
          <i class="icon-me">👤</i>
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
.main-container {
  display: flex;
  height: calc(100vh - var(--header-height));
  background-color: var(--bg-color);
  position: relative;
  margin-top: var(--header-height);
}

.left-sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-secondary);
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
  gap: 8px;
}

.nav-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
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
  margin-left: calc(var(--sidebar-width) + var(--contact-list-width));
  height: 100vh;
  overflow: hidden;
}

.contact-section {
  width: var(--contact-list-width);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

/* 响应式适配 */
/* 平板设备 (768px-1199px) */
@media screen and (max-width: 1199px) and (min-width: 769px) {
  .left-sidebar {
    width: 64px;
  }
  
  .middle-panel {
    width: 240px;
  }
  
  .main-chat {
    margin-left: calc(64px + 240px);
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
    height: 56px;
    flex-direction: row;
    justify-content: space-around;
    padding: 0;
    z-index: 100;
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);
  }

  .nav-icons {
    flex-direction: row;
    padding: 8px;
  }
  
  .middle-panel {
    position: absolute;
    left: 0;
    top: 0;
    height: calc(100% - 56px);
    width: 100%;
    margin-left: 0;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .middle-panel.active {
    transform: translateX(0);
  }

  .main-chat {
    margin-left: 0;
    margin-bottom: 56px;
  }
  
  /* 添加汉堡菜单按钮样式 */
  .hamburger-menu {
    display: block;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 1001;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background-color: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
  }
}

</style>