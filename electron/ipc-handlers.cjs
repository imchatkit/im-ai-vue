// ipc-handlers.cjs
const { ipcMain, dialog } = require('electron')
const fs = require('fs')
const path = require('path')

// 设置IPC处理程序
function setupIpcHandlers(mainWindow) {
  // 处理来自渲染进程的通用消息
  ipcMain.on('toMain', (event, data) => {
    console.log('从渲染进程收到消息:', data)
    // 发送回复
    mainWindow.webContents.send('fromMain', { reply: '消息已收到' })
  })

  // 处理文件保存请求
  ipcMain.on('saveFile', async (event, { content, defaultPath, filters }) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: defaultPath || 'untitled.txt',
        filters: filters || [
          { name: '文本文件', extensions: ['txt'] },
          { name: '所有文件', extensions: ['*'] }
        ],
        properties: ['createDirectory']
      })

      if (!canceled && filePath) {
        fs.writeFileSync(filePath, content, 'utf-8')
        mainWindow.webContents.send('fromMain', { 
          success: true, 
          message: '文件保存成功',
          path: filePath
        })
      }
    } catch (error) {
      console.error('保存文件时出错:', error)
      mainWindow.webContents.send('error', { 
        message: '保存文件失败', 
        error: error.message 
      })
    }
  })

  // 处理文件打开请求
  ipcMain.on('openFile', async (event, { filters }) => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        filters: filters || [
          { name: '文本文件', extensions: ['txt'] },
          { name: '所有文件', extensions: ['*'] }
        ],
        properties: ['openFile']
      })

      if (!canceled && filePaths.length > 0) {
        const content = fs.readFileSync(filePaths[0], 'utf-8')
        mainWindow.webContents.send('fileData', { 
          path: filePaths[0],
          content,
          name: path.basename(filePaths[0])
        })
      }
    } catch (error) {
      console.error('打开文件时出错:', error)
      mainWindow.webContents.send('error', { 
        message: '打开文件失败', 
        error: error.message 
      })
    }
  })
}

module.exports = { setupIpcHandlers } 