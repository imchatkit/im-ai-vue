<template>
  <div class="group-list">
    <div v-if="data.length === 0" class="empty-state">
      <i class="empty-icon">👥</i>
      <p class="empty-text">暂无群组</p>
    </div>
    
    <div v-else class="group-categories">
      <!-- 我创建的群组 -->
      <div class="group-category">
        <div 
          class="category-header"

          @click="toggleCategory('created')"
          :class="{ 'collapsed': collapsedCategories.includes('created') }"
        >
          <div class="category-title">
            <i class="category-icon">👑</i>
            <h3 class="category-name">我创建的群组 ({{ createdCount }})</h3>
          </div>
          <i class="toggle-icon">{{ collapsedCategories.includes('created') ? '▶' : '▼' }}</i>
        </div>
        
        <div v-if="!collapsedCategories.includes('created')" class="category-content">
          <div
            v-for="group in createdGroups"
            :key="group.id"
            class="group-item"
            :class="{ 'active': group.isActive }"
            @click="$emit('select-item', group)"
          >
            <div class="avatar-container">
              <img :src="group.avatar || getGroupAvatar(group)" :alt="group.name" class="avatar" />
              <span v-if="group.unreadCount > 0" class="badge">
                {{ group.unreadCount > 99 ? '99+' : group.unreadCount }}
              </span>
            </div>
            
            <div class="content">
              <div class="content-header">
                <h3 class="name">{{ group.name }}</h3>
                <span class="member-count">{{ group.memberCount || 0 }}人</span>
              </div>
              <p v-if="group.description" class="description">{{ group.description }}</p>
            </div>
          </div>
          
          <div v-if="createdGroups.length === 0" class="empty-category">
            暂无创建的群组
          </div>
        </div>
      </div>
      
      <!-- 我加入的群组 -->
      <div class="group-category">
        <div 
          class="category-header"
          @click="toggleCategory('joined')"
          :class="{ 'collapsed': collapsedCategories.includes('joined') }"
        >
          <div class="category-title">
            <i class="category-icon">👥</i>
            <h3 class="category-name">我加入的群组 ({{ joinedCount }})</h3>
          </div>
          <i class="toggle-icon">{{ collapsedCategories.includes('joined') ? '▶' : '▼' }}</i>
        </div>
        
        <div v-if="!collapsedCategories.includes('joined')" class="category-content">
          <div
            v-for="group in joinedGroups"
            :key="group.id"
            class="group-item"
            :class="{ 'active': group.isActive }"
            @click="$emit('select-item', group)"
          >
            <div class="avatar-container">
              <img :src="group.avatar || getGroupAvatar(group)" :alt="group.name" class="avatar" />
              <span v-if="group.unreadCount > 0" class="badge">
                {{ group.unreadCount > 99 ? '99+' : group.unreadCount }}
              </span>
            </div>
            
            <div class="content">
              <div class="content-header">
                <h3 class="name">{{ group.name }}</h3>
                <span class="member-count">{{ group.memberCount || 0 }}人</span>
              </div>
              <p v-if="group.description" class="description">{{ group.description }}</p>
            </div>
          </div>
          
          <div v-if="joinedGroups.length === 0" class="empty-category">
            暂无加入的群组
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'GroupList',
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  emits: ['select-item'],
  setup(props) {
    // 控制分类的折叠状态
    const collapsedCategories = ref([]);
    
    // 切换分类的折叠状态
    const toggleCategory = (categoryName) => {
      if (collapsedCategories.value.includes(categoryName)) {
        collapsedCategories.value = collapsedCategories.value.filter(name => name !== categoryName);
      } else {
        collapsedCategories.value.push(categoryName);
      }
    };
    
    // 获取群组头像
    const getGroupAvatar = (group) => {
      // 基于群组id或名称为每个群组生成不同的背景色
      const colors = ['0071e3', '34c759', 'ff9f0a', 'ff3b30', '5ac8fa', '007aff', '5856d6'];
      const colorIndex = group.id ? parseInt(group.id) % colors.length : group.name.length % colors.length;
      const bgColor = colors[colorIndex];
      
      return `https://api.dicebear.com/7.x/icons/svg?seed=${group.id || group.name}&icon=users&backgroundColor=${bgColor}`;
    };
    
    // 计算我创建的群组列表
    const createdGroups = computed(() => {
      return props.data.filter(group => group.isCreator === true);
    });
    
    // 计算我加入的群组列表
    const joinedGroups = computed(() => {
      return props.data.filter(group => !group.isCreator);
    });
    
    // 创建的群组数量
    const createdCount = computed(() => createdGroups.value.length);
    
    // 加入的群组数量
    const joinedCount = computed(() => joinedGroups.value.length);
    
    return {
      collapsedCategories,
      toggleCategory,
      getGroupAvatar,
      createdGroups,
      joinedGroups,
      createdCount,
      joinedCount
    };
  }
};
</script>

<style scoped>
.group-list {
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

.group-categories {
  padding: 4px 0;
}

.group-category {
  margin-bottom: 6px;
}

.category-header {
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

.category-header:hover {
  background-color: var(--ios-bg-tertiary);
}

.category-title {
  display: flex;
  align-items: center;
}

.category-icon {
  margin-right: 8px;
  font-size: 15px;
}

.category-name {
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

.category-header.collapsed .toggle-icon {
  transform: rotate(0deg);
}

.category-content {
  padding: 4px 0;
  animation: slideDown 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.group-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.group-item:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 64px;
  right: 16px;
  bottom: 0;
  height: 0.5px;
  background-color: var(--ios-border-color);
}

.group-item:hover {
  background-color: var(--ios-bg-tertiary);
}

.group-item.active {
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

.badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background-color: var(--ios-accent-color);
  color: white;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-weight: 500;
  border: 1.5px solid var(--ios-bg-primary);
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
  align-items: center;
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

.member-count {
  font-size: 12px;
  color: var(--ios-text-tertiary);
  white-space: nowrap;
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

.empty-category {
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