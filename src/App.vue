<script setup>
import MainLayout from './views/MainLayout.vue'
import { ref, onMounted } from 'vue'
import { isElectron } from './modules/electron-bridge'
import { isWeb } from './modules/web-adapter'

// 检测运行环境
const runningEnvironment = ref('web')
// 主题设置
const isDarkTheme = ref(false)

// 切换主题
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
}

onMounted(() => {
  // 根据运行环境设置相应的配置
  if (isElectron()) {
    runningEnvironment.value = 'electron'
    console.log('Running in Electron environment')
    // 初始化Electron特有功能
    initElectronFeatures()
  } else if (isWeb()) {
    runningEnvironment.value = 'web'
    console.log('Running in Web environment')
    // 初始化Web特有功能
    initWebFeatures()
  }
})

// 初始化Electron特有功能
const initElectronFeatures = () => {
  // 这里可以初始化托盘、窗口管理等Electron特有功能
  // 实际项目中应该从electron-bridge模块导入相关功能
}

// 初始化Web特有功能
const initWebFeatures = () => {
  // 这里可以初始化PWA、通知等Web特有功能
  // 实际项目中应该从web-adapter模块导入相关功能
}
</script>

<template>
  <div class="app-container" :class="[runningEnvironment, { 'dark-theme': isDarkTheme }]">
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="navbar-brand">
        <img src="/public/vite.svg" alt="Logo" class="logo" />
        <h1 class="brand-name">IM-AI</h1>
      </div>
      <div class="navbar-menu">
        <div class="nav-item active">消息</div>
        <div class="nav-item">联系人</div>
        <div class="nav-item">发现</div>
        <div class="nav-item">我的</div>
      </div>
      <div class="navbar-actions">
        <button class="action-btn">
          <i class="icon-search">🔍</i>
        </button>
        <button class="action-btn" @click="toggleTheme">
          <i class="icon-theme" v-if="isDarkTheme">☀️</i>
          <i class="icon-theme" v-else>🌙</i>
        </button>
      </div>
    </header>
    <MainLayout />
  </div>
</template>

<style>
/* 全局样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--bg-color);
}

/* 根变量 - 亮色主题 */
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
  --text-color: #ffffff;
  --bg-color: #000000;
  --border-color: #333333;
  --hover-color: #374151;
}

.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏样式 */
.top-navbar {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--safe-area-inset);
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.navbar-menu {
  display: flex;
  gap: 24px;
}

.nav-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: var(--transition-base);
  font-weight: 500;
}

.nav-item:hover {
  background-color: var(--hover-color);
}

.nav-item.active {
  color: var(--primary-color);
}

.navbar-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: var(--transition-base);
}

.action-btn:hover {
  background-color: var(--hover-color);
  color: var(--primary-color);
}

/* 响应式适配 */
@media (max-width: 992px) {
  .navbar-menu {
    display: none;
  }
  
  .brand-name {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .top-navbar {
    padding: 0 12px;
  }
  
  .action-btn {
    width: 36px;
    height: 36px;
  }
}

/* 图标占位样式 - 实际项目中应该使用图标库 */
[class^="icon-"] {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-color: currentColor;
  mask-size: contain;
  mask-position: center;
  mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  opacity: 0.7;
}
</style>
