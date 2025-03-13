<script setup>
import { ref } from 'vue'
import { isElectron } from '../../modules/electron-bridge'
import ThemeToggle from '../../components/ThemeToggle.vue'

// 用户数据
const user = ref({
  id: 'current-user-id',
  name: '当前用户',
  avatar: 'https://via.placeholder.com/48',
  status: 'online',
  statusText: '在线'
})

// 状态选项
const statusOptions = [
  { value: 'online', label: '在线', color: 'var(--success-color)' },
  { value: 'busy', label: '忙碌', color: 'var(--error-color)' },
  { value: 'away', label: '离开', color: 'var(--warning-color)' },
  { value: 'offline', label: '隐身', color: 'var(--text-quaternary)' }
]

// 是否显示状态选择器
const showStatusSelector = ref(false)

// 切换状态选择器显示
const toggleStatusSelector = () => {
  showStatusSelector.value = !showStatusSelector.value
}

// 设置用户状态
const setStatus = (status) => {
  user.value.status = status.value
  user.value.statusText = status.label
  showStatusSelector.value = false
}

// 打开设置页面
const openSettings = () => {
  // 这里应该使用路由导航到设置页面
  // router.push('/settings')
}
</script>

<template>
  <div class="user-profile glass-container">
    <div class="profile-header">
      <div class="avatar-container">
        <img :src="user.avatar" :alt="user.name" class="avatar" />
        <div class="status-indicator" 
             :style="{ backgroundColor: statusOptions.find(s => s.value === user.status)?.color }"
             @click="toggleStatusSelector">
        </div>
        
        <!-- 状态选择器 -->
        <div v-if="showStatusSelector" class="status-selector glass-container">
          <div v-for="status in statusOptions" 
               :key="status.value" 
               class="status-option"
               @click="setStatus(status)">
            <div class="status-dot" :style="{ backgroundColor: status.color }"></div>
            <span class="status-label">{{ status.label }}</span>
          </div>
        </div>
      </div>
      
      <div class="user-info">
        <h3 class="user-name">{{ user.name }}</h3>
        <p class="user-status">{{ user.statusText }}</p>
      </div>
      
      <button class="settings-btn" @click="openSettings">
        <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
      </button>
    </div>
    
    <div class="search-container">
      <svg class="search-icon" viewBox="0 0 24 24" width="14" height="14">
        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
      <input type="search" placeholder="搜索" class="search-input" />
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(250, 250, 252, var(--blur-opacity));
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.avatar-container {
  position: relative;
  margin-right: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color-light);
  box-shadow: var(--shadow-xs);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.status-indicator:hover {
  transform: scale(1.2);
}

.status-selector {
  position: absolute;
  top: 100%;
  left: 0;
  width: 120px;
  background-color: rgba(255, 255, 255, var(--blur-opacity));
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  padding: 8px 0;
  margin-top: 8px;
  z-index: 100;
}

.status-option {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  transition: var(--transition-base);
}

.status-option:hover {
  background-color: var(--hover-color);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-label {
  font-size: 13px;
  color: var(--text-primary);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 2px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
}

.settings-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: var(--transition-base);
}

.settings-btn:hover {
  background-color: var(--hover-color);
  color: var(--text-primary);
}

.search-container {
  position: relative;
  margin-top: 4px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 32px;
  border-radius: var(--radius-full);
  border: none;
  background-color: var(--bg-tertiary);
  padding: 0 12px 0 32px;
  font-size: 13px;
  color: var(--text-primary);
  transition: var(--transition-base);
}

.search-input:focus {
  background-color: var(--bg-quaternary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .user-profile {
    padding: 10px 12px;
  }
  
  .avatar {
    width: 36px;
    height: 36px;
  }
  
  .user-name {
    font-size: 13px;
  }
  
  .user-status {
    font-size: 11px;
  }
  
  .settings-btn {
    width: 28px;
    height: 28px;
  }
  
  .search-input {
    height: 30px;
    font-size: 12px;
  }
}
</style>