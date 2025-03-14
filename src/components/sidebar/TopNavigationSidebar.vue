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
  background-color: var(--bg-glass-secondary);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  position: relative;
  z-index: 100;
  box-shadow: 1px 0 0 0 var(--border-color-light);
  transition: all 0.3s ease;
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
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  color: var(--text-secondary);
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  flex-direction: column;
  gap: 4px;
}

.nav-item:hover {
  background-color: var(--hover-color);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.nav-item.active {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.3);
}

.nav-item.active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0));
  border-radius: inherit;
  pointer-events: none;
}

.nav-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.nav-item:hover .nav-icon {
  transform: scale(1.15);
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
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
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;
  opacity: 0.95;
  transition: transform 0.2s ease;
}

.nav-item:hover .nav-label {
  transform: translateY(1px);
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
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid var(--border-color);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.user-avatar:hover {
  transform: scale(1.08);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
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
    height: 60px;
    flex-direction: row;
    padding: 0 12px;
    box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.1);
    z-index: 200;
  }

  .nav-items {
    flex-direction: row;
    justify-content: space-around;
    flex: 1;
    gap: 4px;
  }

  .nav-item {
    height: 48px;
    border-radius: 8px;
  }

  .user-avatar-container {
    margin-top: 0;
    margin-left: 8px;
    padding: 0;
  }
}
</style> 