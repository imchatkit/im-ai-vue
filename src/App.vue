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
