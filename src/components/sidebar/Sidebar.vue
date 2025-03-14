<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <!-- 根据当前激活的Tab显示不同的标题 -->
      <h2 class="panel-title">{{ panelTitle }}</h2>
      <!-- 根据当前激活的Tab显示不同的操作按钮 -->
      <button v-if="showAddButton" class="icon-button">
        <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </button>
    </div>

    <!-- 根据当前激活的Tab不同，展示搜索框 -->
    <div v-if="activeTab !== 'settings'" class="sidebar-search">
      <div class="search-input-wrapper">
        <i class="search-icon">🔍</i>
        <input
          type="text"
          v-model="searchKeyword"
          :placeholder="searchPlaceholder"
          class="search-input"
          @input="handleSearch"
        />
        <button 
          v-if="searchKeyword" 
          class="clear-button"
          @click="clearSearch"
          title="清除搜索"
        >
          ✕
        </button>
      </div>
    </div>

    <div class="sidebar-content">
      <!-- 动态组件根据activeTab显示不同内容 -->
      <keep-alive>
        <component 
          :is="activeComponent" 
          :data="filteredData"
          @select-item="handleSelectItem"
        />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import RecentChatList from './RecentChatList.vue';
import ContactList from './ContactList.vue';
import GroupList from './GroupList.vue';
import Settings from '../../views/Settings.vue';

export default {
  name: 'Sidebar',
  components: {
    RecentChatList,
    ContactList,
    GroupList,
    Settings
  },
  props: {
    activeTab: {
      type: String,
      required: true,
      validator: (value) => ['chat', 'contacts', 'groups', 'settings'].includes(value)
    },
    recentChatsData: {
      type: Array,
      default: () => []
    },
    contactsData: {
      type: Array,
      default: () => []
    },
    groupsData: {
      type: Array,
      default: () => []
    }
  },
  emits: ['select-contact', 'select-group', 'select-chat', 'theme-change'],
  setup(props, { emit }) {
    const searchKeyword = ref('');

    // 根据当前选中的Tab计算当前激活的组件
    const activeComponent = computed(() => {
      switch (props.activeTab) {
        case 'chat':
          return RecentChatList;
        case 'contacts':
          return ContactList;
        case 'groups':
          return GroupList;
        case 'settings':
          return Settings;
        default:
          return RecentChatList;
      }
    });

    // 根据当前Tab显示不同的面板标题
    const panelTitle = computed(() => {
      switch (props.activeTab) {
        case 'chat':
          return '聊天';
        case 'contacts':
          return '联系人';
        case 'groups':
          return '群组';
        case 'settings':
          return '设置';
        default:
          return '聊天';
      }
    });

    // 显示添加按钮的条件
    const showAddButton = computed(() => {
      return props.activeTab !== 'settings';
    });

    // 根据当前Tab计算数据源
    const currentData = computed(() => {
      switch (props.activeTab) {
        case 'chat':
          return props.recentChatsData;
        case 'contacts':
          return props.contactsData;
        case 'groups':
          return props.groupsData;
        default:
          return [];
      }
    });

    // 根据搜索关键词过滤数据
    const filteredData = computed(() => {
      if (!searchKeyword.value || props.activeTab === 'settings') {
        return currentData.value;
      }
      
      const keyword = searchKeyword.value.toLowerCase();
      return currentData.value.filter(item => {
        // 根据不同类型的数据，使用不同的搜索字段
        if (props.activeTab === 'chat') {
          return item.name.toLowerCase().includes(keyword) || 
                 (item.lastMessage && item.lastMessage.toLowerCase().includes(keyword));
        } else if (props.activeTab === 'contacts' || props.activeTab === 'groups') {
          return item.name.toLowerCase().includes(keyword);
        }
        return false;
      });
    });

    // 根据当前Tab计算搜索框的占位符文本
    const searchPlaceholder = computed(() => {
      switch (props.activeTab) {
        case 'chat':
          return '搜索聊天';
        case 'contacts':
          return '搜索联系人';
        case 'groups':
          return '搜索群组';
        default:
          return '搜索';
      }
    });

    // 搜索处理函数
    const handleSearch = () => {
      // 可以添加搜索逻辑，如延迟搜索等
    };

    // 清除搜索关键词
    const clearSearch = () => {
      searchKeyword.value = '';
    };

    // 列表项选择处理函数
    const handleSelectItem = (item) => {
      switch (props.activeTab) {
        case 'chat':
          emit('select-chat', item);
          break;
        case 'contacts':
          emit('select-contact', item);
          break;
        case 'groups':
          emit('select-group', item);
          break;
      }
    };

    // 当activeTab变化时，清空搜索关键词
    watch(() => props.activeTab, () => {
      searchKeyword.value = '';
    });

    // 当数据变化时，可能需要重新过滤
    watch(() => [props.recentChatsData, props.contactsData, props.groupsData], () => {
      // 数据源变化时的逻辑，如果需要的话
    });

    return {
      searchKeyword,
      activeComponent,
      filteredData,
      searchPlaceholder,
      panelTitle,
      showAddButton,
      handleSearch,
      clearSearch,
      handleSelectItem
    };
  }
};
</script>

