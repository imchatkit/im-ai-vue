<template>
  <div class="sidebar-search">
    <div class="search-input-wrapper">
      <i class="search-icon">🔍</i>
      <input
        type="text"
        :value="keyword"
        :placeholder="placeholder"
        class="search-input"
        @input="$emit('search', $event.target.value)"
      />
      <button 
        v-if="keyword" 
        class="clear-button"
        @click="$emit('search', '')"
        title="清除搜索"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarSearch',
  props: {
    placeholder: {
      type: String,
      default: '搜索'
    },
    keyword: {
      type: String,
      default: ''
    }
  },
  emits: ['search']
};
</script>

<style scoped>
.sidebar-search {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  background-color: var(--bg-input);
  border-radius: 8px;
  padding: 0 8px;
  border: 1px solid var(--border-color-light);
  transition: all 0.2s ease;
}

.search-input-wrapper:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.search-icon {
  font-size: 14px;
  color: var(--text-tertiary);
  margin-right: 6px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  height: 32px;
  padding: 0;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background-color: var(--text-quaternary);
  color: white;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.clear-button:hover {
  opacity: 1;
  background-color: var(--text-tertiary);
}
</style> 