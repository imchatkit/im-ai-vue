<script setup>
import { ref, computed } from 'vue'
import { isElectron } from '../modules/electron-bridge'
import { isWeb, PWASupport } from '../modules/web-adapter'

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
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark-theme', darkMode.value)
  
  // 保存设置到本地存储
  localStorage.setItem('darkMode', darkMode.value ? 'true' : 'false')
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
            <input type="checkbox" v-model="darkMode" @change="toggleTheme">
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
        <p>© 2023 IM-AI Team</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.settings-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  color: var(--text-color);
}

.settings-title {
  font-size: 24px;
  margin-bottom: 24px;
  font-weight: 500;
}

.settings-section {
  margin-bottom: 32px;
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  margin-bottom: 16px;
  font-weight: 500;
  color: var(--primary-color);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  flex-direction: column;
}

.setting-desc {
  font-size: 12px;
  color: #999;
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
  background-color: var(--border-color);
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
}