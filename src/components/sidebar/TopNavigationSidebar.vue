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
        <div class="nav-icon" :class="item.icon">
          <svg v-if="item.name === 'chat'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <svg v-if="item.name === 'contacts'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <svg v-if="item.name === 'groups'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <svg v-if="item.name === 'settings'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </div>
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
  background-color: var(--ios-bg-secondary);
  border-right: 0.5px solid var(--ios-border-color);
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
  color: var(--ios-text-tertiary);
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
  background-color: var(--ios-bg-tertiary);
  color: var(--ios-text-secondary);
  transform: translateY(-1px);
}

.nav-item.active {
  background-color: var(--ios-accent-color-light);
  color: var(--ios-accent-color);
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  margin-bottom: 1px;
  height: 22px;
  width: 22px;
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

.nav-item.active .nav-icon {
  transform: scale(1.05);
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
  border: 0.5px solid var(--ios-border-color);
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.user-avatar:hover {
  transform: scale(1.05);
  border-color: var(--ios-accent-color);
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
    box-shadow: 0 -0.5px 0 var(--ios-border-color);
    background-color: var(--ios-bg-secondary-translucent);
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

:root {
  --ios-bg-primary: #FFFFFF;
  --ios-bg-secondary: #F9F9F9;
  --ios-bg-tertiary: #F2F2F7;
  --ios-bg-secondary-translucent: rgba(249, 249, 249, 0.94);
  --ios-text-primary: #000000;
  --ios-text-secondary: #3C3C43;
  --ios-text-tertiary: #8E8E93;
  --ios-border-color: #E5E5EA;
  --ios-accent-color: #007AFF;
  --ios-accent-color-light: rgba(0, 122, 255, 0.1);
}

:root.dark-theme {
  --ios-bg-primary: #1C1C1E;
  --ios-bg-secondary: #2C2C2E;
  --ios-bg-tertiary: #3A3A3C;
  --ios-bg-secondary-translucent: rgba(44, 44, 46, 0.94);
  --ios-text-primary: #FFFFFF;
  --ios-text-secondary: #EBEBF5;
  --ios-text-tertiary: #8E8E93;
  --ios-border-color: #38383A;
  --ios-accent-color: #0A84FF;
  --ios-accent-color-light: rgba(10, 132, 255, 0.15);
}
</style> 