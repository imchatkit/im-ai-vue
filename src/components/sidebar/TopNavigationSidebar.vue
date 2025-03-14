<template>
  <div class="top-navigation-sidebar">
    <div class="nav-items">
      <button 
        v-for="item in navItems" 
        :key="item.name"
        :class="['nav-item', { 'active': activeTab === item.name }]"
        @click="$emit('tab-change', item.name)"
        :title="item.label"
      >
        <i class="nav-icon" :class="item.icon"></i>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </div>
    
    <div class="user-avatar-container">
      <div class="user-avatar" :title="currentUser.name" @click="$emit('avatar-click')">
        <img :src="currentUser.avatar" :alt="currentUser.name" class="avatar-img" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopNavigationSidebar',
  props: {
    activeTab: {
      type: String,
      required: true,
      validator: (value) => ['chat', 'contacts', 'groups', 'settings'].includes(value)
    },
    currentUser: {
      type: Object,
      required: true,
      default: () => ({
        name: '用户',
        avatar: ''
      })
    }
  },
  emits: ['tab-change', 'avatar-click'],
  setup() {
    const navItems = [
      {
        name: 'chat',
        label: '聊天',
        icon: 'icon-chat'
      },
      {
        name: 'contacts',
        label: '联系人',
        icon: 'icon-contacts'
      },
      {
        name: 'groups',
        label: '群组',
        icon: 'icon-groups'
      },
      {
        name: 'settings',
        label: '设置',
        icon: 'icon-settings'
      }
    ];

    return {
      navItems
    };
  }
};
</script>

<style scoped>
.top-navigation-sidebar {
  width: 68px;
  height: 100%;
  background-color: #F9F9F9;
  border-right: 0.5px solid #E5E5EA;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  position: relative;
  z-index: 100;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 0 8px;
}

.nav-item {
  width: 100%;
  height: 52px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  color: #8E8E93;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
  position: relative;
  overflow: hidden;
  flex-direction: column;
  gap: 4px;
}

.nav-item:hover {
  background-color: #F2F2F7;
  color: #3C3C43;
  transform: translateY(-1px);
}

.nav-item.active {
  background-color: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.nav-item.active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0));
  border-radius: inherit;
  pointer-events: none;
}

.nav-icon {
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  margin-bottom: 1px;
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

.nav-item.active .nav-icon {
  transform: scale(1.05);
}

.icon-chat::before {
  content: "💬";
}

.icon-contacts::before {
  content: "👤";
}

.icon-groups::before {
  content: "👥";
}

.icon-settings::before {
  content: "⚙️";
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: -0.2px;
  margin-top: 1px;
  opacity: 0.9;
  transition: transform 0.2s ease;
}

.nav-item:hover .nav-label {
  opacity: 1;
}

.user-avatar-container {
  margin-top: auto;
  padding: 12px 0;
  width: 100%;
  display: flex;
  justify-content: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 0.5px solid #E5E5EA;
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.user-avatar:hover {
  transform: scale(1.05);
  border-color: #007AFF;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .top-navigation-sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    top: auto;
    width: 100%;
    height: 54px;
    flex-direction: row;
    padding: 0 12px;
    box-shadow: 0 -0.5px 0 #E5E5EA;
    background-color: rgba(249, 249, 249, 0.94);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 200;
  }

  .nav-items {
    flex-direction: row;
    justify-content: space-around;
    flex: 1;
    gap: 4px;
  }

  .nav-item {
    height: 44px;
    border-radius: 8px;
  }

  .user-avatar-container {
    margin-top: 0;
    margin-left: 8px;
    padding: 0;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
  }
}
</style> 