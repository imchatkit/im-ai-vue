/**
 * Web适配器模块
 * 负责处理Web环境下的特殊功能，实现跨平台兼容
 */

// 检测当前运行环境
export const isWeb = () => {
  return !(window && window.process && window.process.type)
}

/**
 * 通知管理
 */
export class NotificationManager {
  constructor() {
    this.hasPermission = false
    
    // 只在Web环境下初始化
    if (isWeb() && 'Notification' in window) {
      this.checkPermission()
    }
  }
  
  // 检查通知权限
  async checkPermission() {
    if (!('Notification' in window)) {
      return false
    }
    
    if (Notification.permission === 'granted') {
      this.hasPermission = true
      return true
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      this.hasPermission = permission === 'granted'
      return this.hasPermission
    }
    
    return false
  }
  
  // 显示通知
  showNotification(title, options = {}, onClick) {
    if (!this.hasPermission) {
      this.checkPermission().then(granted => {
        if (granted) {
          this._createNotification(title, options, onClick)
        }
      })
    } else {
      this._createNotification(title, options, onClick)
    }
  }
  
  // 创建通知
  _createNotification(title, options, onClick) {
    if (!('Notification' in window)) {
      return null
    }
    
    const notification = new Notification(title, options)
    
    if (onClick && typeof onClick === 'function') {
      notification.onclick = onClick
    }
    
    return notification
  }
}

/**
 * 文件系统访问 (使用Web File API)
 */
export class FileSystemAccess {
  // 打开文件选择对话框
  static async openFileDialog(options = {}) {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      
      // 设置接受的文件类型
      if (options.filters && options.filters.length > 0) {
        const acceptTypes = []
        options.filters.forEach(filter => {
          if (filter.extensions) {
            filter.extensions.forEach(ext => {
              acceptTypes.push(`.${ext}`)
            })
          }
        })
        
        if (acceptTypes.length > 0) {
          input.accept = acceptTypes.join(',')
        }
      }
      
      // 设置是否多选
      if (options.properties && options.properties.includes('multiSelections')) {
        input.multiple = true
      }
      
      input.onchange = (event) => {
        const files = Array.from(event.target.files || [])
        resolve(files)
      }
      
      // 触发文件选择对话框
      input.click()
    })
  }
  
  // 保存文件 (使用Blob和URL.createObjectURL)
  static saveFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    
    document.body.appendChild(a)
    a.click()
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }
  
  // 读取文件内容
  static async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        resolve(event.target.result)
      }
      
      reader.onerror = (error) => {
        reject(error)
      }
      
      reader.readAsText(file)
    })
  }
}

/**
 * PWA支持
 */
export class PWASupport {
  constructor() {
    this.deferredPrompt = null
    this.isInstalled = false
    
    // 监听beforeinstallprompt事件
    window.addEventListener('beforeinstallprompt', (e) => {
      // 阻止Chrome 67及更早版本自动显示安装提示
      e.preventDefault()
      // 存储事件以便稍后触发
      this.deferredPrompt = e
    })
    
    // 监听应用安装状态
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true
      this.deferredPrompt = null
    })
  }
  
  // 检查是否可以安装PWA
  canInstall() {
    return !!this.deferredPrompt
  }
  
  // 提示用户安装PWA
  async promptInstall() {
    if (!this.deferredPrompt) {
      return false
    }
    
    // 显示安装提示
    this.deferredPrompt.prompt()
    
    // 等待用户响应
    const choiceResult = await this.deferredPrompt.userChoice
    
    // 重置延迟提示变量
    this.deferredPrompt = null
    
    return choiceResult.outcome === 'accepted'
  }
}

/**
 * 响应式布局辅助
 */
export class ResponsiveHelper {
  constructor() {
    this.breakpoints = {
      xs: 0,    // 超小屏幕 手机 (<576px)
      sm: 576,  // 小屏幕 平板 (≥576px)
      md: 768,  // 中等屏幕 桌面显示器 (≥768px)
      lg: 992,  // 大屏幕 大桌面显示器 (≥992px)
      xl: 1200  // 超大屏幕 大桌面显示器 (≥1200px)
    }
    
    this.currentBreakpoint = this.getCurrentBreakpoint()
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.currentBreakpoint = this.getCurrentBreakpoint()
    })
  }
  
  // 获取当前断点
  getCurrentBreakpoint() {
    const width = window.innerWidth
    
    if (width < this.breakpoints.sm) return 'xs'
    if (width < this.breakpoints.md) return 'sm'
    if (width < this.breakpoints.lg) return 'md'
    if (width < this.breakpoints.xl) return 'lg'
    return 'xl'
  }
  
  // 检查是否为移动设备
  isMobile() {
    return this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm'
  }
  
  // 检查是否为桌面设备
  isDesktop() {
    return this.currentBreakpoint === 'md' || 
           this.currentBreakpoint === 'lg' || 
           this.currentBreakpoint === 'xl'
  }
  
  // 获取设备方向
  getOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  }
}