const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')

// 判断是否是开发环境
const isDev = process.env.NODE_ENV !== 'production'
console.log('当前环境:', isDev ? '开发环境' : '生产环境')

// 保持对窗口对象的全局引用，避免JavaScript垃圾回收时窗口被关闭
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, // 启用上下文隔离以提高安全性
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: false // 禁用web安全性，允许加载本地文件
    },
    show: false,
    backgroundColor: '#f5f5f5',
    icon: path.join(__dirname, '../public/icon.ico')
  })

  // 窗口准备好后显示，避免白屏
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 根据环境加载不同的URL
  if (isDev) {
    // 开发环境：加载Vite dev server
    console.log('加载开发服务器URL: http://localhost:5173')
    mainWindow.loadURL('http://localhost:5173')
  } else {
    // 生产环境：加载Vue应用
    try {
      // 尝试从资源目录加载
      const resourcesPath = process.resourcesPath;
      console.log('资源目录路径:', resourcesPath);
      
      // 尝试加载index.html
      const indexPath = path.join(resourcesPath, 'dist', 'index.html');
      console.log('尝试加载index.html文件:', indexPath);
      console.log('文件是否存在:', fs.existsSync(indexPath));
      
      if (fs.existsSync(indexPath)) {
        const fileUrl = url.format({
          pathname: indexPath,
          protocol: 'file:',
          slashes: true
        });
        console.log('加载URL:', fileUrl);
        mainWindow.loadURL(fileUrl);
      } else {
        // 尝试从应用目录加载
        const appPath = app.getAppPath();
        console.log('应用目录路径:', appPath);
        
        const appIndexPath = path.join(appPath, 'dist', 'index.html');
        console.log('尝试从应用目录加载index.html文件:', appIndexPath);
        console.log('文件是否存在:', fs.existsSync(appIndexPath));
        
        if (fs.existsSync(appIndexPath)) {
          const fileUrl = url.format({
            pathname: appIndexPath,
            protocol: 'file:',
            slashes: true
          });
          console.log('加载URL:', fileUrl);
          mainWindow.loadURL(fileUrl);
        } else {
          console.error('找不到index.html文件');
          // 显示错误页面
          mainWindow.loadURL(`data:text/html;charset=utf-8,
            <html>
              <head>
                <meta charset="UTF-8">
                <title>加载错误</title>
                <style>
                  body { font-family: sans-serif; padding: 2rem; text-align: center; }
                  h1 { color: #e74c3c; }
                  pre { background: #f8f9fa; padding: 1rem; border-radius: 4px; text-align: left; overflow: auto; }
                </style>
              </head>
              <body>
                <h1>无法加载应用</h1>
                <p>找不到index.html文件。请确保应用正确安装。</p>
                <pre>尝试加载: 
                - ${indexPath}
                - ${appIndexPath}
                </pre>
                <p>资源路径: ${resourcesPath}</p>
                <p>应用路径: ${appPath}</p>
                <p>当前目录: ${__dirname}</p>
              </body>
            </html>
          `);
        }
      }
    } catch (error) {
      console.error('加载文件时出错:', error);
      // 显示错误信息
      mainWindow.loadURL(`data:text/html;charset=utf-8,
        <html>
          <head>
            <meta charset="UTF-8">
            <title>错误</title>
            <style>
              body { font-family: sans-serif; padding: 2rem; text-align: center; }
              h1 { color: #e74c3c; }
              pre { background: #f8f9fa; padding: 1rem; border-radius: 4px; text-align: left; overflow: auto; }
            </style>
          </head>
          <body>
            <h1>加载应用时出错</h1>
            <pre>${error.toString()}\n\n${error.stack}</pre>
          </body>
        </html>
      `);
    }
  }

  // 打开开发者工具
  mainWindow.webContents.openDevTools()

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