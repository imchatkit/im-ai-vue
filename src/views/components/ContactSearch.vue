<script setup>
import { ref } from 'vue'

// 搜索关键词
const searchKeyword = ref('')

// 是否处于搜索状态
const isSearching = ref(false)

// 搜索结果
const searchResults = ref([])

// 定义事件
const emit = defineEmits(['search'])

// 处理搜索输入
const handleSearch = () => {
  isSearching.value = searchKeyword.value.trim().length > 0
  emit('search', searchKeyword.value)
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
  isSearching.value = false
  emit('search', '')
}
</script>

<template>
  <div class="contact-search">
    <div class="search-box">
      <i class="icon-search"></i>
      <input 
        v-model="searchKeyword"
        type="text" 
        placeholder="搜索联系人或消息" 
        class="search-input"
        @input="handleSearch"
      />
      <i 
        v-if="isSearching" 
        class="icon-clear" 
        @click="clearSearch"
      ></i>
    </div>
  </div>
</template>

<style scoped>
.contact-search {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.icon-search {
  position: absolute;
  left: 10px;
  color: #999;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: var(--primary-color);
}

.icon-clear {
  position: absolute;
  right: 10px;
  color: #999;
  cursor: pointer;
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .contact-search {
    padding: 8px;
  }
  
  .search-input {
    font-size: 13px;
    padding: 6px 10px 6px 28px;
  }
}
</style>