<style scoped>
.sidebar {
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--ios-bg-primary);
  border-right: 0.5px solid var(--ios-border-color);
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.sidebar-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 0.5px solid var(--ios-border-color);
  background-color: var(--ios-bg-primary-translucent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
  transition: height 0.25s cubic-bezier(0.25, 0.1, 0.25, 1), 
              padding 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.panel-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.4px;
}

.panel-title::before {
  content: "";
  display: inline-block;
  width: 3px;
  height: 16px;
  background-color: var(--ios-accent-color);
  border-radius: 1.5px;
  transition: height 0.2s cubic-bezier(0.25, 0.1, 0.25, 1), 
              width 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.icon-button {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: var(--ios-text-tertiary);
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.icon-button:hover {
  color: var(--ios-accent-color);
  background-color: var(--ios-accent-color-light);
  transform: rotate(90deg);
}

.sidebar-search {
  padding: 10px 16px;
  border-bottom: 0.5px solid var(--ios-border-color);
  transition: padding 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  background-color: var(--ios-bg-tertiary);
  border-radius: 10px;
  padding: 0 10px;
  border: 0.5px solid transparent;
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.03);
}

.search-input-wrapper:focus-within {
  background-color: var(--ios-bg-primary);
  border-color: var(--ios-border-color-strong);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-icon {
  font-size: 14px;
  color: var(--ios-text-tertiary);
  margin-right: 6px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  height: 32px;
  padding: 0;
  font-size: 15px;
  color: var(--ios-text-primary);
  outline: none;
  font-weight: 400;
}

.search-input::placeholder {
  color: var(--ios-text-tertiary);
  opacity: 0.7;
  font-weight: 400;
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background-color: var(--ios-text-quaternary);
  color: white;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
  opacity: 0.8;
}

.clear-button:hover {
  opacity: 1;
  background-color: var(--ios-text-tertiary);
  transform: scale(1.05);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--ios-text-quaternary) transparent;
  padding-bottom: 8px;
}

.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background-color: var(--ios-text-quaternary);
  border-radius: 2px;
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .sidebar {
    width: 100%;
    border-right: none;
  }
  
  .sidebar-header {
    padding: 0 18px;
  }
  
  .sidebar-search {
    padding: 10px 18px;
  }
}

:root {
  --ios-bg-primary: #FFFFFF;
  --ios-bg-primary-translucent: rgba(255, 255, 255, 0.8);
  --ios-bg-secondary: #F9F9F9;
  --ios-bg-tertiary: #F2F2F7;
  --ios-text-primary: #000000;
  --ios-text-secondary: #3C3C43;
  --ios-text-tertiary: #8E8E93;
  --ios-text-quaternary: #C7C7CC;
  --ios-border-color: #E5E5EA;
  --ios-border-color-strong: #C7C7CC;
  --ios-accent-color: #007AFF;
  --ios-accent-color-light: rgba(0, 122, 255, 0.08);
}

:root.dark-theme {
  --ios-bg-primary: #1C1C1E;
  --ios-bg-primary-translucent: rgba(28, 28, 30, 0.8);
  --ios-bg-secondary: #2C2C2E;
  --ios-bg-tertiary: #3A3A3C;
  --ios-text-primary: #FFFFFF;
  --ios-text-secondary: #EBEBF5;
  --ios-text-tertiary: #8E8E93;
  --ios-text-quaternary: #636366;
  --ios-border-color: #38383A;
  --ios-border-color-strong: #48484A;
  --ios-accent-color: #0A84FF;
  --ios-accent-color-light: rgba(10, 132, 255, 0.15);
}
</style> 