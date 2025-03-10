<script setup>
import { ref, computed } from 'vue'
import { isElectron } from '../../modules/electron-bridge'

// 工具列表
const tools = ref([
  { id: 'screen-share', name: '屏幕共享', icon: 'icon-screen-share', electronOnly: true },
  { id: 'whiteboard', name: '协作白板', icon: 'icon-whiteboard', electronOnly: false },
  { id: 'translate', name: '消息翻译', icon: 'icon-translate', electronOnly: false },
  { id: 'file-transfer', name: '文件传输', icon: 'icon-file-transfer', electronOnly: false },
  { id: 'code-snippet', name: '代码片段', icon: 'icon-code', electronOnly: false }
])

// 过滤工具列表，根据当前环境
const filteredTools = computed(() => {
  if (isElectron()) {
    return tools.value
  } else {
    return tools.value.filter(tool => !tool.electronOnly)
  }
})

// 选择工具
const selectTool = (toolId) => {
  // 这里应该触发相应的工具功能
  console.log('选择工具:', toolId)
  emit('select', toolId)
}

// 定义事件
const emit = defineEmits(['select'])
</script>

<template>
  <div class="chat-tools-panel">
    <h3 class="panel-title">聊天工具</h3>
    
    <div class="tools-list">
      <div 
        v-for="tool in filteredTools" 
        :key="tool.id"
        class="tool-item"
        @click="selectTool(tool.id)"
      >
        <i :class="tool.icon"></i>
        <span class="tool-name">{{ tool.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-tools-panel {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.panel-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
}

.tools-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tool-item:hover {
  background-color: var(--hover-color);
}

.tool-item i {
  font-size: 24px;
  margin-bottom: 4px;
  color: var(--primary-color);
}

.tool-name {
  font-size: 12px;
  color: var(--text-color);
}

/* 响应式适配 */
@media screen and (max-width: 1200px) {
  .tools-list {
    grid-template-columns: 1fr;
  }
  
  .tool-item {
    flex-direction: row;
    padding: 8px;
  }
  
  .tool-item i {
    margin-bottom: 0;
    margin-right: 8px;
  }
}
</style>