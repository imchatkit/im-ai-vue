<script setup>
import MainLayout from './views/MainLayout.vue'
import { ref, onMounted, computed } from 'vue'
import { isElectron } from './modules/electron-bridge'
import { isWeb } from './modules/web-adapter'

// 检测运行环境
const runningEnvironment = ref('web')
// 主题设置
const isDarkTheme = ref(false)

// 计算窗口控制按钮的可见性
const showWindowControls = computed(() => {
  return runningEnvironment.value === 'electron'
})

// 切换主题
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
}

// 窗口控制函数
const minimizeWindow = () => {
  if (isElectron()) {
    window.electronAPI.minimizeWindow()
  }
}

const maximizeWindow = () => {
  if (isElectron()) {
    window.electronAPI.maximizeWindow()
  }
}

const closeWindow = () => {
  if (isElectron()) {
    window.electronAPI.closeWindow()
  }
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
    <!-- 主布局 -->
    <main class="main-content">
      <MainLayout />
    </main>
    
    <!-- 主题切换按钮 (移动到右下角) -->
    <button class="theme-toggle-btn" @click="toggleTheme">
      <svg v-if="isDarkTheme" class="icon" viewBox="0 0 24 24" width="16" height="16">
        <path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"/>
      </svg>
      <svg v-else class="icon" viewBox="0 0 24 24" width="16" height="16">
        <path fill="currentColor" d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
      </svg>
    </button>
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
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background-color: var(--bg-primary);
}

.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  position: relative;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* 主题切换按钮 */
.theme-toggle-btn {
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  box-shadow: var(--shadow-md);
  transition: var(--transition-base);
}

.theme-toggle-btn:hover {
  background-color: var(--bg-quaternary);
  color: var(--text-primary);
  transform: scale(1.05);
}

/* 图标样式 */
.icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  color: currentColor;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .theme-toggle-btn {
    bottom: 70px; /* 避免与底部导航栏重叠 */
  }
}
</style>
