<script setup>
import { ref } from 'vue'
import { isElectron } from '../../modules/electron-bridge'

// 用户信息
const userInfo = ref({
  id: 'current-user-id',
  name: '当前用户',
  avatar: '/avatars/default-avatar.png',
  status: 'online',
  statusMessage: '在线'
})

// 状态选项
const statusOptions = [
  { value: 'online', label: '在线', icon: 'icon-online' },
  { value: 'away', label: '离开', icon: 'icon-away' },
  { value: 'busy', label: '忙碌', icon: 'icon-busy' },
  { value: 'offline', label: '隐身', icon: 'icon-offline' }
]

// 是否显示状态选择器
const showStatusSelector = ref(false)

// 切换状态选择器显示
const toggleStatusSelector = () => {
  showStatusSelector.value = !showStatusSelector.value
}

// 更改状态
const changeStatus = (status) => {
  userInfo.value.status = status.value
  userInfo.value.statusMessage = status.label
  showStatusSelector.value = false
  
  // 这里应该调用API更新用户状态
  // userService.updateStatus(status.value)
}

// 打开设置页面
const openSettings = () => {
  // 这里应该使用路由导航到设置页面
  // router.push('/settings')
}
</script>

<template>
  <div class="user-profile">
    <!-- 用户头像和信息 -->
    <div class="user-info">
      <div class="avatar-container">
        <img :src="userInfo.avatar" alt="Avatar" class="avatar" />
        <span class="status-indicator" :class="userInfo.status"></span>
      </div>
      
      <div class="user-details">
        <h3 class="user-name">{{ userInfo.name }}</h3>
        <div 
          class="user-status" 
          @click="toggleStatusSelector"
        >
          <i :class="`${statusOptions.find(s => s.value === userInfo.status)?.icon}`"></i>
          <span>{{ userInfo.statusMessage }}</span>
          <i class="icon-dropdown"></i>
        </div>
      </div>
    </div>
    
    <!-- 状态选择器 -->
    <div v-if="showStatusSelector" class="status-selector">
      <div 
        v-for="status in statusOptions" 
        :key="status.value"
        class="status-option"
        :class="{ active: userInfo.status === status.value }"
        @click="changeStatus(status)"
      >
        <i :class="status.icon"></i>
        <span>{{ status.label }}</span>
      </div>
    </div>
    
    <!-- 用户操作按钮 -->
    <div class="user-actions">
      <button class="action-btn settings-btn" @click="openSettings">
        <i class="icon-settings"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  position: relative;
  background-color: #ffffff;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar-container {
  position: relative;
  margin-right: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.status-indicator.online {
  background-color: #4caf50;
}

.status-indicator.away {
  background-color: #ff9800;
}

.status-indicator.busy {
  background-color: #f44336;
}

.status-indicator.offline {
  background-color: #9e9e9e;
}

.user-details {
  flex: 1;
  overflow: hidden;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.user-status i {
  margin-right: 4px;
}

.icon-dropdown {
  margin-left: 4px;
  font-size: 10px;
}

.status-selector {
  position: absolute;
  top: 70px;
  left: 16px;
  right: 16px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.status-option {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
}

.status-option:hover {
  background-color: var(--hover-color);
}

.status-option.active {
  background-color: rgba(74, 138, 244, 0.1);
}

.status-option i {
  margin-right: 8px;
}

.user-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.action-btn:hover {
  background-color: var(--hover-color);
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .user-profile {
    padding: 8px;
  }
  
  .avatar {
    width: 36px;
    height: 36px;
  }
  
  .user-name {
    font-size: 14px;
  }
  
  .user-status {
    font-size: 12px;
  }
}
</style>