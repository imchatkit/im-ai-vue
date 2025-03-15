// preload.cjs
const { contextBridge, ipcRenderer } = require('electron')

console.log('预加载脚本开始执行')

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 发送消息到主进程
  send: (channel, data) => {
    // 白名单通道
    const validChannels = ['toMain', 'saveFile', 'openFile']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  // 从主进程接收消息
  receive: (channel, func) => {
    // 白名单通道
    const validChannels = ['fromMain', 'fileData', 'error']
    if (validChannels.includes(channel)) {
      // 删除旧的监听器，避免重复
      ipcRenderer.removeAllListeners(channel)
      // 添加新的监听器
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  },
  // 获取平台信息
  platform: process.platform,
  // 获取版本信息
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
})

// 通知渲染进程我们已经在Electron环境中
contextBridge.exposeInMainWorld('isElectron', true)

// 添加一个全局变量，用于调试
contextBridge.exposeInMainWorld('electronDebug', {
  isPreloadExecuted: true,
  timestamp: new Date().toISOString()
})

console.log('Electron预加载脚本已执行')

// 监听DOM加载完成事件
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM内容已加载')
  
  // 注入一些调试信息到页面
  const debugInfo = document.createElement('div')
  debugInfo.style.position = 'fixed'
  debugInfo.style.bottom = '10px'
  debugInfo.style.left = '10px'
  debugInfo.style.backgroundColor = 'rgba(0,0,0,0.7)'
  debugInfo.style.color = 'white'
  debugInfo.style.padding = '5px'
  debugInfo.style.borderRadius = '5px'
  debugInfo.style.fontSize = '12px'
  debugInfo.style.zIndex = '9999'
  debugInfo.textContent = `Electron ${process.versions.electron} | Node ${process.versions.node}`
  
  // 延迟添加，确保body已存在
  setTimeout(() => {
    if (document.body) {
      document.body.appendChild(debugInfo)
    }
  }, 1000)
}) 