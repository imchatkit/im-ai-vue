/**
 * Electron桥接模块
 * 负责处理Electron特有的功能，实现跨平台兼容
 */

// 检测当前运行环境
export const isElectron = () => {
  return window && window.process && window.process.type
}

/**
 * 系统托盘管理
 */
export class TrayManager {
  constructor() {
    this.tray = null
    this.contextMenu = null
    
    // 只在Electron环境下初始化
    if (isElectron()) {
      this.initialize()
    }
  }
  
  initialize() {
    // 这里需要使用Electron的remote模块
    // 注意：在实际应用中，应该通过preload脚本和contextBridge来实现
    if (window.require) {
      const { Tray, Menu, app } = window.require('@electron/remote')
      const path = window.require('path')
      
      const iconPath = path.join(__dirname, '../assets/tray-icon.png')
      this.tray = new Tray(iconPath)
      this.tray.setToolTip('IM-AI 即时通讯')
      
      this.contextMenu = Menu.buildFromTemplate([
        { label: '显示主窗口', click: this.showMainWindow },
        { type: 'separator' },
        { label: '退出', click: () => app.quit() }
      ])
      
      this.tray.setContextMenu(this.contextMenu)
      
      // 点击托盘图标显示主窗口
      this.tray.on('click', this.showMainWindow)
    }
  }
  
  showMainWindow() {
    if (window.require) {
      const { BrowserWindow } = window.require('@electron/remote')
      const mainWindow = BrowserWindow.getAllWindows()[0]
      
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.show()
        mainWindow.focus()
      }
    }
  }
  
  // 显示通知消息
  showNotification(title, body, onClick) {
    if (this.tray) {
      // 在Windows上闪烁任务栏
      if (process.platform === 'win32') {
        const { BrowserWindow } = window.require('@electron/remote')
        const mainWindow = BrowserWindow.getAllWindows()[0]
        if (mainWindow && !mainWindow.isFocused()) {
          mainWindow.flashFrame(true)
        }
      }
      
      // 创建原生通知
      const { Notification } = window.require('@electron/remote')
      const notification = new Notification({
        title,
        body,
        icon: this.tray.icon
      })
      
      if (onClick) {
        notification.on('click', onClick)
      }
      
      notification.show()
    }
  }
}

/**
 * 文件系统访问
 */
export class FileSystemAccess {
  // 打开文件选择对话框
  static async openFileDialog(options = {}) {
    if (!isElectron()) {
      throw new Error('此功能仅在Electron环境下可用')
    }
    
    const { dialog } = window.require('@electron/remote')
    const result = await dialog.showOpenDialog(options)
    return result.filePaths
  }
  
  // 保存文件对话框
  static async saveFileDialog(options = {}) {
    if (!isElectron()) {
      throw new Error('此功能仅在Electron环境下可用')
    }
    
    const { dialog } = window.require('@electron/remote')
    const result = await dialog.showSaveDialog(options)
    return result.filePath
  }
  
  // 读取文件内容
  static async readFile(filePath) {
    if (!isElectron()) {
      throw new Error('此功能仅在Electron环境下可用')
    }
    
    const fs = window.require('fs').promises
    return await fs.readFile(filePath, 'utf8')
  }
  
  // 写入文件内容
  static async writeFile(filePath, content) {
    if (!isElectron()) {
      throw new Error('此功能仅在Electron环境下可用')
    }
    
    const fs = window.require('fs').promises
    await fs.writeFile(filePath, content, 'utf8')
  }
}

/**
 * 窗口管理
 */
export class WindowManager {
  // 最小化到托盘
  static minimizeToTray() {
    if (isElectron()) {
      const { BrowserWindow } = window.require('@electron/remote')
      const mainWindow = BrowserWindow.getAllWindows()[0]
      
      if (mainWindow) {
        mainWindow.hide()
      }
    }
  }
  
  // 创建新窗口
  static createNewWindow(url, options = {}) {
    if (!isElectron()) {
      // 在Web环境下，打开新标签页
      window.open(url, '_blank')
      return null
    }
    
    const { BrowserWindow } = window.require('@electron/remote')
    const newWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      ...options
    })
    
    newWindow.loadURL(url)
    return newWindow
  }
  
  // 屏幕共享 - 获取可用源
  static async getDesktopCapturerSources() {
    if (!isElectron()) {
      throw new Error('此功能仅在Electron环境下可用')
    }
    
    const { desktopCapturer } = window.require('electron')
    return await desktopCapturer.getSources({ types: ['window', 'screen'] })
  }
}