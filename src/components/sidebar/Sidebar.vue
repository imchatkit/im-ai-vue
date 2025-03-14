<template>
  <div class="sidebar">
    <SidebarTabs :active-tab="activeTab" @tab-change="handleTabChange" />
    <SidebarSearch 
      :placeholder="searchPlaceholder" 
      :keyword="searchKeyword"
      @search="handleSearch" 
    />

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
import SidebarTabs from './SidebarTabs.vue';
import SidebarSearch from './SidebarSearch.vue';
import RecentChatList from './RecentChatList.vue';
import ContactList from './ContactList.vue';
import GroupList from './GroupList.vue';

export default {
  name: 'Sidebar',
  components: {
    SidebarTabs,
    SidebarSearch,
    RecentChatList,
    ContactList,
    GroupList
  },
  props: {
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
  emits: ['select-contact', 'select-group', 'select-chat'],
  setup(props, { emit }) {
    const activeTab = ref('recent-chats');
    const searchKeyword = ref('');

    // 根据当前选中的Tab计算当前激活的组件
    const activeComponent = computed(() => {
      switch (activeTab.value) {
        case 'recent-chats':
          return RecentChatList;
        case 'contacts':
          return ContactList;
        case 'groups':
          return GroupList;
        default:
          return RecentChatList;
      }
    });

    // 根据当前Tab计算数据源
    const currentData = computed(() => {
      switch (activeTab.value) {
        case 'recent-chats':
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
      if (!searchKeyword.value) {
        return currentData.value;
      }
      
      const keyword = searchKeyword.value.toLowerCase();
      return currentData.value.filter(item => {
        // 根据不同类型的数据，使用不同的搜索字段
        if (activeTab.value === 'recent-chats') {
          return item.name.toLowerCase().includes(keyword) || 
                 (item.lastMessage && item.lastMessage.toLowerCase().includes(keyword));
        } else if (activeTab.value === 'contacts' || activeTab.value === 'groups') {
          return item.name.toLowerCase().includes(keyword);
        }
        return false;
      });
    });

    // 根据当前Tab计算搜索框的占位符文本
    const searchPlaceholder = computed(() => {
      switch (activeTab.value) {
        case 'recent-chats':
          return '搜索最近会话';
        case 'contacts':
          return '搜索联系人';
        case 'groups':
          return '搜索群组';
        default:
          return '搜索';
      }
    });

    // Tab切换处理函数
    const handleTabChange = (tabName) => {
      activeTab.value = tabName;
      searchKeyword.value = ''; // 切换Tab时清空搜索关键词
    };

    // 搜索处理函数
    const handleSearch = (keyword) => {
      searchKeyword.value = keyword;
    };

    // 列表项选择处理函数
    const handleSelectItem = (item) => {
      switch (activeTab.value) {
        case 'recent-chats':
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

    // 当数据变化时，可能需要重新过滤
    watch(() => [props.recentChatsData, props.contactsData, props.groupsData], () => {
      // 数据源变化时的逻辑，如果需要的话
    });

    return {
      activeTab,
      searchKeyword,
      activeComponent,
      filteredData,
      searchPlaceholder,
      handleTabChange,
      handleSearch,
      handleSelectItem
    };
  }
};
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-glass-primary);
  backdrop-filter: blur(var(--blur-sm));
  -webkit-backdrop-filter: blur(var(--blur-sm));
  border-right: 1px solid var(--border-color);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--text-quaternary) transparent;
}

.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background-color: var(--text-quaternary);
  border-radius: 4px;
}
</style> 