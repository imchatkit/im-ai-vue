<script setup>
import { computed } from 'vue'
import { isElectron } from '../../modules/electron-bridge'
import { WindowManager } from '../../modules/electron-bridge'

// 定义组件属性
const props = defineProps({
  currentContact: {
    type: Object,
    default: () => null
  }
})

// 定义事件
const emit = defineEmits(['back', 'info', 'more'])

// 计算联系人状态文本
const statusText = computed(() => {
  if (!props.currentContact) return ''
  
  if (props.currentContact.status === 'online') {
    return '在线'
  } else if (props.currentContact.status === 'offline') {
    return '离线'
  } else if (props.currentContact.status === 'away') {
    return '离开'
  } else if (props.currentContact.status === 'busy') {
    return '忙碌'
  } else if (props.currentContact.status === 'group') {
    return `${props.currentContact.members || 0}人`
  }
  
  return ''
})

// 返回上一页（移动端）
const goBack = () => {
  emit('back')
}

// 查看联系人信息
const viewContactInfo = () => {
  emit('info', props.currentContact)
}

// 打开更多选项
const openMoreOptions = () => {
  emit('more')
}

// 在新窗口打开聊天（仅Electron环境）
const openInNewWindow = () => {
  if (isElectron() && props.currentContact) {
    WindowManager.createNewWindow(`/chat/${props.currentContact.id}`, {
      width: 800,
      height: 600,
      title: `聊天 - ${props.currentContact.name}`
    })
  }
}
</script>

<template>
  <div class="chat-header">
    <!-- 返回按钮（移动端显示） -->
    <button class="back-btn mobile-only" @click="goBack">
      <i class="icon-back"></i>
    </button>
    
    <!-- 联系人信息 -->
    <div v-if="currentContact" class="contact-info" @click="viewContactInfo">
      <div class="avatar-container">
        <img :src="currentContact.avatar" alt="Avatar" class="avatar" />
        <span 
          v-if="currentContact.status !== 'group'" 
          class="status-indicator" 
          :class="currentContact.status"
        ></span>
      </div>
      
      <div class="contact-details">
        <h3 class="contact-name">{{ currentContact.name }}</h3>
        <p class="contact-status">{{ statusText }}</p>
      </div>
    </div>
    
    <div v-else class="no-contact">
      <p>请选择一个联系人开始聊天</p>
    </div>
    
    <!-- 操作按钮 -->
    <div v-if="currentContact" class="actions">
      <!-- Electron环境下显示新窗口按钮 -->
      <button 
        v-if="isElectron()" 
        class="action-btn new-window-btn" 
        @click="openInNewWindow"
        title="在新窗口打开"
      >
        <i class="icon-new-window"></i>
      </button>
      
      <button class="action-btn more-btn" @click="openMoreOptions">
        <i class="icon-more"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.back-btn {
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  margin-right: 8px;
  cursor: pointer;
  color: var(--text-color);
}

.contact-info {
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
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
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--bg-color);
}

.status-indicator.online {
  background-color: #4caf50;
}

.status-indicator.offline {
  background-color: #9e9e9e;
}

.status-indicator.away {
  background-color: #ff9800;
}

.status-indicator.busy {
  background-color: #f44336;
}

.contact-details {
  display: flex;
  flex-direction: column;
}

.contact-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.contact-status {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.no-contact {
  flex: 1;
  text-align: center;
  color: #999;
}

.actions {
  display: flex;
}

.action-btn {
  background: none;
  border: none;
  font-size: 18px;
  margin-left: 8px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: var(--hover-color);
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .back-btn.mobile-only {
    display: block;
  }
  
  .avatar {
    width: 36px;
    height: 36px;
  }
  
  .contact-name {
    font-size: 15px;
  }
  
  .contact-status {
    font-size: 12px;
  }
}
</style>