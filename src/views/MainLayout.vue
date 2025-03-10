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

// 当前选中的联系人
const currentContact = ref(null)

// 消息列表
const messages = ref([])

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
    <!-- 左侧导航 (宽度可折叠) -->
    <div class="left-nav">
      <UserProfile />
      <ContactSearch />
      <ContactCategoryTabs />
    </div>

    <!-- 中间主聊天区 -->
    <div class="main-chat">
      <ChatHeader :current-contact="currentContact" />
      <MessageList :messages="messages" />
      <MessageInputPanel @send="handleSend" />
    </div>

    <!-- 右侧信息面板 (Electron下可独立窗口) -->
    <div class="right-panel">
      <ChatToolsPanel />
      <FilePreviewPanel />
      <SystemStatusBar />
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

.left-nav {
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

.right-panel {
  width: 280px;
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
  flex-shrink: 0;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .right-panel {
    width: 240px;
  }
}

@media screen and (max-width: 992px) {
  .left-nav {
    width: 240px;
  }
}

@media screen and (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
  
  .left-nav {
    width: 100%;
    height: 60px;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .right-panel {
    display: none;
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