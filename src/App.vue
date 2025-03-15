<script setup>
import { ref, onMounted } from 'vue'
import { isElectron } from './modules/electron-bridge'
import { isWeb } from './modules/web-adapter'

// 检测运行环境
const runningEnvironment = ref('web')
const message = ref('欢迎使用IM AI应用')
const debugInfo = ref({
  isElectron: false,
  electronDebug: null,
  windowSize: '',
  userAgent: ''
})

onMounted(() => {
  console.log('App.vue组件已挂载')
  
  // 收集调试信息
  if (typeof window !== 'undefined') {
    debugInfo.value.windowSize = `${window.innerWidth}x${window.innerHeight}`
    debugInfo.value.userAgent = navigator.userAgent
    
    if (window.electronDebug) {
      debugInfo.value.electronDebug = window.electronDebug
    }
  }
  
  // 根据运行环境设置相应的配置
  if (isElectron()) {
    runningEnvironment.value = 'electron'
    message.value = '当前在Electron环境中运行'
    debugInfo.value.isElectron = true
    console.log('Running in Electron environment')
    
    // 如果electron对象存在，获取版本信息
    if (window.electron && window.electron.versions) {
      debugInfo.value.versions = window.electron.versions
    }
  } else if (isWeb()) {
    runningEnvironment.value = 'web'
    message.value = '当前在Web环境中运行'
    console.log('Running in Web environment')
  }
})
</script>

<template>
  <div class="app-container" :class="[runningEnvironment]">
    <div class="test-content">
      <h1>IM AI 应用</h1>
      <p>{{ message }}</p>
      <div class="environment-info">
        <p>运行环境: {{ runningEnvironment }}</p>
        <p>版本: 0.0.0</p>
      </div>
      
      <!-- 调试信息 -->
      <div class="debug-section">
        <h2>调试信息</h2>
        <pre>{{ JSON.stringify(debugInfo, null, 2) }}</pre>
      </div>
    </div>
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
  color: #333;
  background-color: #f5f5f5;
}

.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  position: relative;
}

.test-content {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 90%;
}

h1 {
  margin-bottom: 1rem;
  color: #007aff;
}

h2 {
  margin: 1.5rem 0 0.5rem;
  color: #007aff;
  font-size: 1.2rem;
}

p {
  margin-bottom: 1rem;
}

.environment-info {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.9rem;
  color: #666;
}

.debug-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  text-align: left;
}

pre {
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 5px;
  overflow-x: auto;
  font-size: 0.8rem;
  color: #333;
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  body {
    color: #f5f5f5;
    background-color: #333;
  }
  
  .app-container {
    background-color: #333;
  }
  
  .test-content {
    background-color: #444;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }
  
  h1, h2 {
    color: #0a84ff;
  }
  
  .environment-info {
    border-top: 1px solid #555;
    color: #aaa;
  }
  
  .debug-section {
    border-top: 1px solid #555;
  }
  
  pre {
    background-color: #333;
    color: #f5f5f5;
  }
}
</style>
