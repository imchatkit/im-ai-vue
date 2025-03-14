<script setup>
import { ref, computed, onMounted } from 'vue'
import { isElectron } from '../modules/electron-bridge'
import { isWeb, PWASupport } from '../modules/web-adapter'

// 定义emit
const emit = defineEmits(['theme-change'])

// 主题设置
const darkMode = ref(false)

// 通知设置
const notificationSettings = ref({
  messageNotification: true,
  soundEnabled: true,
  desktopNotification: true
})

// 隐私设置
const privacySettings = ref({
  showOnlineStatus: true,
  readReceipt: true,
  typingIndicator: true
})

// 存储设置
const storageSettings = ref({
  autoDownload: true,
  mediaQuality: 'high',
  clearCacheOnExit: false
})

// 语言设置
const languageOptions = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
  { value: 'ja-JP', label: '日本語' }
]
const currentLanguage = ref('zh-CN')

// 是否为Electron环境
const isElectronEnv = computed(() => isElectron())

// 是否为Web环境
const isWebEnv = computed(() => isWeb())

// PWA支持
const pwaSupport = ref(null)
if (isWebEnv.value) {
  pwaSupport.value = new PWASupport()
}

// 切换主题
const toggleTheme = () => {
  // 记录当前状态
  console.log('Settings toggleTheme called, before toggle darkMode:', darkMode.value);
  
  // 切换深色模式状态
  darkMode.value = !darkMode.value;
  
  // 记录切换后的状态
  console.log('After toggle, darkMode is now:', darkMode.value);
  
  // 应用主题到DOM
  const themeValue = darkMode.value ? 'dark' : 'light';
  
  // 移除所有主题相关的类
  document.documentElement.classList.remove('dark-theme', 'light-theme');
  
  // 添加当前主题类
  document.documentElement.classList.add(`${themeValue}-theme`);
  
  // 保存设置到本地存储
  localStorage.setItem('theme-preference', themeValue);
  console.log('Saved theme to localStorage:', themeValue);
  
  // 通知父组件主题变化
  console.log('Emitting theme-change event with value:', themeValue);
  emit('theme-change', themeValue);
}

// 切换语言
const changeLanguage = (lang) => {
  currentLanguage.value = lang
  // 这里应该调用国际化模块切换语言
  // i18n.global.locale = lang
  
  // 保存设置到本地存储
  localStorage.setItem('language', lang)
}

// 安装PWA应用
const installPWA = async () => {
  if (pwaSupport.value && pwaSupport.value.canInstall()) {
    const installed = await pwaSupport.value.promptInstall()
    console.log('PWA安装结果:', installed ? '成功' : '用户取消')
  }
}

// 清除缓存
const clearCache = () => {
  // 清除本地缓存
  localStorage.clear()
  sessionStorage.clear()
  
  // 清除IndexedDB数据
  // ...
  
  alert('缓存已清除')
}

// 退出登录
const logout = () => {
  // 清除用户会话
  // ...
  
  // 跳转到登录页
  // router.push('/login')
}

// 初始化函数
const initSettings = () => {
  console.log('Settings组件初始化');
  
  // 从本地存储加载主题偏好
  const savedTheme = localStorage.getItem('theme-preference');
  console.log('从存储加载主题:', savedTheme);
  
  // 设置darkMode状态
  darkMode.value = savedTheme === 'dark';
  console.log('初始化darkMode状态:', darkMode.value);
  
  // 不在这里修改DOM，避免与MainLayout中的逻辑冲突
  // 主题的DOM更新由MainLayout统一管理
}

// 组件挂载时初始化设置
onMounted(() => {
  initSettings()
})
</script>

