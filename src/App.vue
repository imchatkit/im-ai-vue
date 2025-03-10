<script setup>
import MainLayout from './views/MainLayout.vue'
import { ref, onMounted } from 'vue'
import { isElectron } from './modules/electron-bridge'
import { isWeb } from './modules/web-adapter'

// 检测运行环境
const runningEnvironment = ref('web')

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
  <div class="app-container" :class="runningEnvironment">
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
  --text-color: #e0e0e0;
  --bg-color: #1e1e1e;
  --border-color: #444;
  --hover-color: #333;
}

.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
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
