<script setup>
import { computed } from 'vue'
import { isElectron } from '../../modules/electron-bridge'
import { WindowManager } from '../../modules/electron-bridge'

// 生成默认头像的函数
const getDefaultAvatar = (name = '', id = '', isGroup = false) => {
  // 如果是群组，使用特殊的图标样式
  if (isGroup) {
    return `https://api.dicebear.com/7.x/icons/svg?seed=${id || name}&icon=users&backgroundColor=0071e3`
  }
  
  // 如果没有名称，返回一个随机头像
  if (!name) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${id || 'contact'}`
  
  // 提取姓名首字母
  const initial = name.charAt(0).toUpperCase()
  
  // 根据ID或名称选择背景色
  const colors = ['0071e3', '34c759', 'ff9f0a', 'ff3b30', '5ac8fa', '007aff', '5856d6']
  const colorIndex = id ? parseInt(id.replace(/\D/g, '')) % colors.length || 0 : name.length % colors.length
  const bgColor = colors[colorIndex]
  
  // 使用DiceBear API生成头像
  return `https://api.dicebear.com/7.x/initials/svg?seed=${initial}&text=${initial}&backgroundColor=${bgColor}`
}

// 定义组件属性
const props = defineProps({
  currentContact: {
    type: Object,
    default: () => null
  }
})

// 定义事件
const emit = defineEmits(['back', 'info', 'more', 'toggle-sidebar'])

// 计算联系人头像
const contactAvatar = computed(() => {
  if (!props.currentContact) return '';
  
  // 如果联系人有自定义头像，优先使用
  if (props.currentContact.avatar) return props.currentContact.avatar;
  
  // 否则生成默认头像
  const isGroup = props.currentContact.status === 'group';
  return getDefaultAvatar(props.currentContact.name, props.currentContact.id, isGroup);
})

// 计算联系人状态文本
const statusText = computed(() => {
  if (!props.currentContact) return ''
  
  switch (props.currentContact.status) {
    case 'online':
      return '在线'
    case 'offline':
      return '离线'
    case 'busy':
      return '忙碌'
    case 'group':
      return `${props.currentContact.members || 0}人`
    default:
      return ''
  }
})

// 返回上一页（移动端）
const goBack = () => {
  emit('toggle-sidebar')
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
  <div class="chat-header glass-container" v-if="currentContact">
    <button class="back-btn" @click="goBack">
      <svg class="icon" viewBox="0 0 24 24" width="18" height="18">
        <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
      </svg>
    </button>
    
    <div class="contact-info" @click="viewContactInfo">
      <div class="avatar-wrapper">
        <img :src="contactAvatar" :alt="currentContact.name" class="avatar" />
        <span class="status-indicator" :class="currentContact.status"></span>
      </div>
      <div class="contact-details">
        <h2 class="contact-name">{{ currentContact.name }}</h2>
        <p class="contact-status">{{ statusText }}</p>
      </div>
    </div>
    
    <div class="header-actions">
      <button class="icon-button">
        <svg class="icon" viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2c0-4.97-4.03-9-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"/>
        </svg>
      </button>
      <button class="icon-button">
        <svg class="icon" viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>
        </svg>
      </button>
      <button class="icon-button" @click="openMoreOptions">
        <svg class="icon" viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-glass-primary);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  z-index: 10;
  position: relative;
}

.back-btn {
  display: none;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 0;
  margin-right: 8px;
  cursor: pointer;
  transition: var(--transition-base);
}

.back-btn:hover {
  background-color: var(--hover-color);
  color: var(--text-primary);
  transform: translateZ(0);
}

.back-btn:active {
  transform: scale(0.95);
}

.contact-info {
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
}

.contact-info:hover {
  background-color: var(--hover-color);
}

.contact-info:active {
  background-color: var(--active-color);
  transform: scale(0.99);
}

.avatar-wrapper {
  position: relative;
  margin-right: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color-light);
  box-shadow: var(--shadow-xs);
  transition: transform 0.3s var(--easing-standard);
}

.contact-info:hover .avatar {
  transform: scale(1.05);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
  transition: transform 0.2s var(--easing-standard);
}

.contact-info:hover .status-indicator {
  transform: scale(1.1);
}

.status-indicator.online {
  background-color: var(--success-color);
}

.status-indicator.offline {
  background-color: var(--text-quaternary);
}

.status-indicator.busy {
  background-color: var(--error-color);
}

.status-indicator.group {
  background-color: var(--primary-color);
}

.contact-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.contact-name {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s var(--easing-standard);
}

.contact-info:hover .contact-name {
  color: var(--primary-color);
}

.contact-status {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
  transition: opacity 0.2s var(--easing-standard);
}

.contact-info:hover .contact-status {
  opacity: 0.8;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-button {
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
  transition: all 0.2s var(--easing-standard);
  position: relative;
  overflow: hidden;
}

.icon-button:hover {
  background-color: var(--hover-color);
  color: var(--text-primary);
  transform: translateZ(0);
}

.icon-button:active {
  transform: scale(0.95);
}

.icon-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background-color: var(--hover-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: width 0.5s ease, height 0.5s ease, opacity 0.5s ease;
}

.icon-button:hover::before {
  width: 120%;
  height: 120%;
  opacity: 0.1;
}

.icon {
  width: 18px;
  height: 18px;
  transition: transform 0.2s var(--easing-standard);
  position: relative;
  z-index: 1;
}

.icon-button:hover .icon {
  transform: scale(1.1);
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .back-btn {
    display: flex;
  }
  
  .chat-header {
    height: 50px;
    padding: 0 12px;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
  }
  
  .contact-name {
    font-size: 14px;
  }
  
  .contact-status {
    font-size: 11px;
  }
  
  .icon-button {
    width: 28px;
    height: 28px;
  }
  
  .icon {
    width: 16px;
    height: 16px;
  }
}
</style>