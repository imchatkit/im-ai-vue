<script setup>
import { ref } from 'vue'
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

// 处理选择联系人
const handleSelectContact = (contact) => {
  currentContact.value = contact
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
</script>

<template>
  <!-- 三栏响应式布局 -->
  <div class="main-container">
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
    <div class="middle-panel">
      <UserProfile />
      <ContactSearch />
      <ContactList @select="handleSelectContact" />
    </div>

    <!-- 右侧聊天主区域 -->
    <div class="main-chat">
      <ChatHeader :current-contact="currentContact" />
      <ChatWindow :contact="currentContact" :messages="messages" @send="handleSend" />
    </div>
  </div>
</template>

<style scoped>
:root {
  --sidebar-width: 64px;
  --contact-list-width: 300px;
}

.main-container {
  display: flex;
  height: 100vh;
  background-color: var(--bg-color);
}

.left-sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
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

  .contact-section {
    position: absolute;
    left: 0;
    top: 0;
    height: calc(100% - 56px);
    width: 100%;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .contact-section.active {
    transform: translateX(0);
  }

  .chat-section {
    margin-bottom: 56px;
  }
}
</style>