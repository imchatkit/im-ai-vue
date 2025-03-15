const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
const { setupIpcHandlers } = require('./ipc-handlers.cjs')

// 判断是否是开发环境
const isDev = process.env.NODE_ENV !== 'production'

// 保持对窗口对象的全局引用，避免JavaScript垃圾回收时窗口被关闭
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true, // 启用上下文隔离以提高安全性
      preload: path.join(__dirname, 'preload.cjs')
    },
    show: false,
    backgroundColor: '#f5f5f5',
    icon: path.join(__dirname, '../public/icon.png')
  })

  // 窗口准备好后显示，避免白屏
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 根据环境加载不同的URL
  if (isDev) {
    // 开发环境：加载Vite dev server
    mainWindow.loadURL('http://localhost:5173')
    // 打开开发者工具
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境：加载打包后的文件
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true
      })
    )
  }

  // 设置IPC处理程序
  setupIpcHandlers(mainWindow)

  // 窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})