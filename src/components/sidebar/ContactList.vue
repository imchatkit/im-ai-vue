<template>
  <div class="contact-list">
    <div v-if="data.length === 0" class="empty-state">
      <i class="empty-icon">👤</i>
      <p class="empty-text">暂无联系人</p>
    </div>
    
    <div v-else class="contact-groups">
      <!-- 好友分组 -->
      <div class="contact-group">
        <div 
          class="group-header" 
          @click="toggleGroup('friends')"
          :class="{ 'collapsed': collapsedGroups.includes('friends') }"
        >
          <div class="group-title">
            <i class="group-icon">👥</i>
            <h3 class="group-name">好友 ({{ friendsCount }})</h3>
          </div>
          <i class="toggle-icon">{{ collapsedGroups.includes('friends') ? '▶' : '▼' }}</i>
        </div>
        
        <div v-if="!collapsedGroups.includes('friends')" class="group-content">
          <div
            v-for="contact in friendContacts"
            :key="contact.id"
            class="contact-item"
            :class="{ 'active': contact.isActive }"
            @click="$emit('select-item', contact)"
          >
            <div class="avatar-container">
              <img :src="contact.avatar || getDefaultAvatar(contact)" :alt="contact.name" class="avatar" />
              <span class="status-indicator" :class="contact.status"></span>
            </div>
            
            <div class="content">
              <div class="content-header">
                <h3 class="name">{{ contact.name }}</h3>
              </div>
              <p v-if="contact.description" class="description">{{ contact.description }}</p>
            </div>
          </div>
          
          <div v-if="friendContacts.length === 0" class="empty-group">
            暂无好友
          </div>
        </div>
      </div>
      
      <!-- 陌生人分组 -->
      <div class="contact-group">
        <div 
          class="group-header" 
          @click="toggleGroup('strangers')"
          :class="{ 'collapsed': collapsedGroups.includes('strangers') }"
        >
          <div class="group-title">
            <i class="group-icon">👤</i>
            <h3 class="group-name">陌生人 ({{ strangersCount }})</h3>
          </div>
          <i class="toggle-icon">{{ collapsedGroups.includes('strangers') ? '▶' : '▼' }}</i>
        </div>
        
        <div v-if="!collapsedGroups.includes('strangers')" class="group-content">
          <div
            v-for="contact in strangerContacts"
            :key="contact.id"
            class="contact-item"
            :class="{ 'active': contact.isActive }"
            @click="$emit('select-item', contact)"
          >
            <div class="avatar-container">
              <img :src="contact.avatar || getDefaultAvatar(contact)" :alt="contact.name" class="avatar" />
              <span class="status-indicator" :class="contact.status"></span>
            </div>
            
            <div class="content">
              <div class="content-header">
                <h3 class="name">{{ contact.name }}</h3>
              </div>
              <p v-if="contact.description" class="description">{{ contact.description }}</p>
            </div>
          </div>
          
          <div v-if="strangerContacts.length === 0" class="empty-group">
            暂无陌生人
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'ContactList',
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  emits: ['select-item'],
  setup(props) {
    // 控制分组的折叠状态
    const collapsedGroups = ref([]);
    
    // 切换分组的折叠状态
    const toggleGroup = (groupName) => {
      if (collapsedGroups.value.includes(groupName)) {
        collapsedGroups.value = collapsedGroups.value.filter(name => name !== groupName);
      } else {
        collapsedGroups.value.push(groupName);
      }
    };
    
    // 获取默认头像
    const getDefaultAvatar = (contact) => {
      // 提取姓名首字母
      const initial = contact.name ? contact.name.charAt(0).toUpperCase() : 'U';
      
      // 基于id或姓名为每个联系人生成不同的背景色
      const colors = ['0071e3', '34c759', 'ff9f0a', 'ff3b30', '5ac8fa', '007aff', '5856d6'];
      const colorIndex = contact.id ? parseInt(contact.id) % colors.length : contact.name.length % colors.length;
      const bgColor = colors[colorIndex];
      
      return `https://api.dicebear.com/7.x/initials/svg?seed=${initial}&text=${initial}&backgroundColor=${bgColor}`;
    };
    
    // 计算好友联系人列表
    const friendContacts = computed(() => {
      return props.data.filter(contact => contact.type === 'friend');
    });
    
    // 计算陌生人联系人列表
    const strangerContacts = computed(() => {
      return props.data.filter(contact => contact.type === 'stranger');
    });
    
    // 好友数量
    const friendsCount = computed(() => friendContacts.value.length);
    
    // 陌生人数量
    const strangersCount = computed(() => strangerContacts.value.length);
    
    return {
      collapsedGroups,
      toggleGroup,
      getDefaultAvatar,
      friendContacts,
      strangerContacts,
      friendsCount,
      strangersCount
    };
  }
};
</script>

<style scoped>
.contact-list {
  height: 100%;
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--ios-text-tertiary);
  padding: 40px 0;
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 15px;
  letter-spacing: -0.2px;
}

.contact-groups {
  padding: 4px 0;
}

.contact-group {
  margin-bottom: 6px;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 16px;
  cursor: pointer;
  user-select: none;
  background-color: var(--ios-bg-secondary);
  margin: 0;
  transition: background-color 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.group-header:hover {
  background-color: var(--ios-bg-tertiary);
}

.group-title {
  display: flex;
  align-items: center;
}

.group-icon {
  margin-right: 8px;
  font-size: 15px;
}

.group-name {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  color: var(--ios-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.toggle-icon {
  font-size: 10px;
  color: var(--ios-text-tertiary);
  transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.group-header.collapsed .toggle-icon {
  transform: rotate(0deg);
}

.group-content {
  padding: 4px 0;
  animation: slideDown 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.contact-item:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 64px;
  right: 16px;
  bottom: 0;
  height: 0.5px;
  background-color: var(--ios-border-color);
}

.contact-item:hover {
  background-color: var(--ios-bg-tertiary);
}

.contact-item.active {
  background-color: var(--ios-accent-color-light);
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
  border: 0.5px solid var(--ios-border-color);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--ios-bg-primary);
}

.status-indicator.online {
  background-color: #34C759;
}

.status-indicator.offline {
  background-color: var(--ios-text-tertiary);
}

.status-indicator.busy {
  background-color: #FF9500;
}

.content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.content-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.name {
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  color: var(--ios-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.2px;
}

.description {
  margin: 0;
  font-size: 13px;
  color: var(--ios-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.1px;
}

.empty-group {
  padding: 10px 16px;
  text-align: center;
  color: var(--ios-text-tertiary);
  font-size: 13px;
  font-style: italic;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 