<template>
  <div class="settings-page">
    <h1 class="settings-title">设置</h1>
    
    <!-- 主题设置 -->
    <section class="settings-section">
      <h2 class="section-title">外观</h2>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>深色模式</span>
          <span class="setting-desc">切换应用的明暗主题</span>
        </div>
        <div class="setting-control">
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              :checked="darkMode" 
              @change="toggleTheme"
            >
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>语言</span>
          <span class="setting-desc">选择应用界面语言</span>
        </div>
        <div class="setting-control">
          <select v-model="currentLanguage" @change="changeLanguage(currentLanguage)">
            <option v-for="option in languageOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </section>
    
    <!-- 通知设置 -->
    <section class="settings-section">
      <h2 class="section-title">通知</h2>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>消息通知</span>
          <span class="setting-desc">接收新消息时显示通知</span>
        </div>
        <div class="setting-control">
          <label class="toggle-switch">
            <input type="checkbox" v-model="notificationSettings.messageNotification">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>声音提醒</span>
          <span class="setting-desc">接收新消息时播放提示音</span>
        </div>
        <div class="setting-control">
          <label class="toggle-switch">
            <input type="checkbox" v-model="notificationSettings.soundEnabled">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>桌面通知</span>
          <span class="setting-desc">在系统桌面显示通知</span>
        </div>
        <div class="setting-control">
          <label class="toggle-switch">
            <input type="checkbox" v-model="notificationSettings.desktopNotification">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </section>
    
    <!-- 隐私设置 -->
    <section class="settings-section">
      <h2 class="section-title">隐私</h2>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>显示在线状态</span>
          <span class="setting-desc">允许其他用户查看你的在线状态</span>
        </div>
        <div class="setting-control">
          <label class="toggle-switch">
            <input type="checkbox" v-model="privacySettings.showOnlineStatus">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>已读回执</span>
          <span class="setting-desc">允许发送者知道你已读取他们的消息</span>
        </div>
        <div class="setting-control">
          <label class="toggle-switch">
            <input type="checkbox" v-model="privacySettings.readReceipt">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>输入指示器</span>
          <span class="setting-desc">在你输入消息时通知对方</span>
        </div>
        <div class="setting-control">
          <label class="toggle-switch">
            <input type="checkbox" v-model="privacySettings.typingIndicator">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </section>
    
    <!-- 存储设置 -->
    <section class="settings-section">
      <h2 class="section-title">存储</h2>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>自动下载媒体</span>
          <span class="setting-desc">自动下载接收到的图片和文件</span>
        </div>
        <div class="setting-control">
          <label class="toggle-switch">
            <input type="checkbox" v-model="storageSettings.autoDownload">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>媒体质量</span>
          <span class="setting-desc">设置图片和视频的质量</span>
        </div>
        <div class="setting-control">
          <select v-model="storageSettings.mediaQuality">
            <option value="low">低质量</option>
            <option value="medium">中等质量</option>
            <option value="high">高质量</option>
          </select>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>退出时清除缓存</span>
          <span class="setting-desc">应用关闭时自动清除临时文件</span>
        </div>
        <div class="setting-control">
          <label class="toggle-switch">
            <input type="checkbox" v-model="storageSettings.clearCacheOnExit">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div class="setting-item">
        <button class="action-button" @click="clearCache">清除缓存</button>
      </div>
    </section>
    
    <!-- 平台特定设置 -->
    <section v-if="isWebEnv && pwaSupport && pwaSupport.canInstall()" class="settings-section">
      <h2 class="section-title">Web应用</h2>
      
      <div class="setting-item">
        <button class="action-button" @click="installPWA">安装为桌面应用</button>
      </div>
    </section>
    
    <section v-if="isElectronEnv" class="settings-section">
      <h2 class="section-title">桌面应用</h2>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>开机自启动</span>
          <span class="setting-desc">系统启动时自动运行应用</span>
        </div>
        <div class="setting-control">
          <label class="toggle-switch">
            <input type="checkbox">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>最小化到托盘</span>
          <span class="setting-desc">关闭窗口时最小化到系统托盘</span>
        </div>
        <div class="setting-control">
          <label class="toggle-switch">
            <input type="checkbox">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </section>
    
    <!-- 账户操作 -->
    <section class="settings-section">
      <h2 class="section-title">账户</h2>
      
      <div class="setting-item">
        <button class="action-button logout-button" @click="logout">退出登录</button>
      </div>
    </section>
    
    <!-- 关于信息 -->
    <section class="settings-section">
      <h2 class="section-title">关于</h2>
      
      <div class="about-info">
        <p>IM-AI 即时通讯</p>
        <p>版本: 1.0.0</p>
        <p>© 2025 IM-AI Team </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.settings-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  color: var(--ios-text-primary);
  background-color: var(--ios-bg-primary);
  height: 100%;
  overflow-y: auto;
}

.settings-title {
  font-size: 24px;
  margin-bottom: 24px;
  font-weight: 500;
  color: var(--ios-text-primary);
}

.settings-section {
  margin-bottom: 32px;
  background-color: var(--ios-bg-secondary);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 0.5px solid var(--ios-border-color);
}

.section-title {
  font-size: 18px;
  margin-bottom: 16px;
  font-weight: 500;
  color: var(--ios-accent-color);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 0.5px solid var(--ios-border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  flex-direction: column;
  color: var(--ios-text-primary);
}

.setting-desc {
  font-size: 12px;
  color: var(--ios-text-tertiary);
  margin-top: 4px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--ios-bg-tertiary);
  border-radius: 24px;
  transition: all .4s ease;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: all .4s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

input:checked + .toggle-slider {
  background-color: var(--ios-accent-color);
}

input:checked + .toggle-slider:before {
  transform: translateX(18px);
}

.action-button {
  width: 100%;
  padding: 10px;
  background-color: var(--ios-accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.action-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.logout-button {
  background-color: #FF3B30;
}

.logout-button:hover {
  background-color: #FF3B30;
  opacity: 0.9;
}

.about-info {
  padding: 10px 0;
  text-align: center;
  color: var(--ios-text-secondary);
}

select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 0.5px solid var(--ios-border-color);
  background-color: var(--ios-bg-primary);
  color: var(--ios-text-primary);
  font-size: 14px;
  outline: none;
  min-width: 120px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 30px;
}

select:focus {
  border-color: var(--ios-accent-color);
  box-shadow: 0 0 0 2px var(--ios-accent-color-light);
}

/* 滚动条样式 */
.settings-page::-webkit-scrollbar {
  width: 6px;
}

.settings-page::-webkit-scrollbar-track {
  background: transparent;
}

.settings-page::-webkit-scrollbar-thumb {
  background-color: var(--ios-text-quaternary);
  border-radius: 3px;
}

@media (max-width: 768px) {
  .settings-page {
    padding: 16px;
  }
  
  .settings-section {
    padding: 12px;
  }
}
</style>