<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { isElectron } from '../../modules/electron-bridge'

// 系统状态信息
const systemStatus = ref({
  online: true,
  connectionType: 'wifi',
  signalStrength: 'strong',
  batteryLevel: 100,
  syncStatus: 'synced',
  lastSyncTime: Date.now()
})

// 是否为Electron环境
const isElectronEnv = isElectron()

// 检查是否支持电池API
const hasBatterySupport = ref(false)

// 更新连接状态
const updateConnectionStatus = () => {
  systemStatus.value.online = navigator.onLine
  
  // 获取连接类型（仅在支持的浏览器中）
  if ('connection' in navigator) {
    const connection = navigator.connection
    systemStatus.value.connectionType = connection.type || 'unknown'
    systemStatus.value.signalStrength = connection.downlink > 5 ? 'strong' : 
                                       connection.downlink > 2 ? 'medium' : 'weak'
  }
}

// 更新电池状态（仅在支持的浏览器中）
const updateBatteryStatus = async () => {
  try {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      hasBatterySupport.value = true
      const battery = await navigator.getBattery()
      systemStatus.value.batteryLevel = Math.floor(battery.level * 100)
      
      // 监听电池状态变化
      battery.addEventListener('levelchange', () => {
        systemStatus.value.batteryLevel = Math.floor(battery.level * 100)
      })
    } else if (isElectronEnv) {
      hasBatterySupport.value = true
      // 在Electron环境中获取电池信息
      // 实际项目中应该从electron-bridge模块导入相关功能
    }
  } catch (error) {
    console.error('获取电池信息失败:', error)
    hasBatterySupport.value = false
  }
}

// 模拟同步状态更新
const updateSyncStatus = () => {
  // 这里应该是实际的同步状态检查
  systemStatus.value.syncStatus = 'synced'
  systemStatus.value.lastSyncTime = Date.now()
}

// 格式化同步时间
const formatSyncTime = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  
  // 一分钟内
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  // 一小时内
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }
  
  // 显示时间
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 监听网络状态变化
onMounted(() => {
  window.addEventListener('online', updateConnectionStatus)
  window.addEventListener('offline', updateConnectionStatus)
  
  // 初始化状态
  updateConnectionStatus()
  updateBatteryStatus()
  updateSyncStatus()
  
  // 定期更新同步状态
  const syncInterval = setInterval(updateSyncStatus, 60000) // 每分钟更新一次
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(syncInterval)
    window.removeEventListener('online', updateConnectionStatus)
    window.removeEventListener('offline', updateConnectionStatus)
  })
})
</script>

<template>
  <div class="system-status-bar">
    <!-- 连接状态 -->
    <div class="status-item connection-status">
      <i :class="systemStatus.online ? 'icon-online' : 'icon-offline'"></i>
      <span>{{ systemStatus.online ? '已连接' : '离线' }}</span>
    </div>
    
    <!-- 同步状态 -->
    <div class="status-item sync-status">
      <i :class="`icon-${systemStatus.syncStatus}`"></i>
      <span>{{ systemStatus.syncStatus === 'syncing' ? '同步中' : 
                systemStatus.syncStatus === 'synced' ? `同步于 ${formatSyncTime(systemStatus.lastSyncTime)}` : 
                '同步失败' }}</span>
    </div>
    
    <!-- 电池状态（仅在支持的环境中显示） -->
    <div v-if="hasBatterySupport" class="status-item battery-status">
      <i :class="`icon-battery-${systemStatus.batteryLevel > 80 ? 'full' : 
                          systemStatus.batteryLevel > 50 ? 'high' : 
                          systemStatus.batteryLevel > 20 ? 'medium' : 'low'}`"></i>
      <span>{{ systemStatus.batteryLevel }}%</span>
    </div>
  </div>
</template>

<style scoped>
.system-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: #666;
}

.status-item {
  display: flex;
  align-items: center;
}

.status-item i {
  margin-right: 4px;
  font-size: 14px;
}

.connection-status i.icon-online {
  color: #4caf50;
}

.connection-status i.icon-offline {
  color: #f44336;
}

.sync-status i.icon-synced {
  color: #4a8af4;
}

.sync-status i.icon-syncing {
  color: #ff9800;
  animation: spin 1s linear infinite;
}

.sync-status i.icon-sync-failed {
  color: #f44336;
}

.battery-status i.icon-battery-full,
.battery-status i.icon-battery-high {
  color: #4caf50;
}

.battery-status i.icon-battery-medium {
  color: #ff9800;
}

.battery-status i.icon-battery-low {
  color: #f44336;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式适配 */
@media screen and (max-width: 1200px) {
  .system-status-bar {
    padding: 6px 12px;
    font-size: 11px;
  }
  
  .status-item i {
    font-size: 12px;
  }
}
</style>