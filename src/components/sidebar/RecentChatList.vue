<template>
  <div class="recent-chat-list">
    <div v-if="data.length === 0" class="empty-state">
      <i class="empty-icon">💬</i>
      <p class="empty-text">暂无最近会话</p>
    </div>
    
    <div v-else class="chat-list">
      <div
        v-for="chat in data"
        :key="chat.id"
        class="chat-item"
        :class="{ 'active': chat.isActive }"
        @click="$emit('select-item', chat)"
      >
        <div class="avatar-container">
          <img :src="chat.avatar || getDefaultAvatar(chat)" :alt="chat.name" class="avatar" />
          <span v-if="chat.status" class="status-indicator" :class="chat.status"></span>
        </div>
        
        <div class="content">
          <div class="content-header">
            <h3 class="name" :class="{ 'has-unread': chat.unreadCount > 0 }">{{ chat.name }}</h3>
            <span class="time">{{ formatTime(chat.lastMessageTime) }}</span>
          </div>
          
          <div class="content-body">
            <p class="message-preview" :class="{ 'has-unread': chat.unreadCount > 0 }">
              <span v-if="chat.isGroup && chat.lastMessageSender" class="message-sender">
                {{ chat.lastMessageSender }}:
              </span>
              {{ chat.lastMessage }}
            </p>
            
            <div v-if="chat.unreadCount > 0" class="badge">
              {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecentChatList',
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  emits: ['select-item'],
  setup() {
    // 获取默认头像
    const getDefaultAvatar = (chat) => {
      // 根据群组或个人类型生成不同的默认头像
      if (chat.isGroup) {
        return `https://api.dicebear.com/7.x/icons/svg?seed=${chat.id}&icon=users&backgroundColor=0071e3,34c759,ff9f0a,ff3b30,5ac8fa,007aff,5856d6`;
      }
      
      // 提取姓名首字母
      const initial = chat.name ? chat.name.charAt(0).toUpperCase() : 'U';
      
      // 基于id或姓名为每个联系人生成不同的背景色
      const colors = ['0071e3', '34c759', 'ff9f0a', 'ff3b30', '5ac8fa', '007aff', '5856d6'];
      const colorIndex = chat.id ? parseInt(chat.id) % colors.length : chat.name.length % colors.length;
      const bgColor = colors[colorIndex];
      
      return `https://api.dicebear.com/7.x/initials/svg?seed=${initial}&text=${initial}&backgroundColor=${bgColor}`;
    };
    
    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      
      const now = new Date();
      const msgDate = new Date(timestamp);
      const diff = now - msgDate;
      
      // 今天内的消息显示时间
      if (diff < 24 * 60 * 60 * 1000 && now.getDate() === msgDate.getDate()) {
        return msgDate.getHours().toString().padStart(2, '0') + ':' + 
               msgDate.getMinutes().toString().padStart(2, '0');
      }
      
      // 昨天的消息显示"昨天"
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (msgDate.getDate() === yesterday.getDate() && 
          msgDate.getMonth() === yesterday.getMonth() && 
          msgDate.getFullYear() === yesterday.getFullYear()) {
        return '昨天';
      }
      
      // 一周内的消息显示星期几
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return days[msgDate.getDay()];
      }
      
      // 更早的消息显示日期
      return `${msgDate.getMonth() + 1}月${msgDate.getDate()}日`;
    };
    
    return {
      getDefaultAvatar,
      formatTime
    };
  }
};
</script>

<style scoped>
.recent-chat-list {
  height: 100%;
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
  padding: 40px 0;
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.chat-list {
  padding: 8px 0;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 8px;
  margin: 2px 8px;
  transition: all 0.2s ease;
}

.chat-item:hover {
  background-color: var(--hover-color);
}

.chat-item.active {
  background-color: var(--active-item-bg);
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
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
}

.status-indicator.online {
  background-color: var(--status-online);
}

.status-indicator.offline {
  background-color: var(--status-offline);
}

.status-indicator.busy {
  background-color: var(--status-busy);
}

.content {
  flex: 1;
  min-width: 0; /* 确保内容可以正确缩小 */
  overflow: hidden;
}

.content-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.name {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name.has-unread {
  font-weight: 600;
}

.time {
  font-size: 12px;
  color: var(--text-tertiary);
  white-space: nowrap;
  margin-left: 8px;
}

.content-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-preview {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.message-preview.has-unread {
  color: var(--text-primary);
  font-weight: 500;
}

.message-sender {
  color: var(--primary-color);
  font-weight: 500;
}

.badge {
  background-color: var(--primary-color);
  color: white;
  font-size: 12px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style> 