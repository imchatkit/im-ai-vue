import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

console.log('Vue入口文件开始执行')

// 添加全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
})

// 添加未捕获的Promise错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason)
})

try {
  console.log('开始创建Vue应用')
  const app = createApp(App)
  console.log('Vue应用创建成功，准备挂载')
  app.mount('#app')
  console.log('Vue应用挂载成功')
} catch (error) {
  console.error('Vue应用创建或挂载失败:', error)
}
