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
.main-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--bg-color);
}

.left-sidebar {
  width: 60px;
  background-color: #2e2e2e;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.nav-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  width: 100%;
}

.nav-icon {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #999;
  font-size: 24px;
  position: relative;
}

.nav-icon.active {
  color: #fff;
}

.nav-icon.active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background-color: #07c160;
}

.middle-panel {
  width: 280px;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
  transition: width 0.3s;
  flex-shrink: 0;
}

.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  min-width: 320px;
  position: relative;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .middle-panel {
    width: 240px;
  }
}

@media screen and (max-width: 992px) {
  .left-sidebar {
    width: 50px;
  }
  
  .middle-panel {
    width: 220px;
  }
}

@media screen and (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
  
  .left-sidebar {
    width: 100%;
    height: 50px;
    flex-direction: row;
  }
  
  .nav-icons {
    flex-direction: row;
    padding-top: 0;
  }
  
  .nav-icon {
    height: 50px;
    width: 25%;
  }
  
  .nav-icon.active::after {
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    width: 20px;
    height: 3px;
  }
  
  .middle-panel {
    width: 100%;
    height: 60px;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
}

/* 暗色主题变量 */
:root {
  --primary-color: #4a8af4;
  --text-color: #333;
  --bg-color: #fff;
  --border-color: #e0e0e0;
  --hover-color: #f0f0f0;
}

/* 暗色主题 */
.dark-theme {
  --primary-color: #5c9aff;
  --text-color: #e0e0e0;
  --bg-color: #1e1e1e;
  --border-color: #444;
  --hover-color: #333;
}
</style>