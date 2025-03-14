<script setup>
import MainLayout from './views/MainLayout.vue'
import { ref, onMounted, computed } from 'vue'
import { isElectron } from './modules/electron-bridge'
import { isWeb } from './modules/web-adapter'

// 检测运行环境
const runningEnvironment = ref('web')

// 计算窗口控制按钮的可见性
const showWindowControls = computed(() => {
  return runningEnvironment.value === 'electron'
})


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
  
  // 不再在App.vue中初始化主题，由MainLayout统一管理
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
  <div class="app-container" :class="[runningEnvironment]">
    <!-- 主布局 -->
    <main class="main-content">
      <MainLayout />
    </main>
  
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
  color: var(--ios-text-primary);
  background-color: var(--ios-bg-primary);
}

.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: var(--ios-bg-primary);
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
  background-color: var(--ios-bg-tertiary);
  color: var(--ios-text-secondary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.theme-toggle-btn:hover {
  background-color: var(--ios-accent-color-light);
  color: var(--ios-accent-color);
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

/* iOS风格的CSS变量 - 全局定义 */
:root {
  --ios-bg-primary: #FFFFFF;
  --ios-bg-primary-translucent: rgba(255, 255, 255, 0.8);
  --ios-bg-secondary: #F9F9F9;
  --ios-bg-tertiary: #F2F2F7;
  --ios-text-primary: #000000;
  --ios-text-secondary: #3C3C43;
  --ios-text-tertiary: #8E8E93;
  --ios-text-quaternary: #C7C7CC;
  --ios-border-color: #E5E5EA;
  --ios-border-color-strong: #C7C7CC;
  --ios-accent-color: #007AFF;
  --ios-accent-color-light: rgba(0, 122, 255, 0.08);
  
  /* 兼容旧变量 */
  --bg-primary: var(--ios-bg-primary);
  --bg-secondary: var(--ios-bg-secondary);
  --bg-tertiary: var(--ios-bg-tertiary);
  --bg-quaternary: var(--ios-bg-tertiary);
  --text-primary: var(--ios-text-primary);
  --text-secondary: var(--ios-text-secondary);
  --text-tertiary: var(--ios-text-tertiary);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
  --transition-base: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

:root.dark-theme {
  --ios-bg-primary: #1C1C1E;
  --ios-bg-primary-translucent: rgba(28, 28, 30, 0.8);
  --ios-bg-secondary: #2C2C2E;
  --ios-bg-tertiary: #3A3A3C;
  --ios-text-primary: #FFFFFF;
  --ios-text-secondary: #EBEBF5;
  --ios-text-tertiary: #8E8E93;
  --ios-text-quaternary: #636366;
  --ios-border-color: #38383A;
  --ios-border-color-strong: #48484A;
  --ios-accent-color: #0A84FF;
  --ios-accent-color-light: rgba(10, 132, 255, 0.15);
  
  /* 兼容旧变量 */
  --bg-primary: var(--ios-bg-primary);
  --bg-secondary: var(--ios-bg-secondary);
  --bg-tertiary: var(--ios-bg-tertiary);
  --bg-quaternary: var(--ios-bg-tertiary);
  --text-primary: var(--ios-text-primary);
  --text-secondary: var(--ios-text-secondary);
  --text-tertiary: var(--ios-text-tertiary);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 平滑过渡效果 */
body, .app-container, * {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>
