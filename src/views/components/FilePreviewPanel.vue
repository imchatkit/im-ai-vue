<script setup>
import { ref } from 'vue'

// 当前预览的文件
const currentFile = ref(null)

// 最近文件列表
const recentFiles = ref([
  {
    id: '1',
    name: '项目方案.docx',
    type: 'document',
    size: '2.5 MB',
    sender: '张三',
    timestamp: Date.now() - 1000 * 60 * 60 * 2 // 2小时前
  },
  {
    id: '2',
    name: '会议记录.pdf',
    type: 'pdf',
    size: '1.2 MB',
    sender: '李四',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 // 1天前
  },
  {
    id: '3',
    name: '产品设计图.png',
    type: 'image',
    size: '3.7 MB',
    sender: '王五',
    timestamp: Date.now() - 1000 * 60 * 60 * 48 // 2天前
  }
])

// 预览文件
const previewFile = (file) => {
  currentFile.value = file
}

// 下载文件
const downloadFile = (file) => {
  // 这里应该调用下载服务
  console.log('下载文件:', file.name)
}

// 关闭预览
const closePreview = () => {
  currentFile.value = null
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString()
}

// 获取文件图标
const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'document':
      return 'icon-document'
    case 'pdf':
      return 'icon-pdf'
    case 'image':
      return 'icon-image'
    case 'video':
      return 'icon-video'
    case 'audio':
      return 'icon-audio'
    default:
      return 'icon-file'
  }
}
</script>

<template>
  <div class="file-preview-panel">
    <h3 class="panel-title">文件预览</h3>
    
    <!-- 文件预览区域 -->
    <div v-if="currentFile" class="preview-area">
      <div class="preview-header">
        <h4 class="file-name">{{ currentFile.name }}</h4>
        <button class="close-btn" @click="closePreview">
          <i class="icon-close"></i>
        </button>
      </div>
      
      <div class="preview-content">
        <!-- 根据文件类型显示不同的预览 -->
        <div v-if="currentFile.type === 'image'" class="image-preview">
          <img src="/vite.svg" alt="Image Preview" />
        </div>
        
        <div v-else-if="currentFile.type === 'pdf'" class="pdf-preview">
          <div class="pdf-placeholder">
            <i class="icon-pdf"></i>
            <span>PDF 预览</span>
          </div>
        </div>
        
        <div v-else class="generic-preview">
          <i :class="getFileIcon(currentFile.type)"></i>
          <span>{{ currentFile.name }}</span>
        </div>
      </div>
      
      <div class="preview-footer">
        <div class="file-info">
          <span>{{ currentFile.size }}</span>
          <span>{{ formatTime(currentFile.timestamp) }}</span>
        </div>
        
        <button class="download-btn" @click="downloadFile(currentFile)">
          <i class="icon-download"></i>
          <span>下载</span>
        </button>
      </div>
    </div>
    
    <!-- 最近文件列表 -->
    <div v-else class="recent-files">
      <div 
        v-for="file in recentFiles" 
        :key="file.id"
        class="file-item"
        @click="previewFile(file)"
      >
        <div class="file-icon">
          <i :class="getFileIcon(file.type)"></i>
        </div>
        
        <div class="file-details">
          <div class="file-name-row">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ file.size }}</span>
          </div>
          
          <div class="file-meta">
            <span class="file-sender">{{ file.sender }}</span>
            <span class="file-time">{{ formatTime(file.timestamp) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="recentFiles.length === 0" class="empty-state">
        <i class="icon-file-empty"></i>
        <p>没有最近文件</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-preview-panel {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 300px;
}

.panel-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
}

.preview-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.file-name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #999;
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: #f9f9f9;
  overflow: auto;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.pdf-preview,
.generic-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
}

.pdf-placeholder,
.generic-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pdf-placeholder i,
.generic-preview i {
  font-size: 48px;
  margin-bottom: 8px;
  color: #999;
}

.preview-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.file-info {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #666;
}

.download-btn {
  display: flex;
  align-items: center;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}

.download-btn i {
  margin-right: 4px;
}

.recent-files {
  flex: 1;
  overflow-y: auto;
}

.file-item {
  display: flex;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 4px;
}

.file-item:hover {
  background-color: var(--hover-color);
}

.file-icon {
  margin-right: 12px;
  font-size: 24px;
  color: #666;
}

.file-details {
  flex: 1;
  overflow: hidden;
}

.file-name-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.file-size {
  font-size: 12px;
  color: #666;
}

.file-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  padding: 20px;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 8px;
}

/* 响应式适配 */
@media screen and (max-width: 1200px) {
  .file-preview-panel {
    height: 250px;
  }
}
</style>