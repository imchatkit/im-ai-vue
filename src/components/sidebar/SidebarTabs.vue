<template>
  <div class="sidebar-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.name"
      :class="['tab-button', { active: activeTab === tab.name }]"
      @click="$emit('tab-change', tab.name)"
    >
      <i class="tab-icon" :class="tab.icon"></i>
      <span class="tab-text">{{ tab.label }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'SidebarTabs',
  props: {
    activeTab: {
      type: String,
      required: true
    }
  },
  emits: ['tab-change'],
  setup() {
    const tabs = [
      {
        name: 'recent-chats',
        label: '最近会话',
        icon: 'icon-message'
      },
      {
        name: 'contacts',
        label: '联系人',
        icon: 'icon-user'
      },
      {
        name: 'groups',
        label: '群组',
        icon: 'icon-users'
      }
    ];

    return {
      tabs
    };
  }
};
</script>

<style scoped>
.sidebar-tabs {
  display: flex;
  width: 100%;
  background-color: var(--bg-glass-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 0;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  gap: 6px;
}

.tab-button:hover {
  color: var(--text-primary);
  background-color: var(--hover-color);
}

.tab-button.active {
  color: var(--primary-color);
  font-weight: 600;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
  animation: tabActivate 0.2s ease;
}

/* 图标样式 */
.tab-icon {
  font-size: 16px;
}

.icon-message::before {
  content: '💬';
}

.icon-user::before {
  content: '👤';
}

.icon-users::before {
  content: '👥';
}

@keyframes tabActivate {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
</style> 