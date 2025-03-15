// preload.cjs
const { contextBridge, ipcRenderer } = require('electron')

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
  platform: process.platform
})

// 通知渲染进程我们已经在Electron环境中
contextBridge.exposeInMainWorld('isElectron', true)

console.log('Electron预加载脚本已执行') 