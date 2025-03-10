/**
 * 即时通讯核心模块
 * 负责处理消息的发送、接收、存储等核心功能
 */

// 消息类型枚举
export const MessageType = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  VOICE: 'voice'
}

// 消息状态枚举
export const MessageStatus = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
}

/**
 * 消息对象构造函数
 */
export class Message {
  constructor({
    id,
    type = MessageType.TEXT,
    content,
    senderId,
    receiverId,
    timestamp = Date.now(),
    status = MessageStatus.SENDING
  }) {
    this.id = id || generateUUID()
    this.type = type
    this.content = content
    this.senderId = senderId
    this.receiverId = receiverId
    this.timestamp = timestamp
    this.status = status
    this.isRevoked = false
    this.revokeTimeout = 120000 // 2分钟内可撤回
  }

  // 撤回消息方法
  revoke() {
    const currentTime = Date.now()
    if (currentTime - this.timestamp <= this.revokeTimeout) {
      this.isRevoked = true
      return true
    }
    return false
  }
}

/**
 * 会话管理类
 */
export class ConversationManager {
  constructor() {
    this.conversations = new Map()
  }

  // 获取或创建会话
  getOrCreateConversation(contactId) {
    if (!this.conversations.has(contactId)) {
      this.conversations.set(contactId, {
        contactId,
        messages: [],
        unreadCount: 0,
        lastMessage: null
      })
    }
    return this.conversations.get(contactId)
  }

  // 添加消息到会话
  addMessage(contactId, message) {
    const conversation = this.getOrCreateConversation(contactId)
    conversation.messages.push(message)
    conversation.lastMessage = message
    
    // 如果是接收的消息，增加未读数
    if (message.receiverId === getCurrentUserId()) {
      conversation.unreadCount++
    }
    
    return conversation
  }

  // 标记会话已读
  markAsRead(contactId) {
    const conversation = this.getOrCreateConversation(contactId)
    conversation.unreadCount = 0
    return conversation
  }

  // 搜索会话消息
  searchMessages(contactId, keyword) {
    const conversation = this.getOrCreateConversation(contactId)
    return conversation.messages.filter(msg => 
      msg.type === MessageType.TEXT && 
      msg.content.toLowerCase().includes(keyword.toLowerCase())
    )
  }
}

/**
 * 消息发送服务
 */
export class MessageService {
  constructor(apiClient) {
    this.apiClient = apiClient
    this.conversationManager = new ConversationManager()
  }

  // 发送消息
  async sendMessage(message) {
    try {
      // 先添加到本地会话
      this.conversationManager.addMessage(message.receiverId, message)
      
      // 发送到服务器
      const response = await this.apiClient.sendMessage(message)
      
      // 更新消息状态
      message.status = MessageStatus.SENT
      
      return message
    } catch (error) {
      message.status = MessageStatus.FAILED
      throw error
    }
  }

  // 接收消息
  receiveMessage(message) {
    // 添加到本地会话
    this.conversationManager.addMessage(message.senderId, message)
    
    // 更新消息状态
    message.status = MessageStatus.DELIVERED
    
    // 发送已送达回执
    this.apiClient.sendDeliveryReceipt(message.id)
    
    return message
  }

  // 标记消息已读
  markMessageAsRead(messageId, senderId) {
    // 标记会话已读
    this.conversationManager.markAsRead(senderId)
    
    // 发送已读回执
    this.apiClient.sendReadReceipt(messageId)
  }
}

// 工具函数 - 生成UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 工具函数 - 获取当前用户ID (占位函数)
function getCurrentUserId() {
  // 实际实现中应从用户状态或存储中获取
  return 'current-user-id'
}