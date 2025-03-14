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
import TopNavigationSidebar from '../components/sidebar/TopNavigationSidebar.vue'
import ChatWindow from './ChatWindow.vue'
import Settings from './Settings.vue'
// import ThemeToggle from '../components/ThemeToggle.vue'

// 主题设置
const isDarkTheme = ref(false)

// 是否显示设置页面
const showSettings = ref(false)

// 当前激活的导航Tab
const activeTab = ref('chat')

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

// 处理导航Tab切换
const handleTabChange = (tabName) => {
  activeTab.value = tabName
  // 如果切换到设置页面，则隐藏聊天区域
  showSettings.value = tabName === 'settings'
}

// 处理用户头像点击
const handleAvatarClick = () => {
  // 这里可以添加用户菜单逻辑
  console.log('User avatar clicked')
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
    
    <!-- 左侧导航栏 - 顶级导航栏 -->
    <TopNavigationSidebar 
      :active-tab="activeTab" 
      :current-user="currentUser"
      @tab-change="handleTabChange"
      @avatar-click="handleAvatarClick"
    />

    <!-- 内容区域包装器 -->
    <div class="content-wrapper">
      <!-- 显示设置页面或其他内容 -->
      <template v-if="activeTab === 'settings'">
        <div class="settings-container">
          <Settings @theme-change="toggleTheme" />
        </div>
      </template>
      <template v-else>
        <!-- 中间联系人/群组/聊天列表区 -->
        <div class="middle-panel glass-container" :class="{ 'active': isSidebarActive }">
          <Sidebar 
            :active-tab="activeTab"
            :recent-chats-data="recentChatsData" 
            :contacts-data="contactsData"
            :groups-data="groupsData"
            @select-contact="handleSelectContact"
            @select-group="handleSelectGroup"
            @select-chat="handleSelectChat"
            @theme-change="toggleTheme"
          />
        </div>

        <!-- 右侧聊天主区域 -->
        <div class="main-chat" v-if="currentContact">
          <ChatHeader :current-contact="currentContact" @toggle-sidebar="toggleSidebar" />
          <ChatWindow :contact="currentContact" :messages="messages" @send="handleSend" />
        </div>
        
        <!-- 未选择聊天时的欢迎界面 -->
        <div v-else class="welcome-container">
          <div class="welcome-content">
            <img src="../assets/welcome-chat.svg" alt="欢迎使用IM聊天" class="welcome-image" />
            <h2>选择一个联系人或群组开始聊天</h2>
            <p>从左侧列表中选择一个聊天对象，开始您的对话</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  height: 100vh;
  background-color: #FFFFFF;
  position: relative;
  overflow: hidden;
}

/* 内容区域包装器 */
.content-wrapper {
  display: flex;
  flex: 1;
  margin-left: 0;
}

/* 中间联系人列表区 */
.middle-panel {
  width: 300px;
  background-color: #FFFFFF;
  border-right: 0.5px solid #E5E5EA;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), 
              width 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* 右侧聊天主区域 */
.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* 欢迎界面 */
.welcome-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
  height: 100vh;
  overflow: hidden;
  position: relative;
  padding: 20px;
}

.welcome-content {
  text-align: center;
  max-width: 460px;
  padding: 40px 30px;
  border-radius: 16px;
  background-color: #F9F9F9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  border: 0.5px solid #E5E5EA;
  animation: fadeIn 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.welcome-image {
  width: 160px;
  height: auto;
  margin-bottom: 24px;
  animation: float 6s ease-in-out infinite;
}

.welcome-content h2 {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 12px;
  letter-spacing: -0.4px;
}

.welcome-content p {
  font-size: 15px;
  color: #8E8E93;
  line-height: 1.5;
  letter-spacing: -0.2px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

/* 移动端汉堡菜单 */
.hamburger-menu {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 1001;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #000000;
  background-color: rgba(249, 249, 249, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 0.5px solid #E5E5EA;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.hamburger-menu:hover {
  transform: scale(1.05);
}

.hamburger-menu:active {
  transform: scale(0.95);
}

.settings-container {
  width: 100%;
  height: 100%;
  background-color: #FFFFFF;
  overflow-y: auto;
  padding: 20px;
}

/* 响应式适配 */
@media screen and (max-width: 1200px) {
  .middle-panel {
    width: 280px;
  }
}

@media screen and (max-width: 768px) {
  .main-container {
    position: relative;
    padding-bottom: 54px; /* 为底部导航栏预留空间 */
  }

  .hamburger-menu {
    display: flex;
  }
  
  .content-wrapper {
    margin-left: 0;
  }
  
  .middle-panel {
    position: fixed;
    left: 0;
    top: 0;
    height: calc(100% - 54px);
    width: 100%;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    box-shadow: 0 1px 10px rgba(0, 0, 0, 0.1);
  }
  
  .middle-panel.active {
    transform: translateX(0);
  }

  .main-chat {
    margin-left: 0;
    margin-bottom: 54px;
  }
  
  .welcome-container {
    margin-bottom: 54px;
    padding: 16px;
  }
  
  .welcome-content {
    padding: 30px 20px;
    max-width: 100%;
  }
  
  .welcome-image {
    width: 120px;
  }
  
  .settings-container {
    padding-bottom: 64px;
  }
}
</style>