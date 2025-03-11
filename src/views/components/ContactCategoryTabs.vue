<script setup>
import { ref } from 'vue'

// 分类选项
const categories = [
  { id: 'all', name: '全部' },
  { id: 'friend', name: '好友' },
  { id: 'colleague', name: '同事' },
  { id: 'group', name: '群组' }
]

// 当前选中的分类
const currentCategory = ref('all')

// 定义事件
const emit = defineEmits(['change'])

// 切换分类
const changeCategory = (categoryId) => {
  currentCategory.value = categoryId
  emit('change', categoryId)
}
</script>

<template>
  <div class="category-tabs">
    <div 
      v-for="category in categories" 
      :key="category.id"
      class="tab" 
      :class="{ active: currentCategory === category.id }"
      @click="changeCategory(category.id)"
    >
      {{ category.name }}
    </div>
  </div>
</template>

<style scoped>
.category-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-color);
  transition: all 0.3s;
  position: relative;
  background-color: transparent;
}

.tab:hover {
  color: var(--primary-color);
  background-color: rgba(0, 0, 0, 0.02);
}

.tab.active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
  font-weight: 500;
  background-color: rgba(0, 0, 0, 0.01);
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .category-tabs {
    overflow-x: auto;
    white-space: nowrap;
    justify-content: flex-start;
  }
  
  .tab {
    flex: none;
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>