import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { Chat, Message } from '../../services'
import { apiService, storageService, openRouterService } from '../../services'
import type { RootState } from '../index'

interface ChatState {
  chats: Chat[]
  currentChat: Chat | null
  isLoading: boolean
  isTyping: boolean
  error: string | null
  lastSyncTime: string | null
  unreadMessages: { [chat_id: number]: number }
  draftMessages: { [chat_id: number]: string }
  messageQueue: Array<{
    chat_id: number
    content: string
    image?: string
    retryCount: number
  }>
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  isLoading: false,
  isTyping: false,
  error: null,
  lastSyncTime: null,
  unreadMessages: {},
  draftMessages: {},
  messageQueue: []
}

// Helper function to ensure chat has messages array
const ensureChatMessages = (chat: Chat): Chat => ({
  ...chat,
  messages: chat.messages || []
})

// Async thunks
export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async () => {
    const response = await apiService.getChats()
    return response.map(ensureChatMessages)
  }
)

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (chat: Omit<Chat, 'id' | 'messages'>) => {
    const response = await apiService.createChat(chat)
    const newChat = ensureChatMessages(response)
    
    // Connect to chat room
    // if (!socketService.isConnected()) {
    //   await socketService.connect()
    // }
    // await socketService.joinChat(newChat.id)
    
    return newChat
  }
)

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chat_id, content, image }: { chat_id: number; content: string; image?: string }, { getState }) => {
    const state = getState() as RootState
    const chat = state.chat.chats.find(c => c.id === chat_id)
    if (!chat) {
      throw new Error('Chat not found')
    }

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      chat_id,
      role: 'user',
      content,
      image,
      timestamp: new Date().toISOString()
    }

    // Ensure socket connection
    // if (!socketService.isConnected()) {
    //   await socketService.connect()
    //   await socketService.joinChat(chat_id)
    // }

    // Send message through socket
    await apiService.sendMessage(chat_id, content, image)

    // Update local storage with user message
    const currentChats = await storageService.getChats()
    const updatedChats = currentChats.map(c => {
      if (c.id === chat_id) {
        return {
          ...c,
          messages: [...(c.messages || []), userMessage],
          last_message: content,
          last_message_time: userMessage.timestamp
        }
      }
      return c
    })
    await storageService.saveChats(updatedChats)

    return { userMessage }
  }
)

export const regenerateMessage = createAsyncThunk(
  'chat/regenerateMessage',
  async ({ chat_id, messageId }: { chat_id: number; messageId: string }, { getState }) => {
    const state = getState() as RootState
    const chat = state.chat.chats.find(c => c.id === chat_id)
    if (!chat) {
      throw new Error('Chat not found')
    }

    const messages = chat.messages || []
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) {
      throw new Error('Message not found')
    }

    const userMessage = messages[messageIndex - 1]
    if (!userMessage || userMessage.role !== 'user') {
      throw new Error('No user message found to regenerate from')
    }

    // Get new response from OpenRouter
    const aiResponse = await openRouterService.sendMessage(userMessage.content, chat)

    // Create new message
    const newMessage: Message = {
      id: Date.now().toString(),
      chat_id,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    }

    // Update local storage
    const currentChats = await storageService.getChats()
    const updatedChats = currentChats.map(c => {
      if (c.id === chat_id) {
        const chatMessages = c.messages || []
        const filteredMessages = chatMessages.filter(m => m.id !== messageId)
        return {
          ...c,
          messages: [...filteredMessages, newMessage],
          last_message: newMessage.content,
          last_message_time: newMessage.timestamp
        }
      }
      return c
    })
    await storageService.saveChats(updatedChats)

    return { oldMessageId: messageId, newMessage }
  }
)

export const deleteChat = createAsyncThunk(
  'chat/deleteChat',
  async (chat_id: number) => {
    await apiService.deleteChat(chat_id)
    
    // Update local storage
    const currentChats = await storageService.getChats()
    const updatedChats = currentChats.filter(c => c.id !== chat_id)
    await storageService.saveChats(updatedChats)

    return chat_id
  }
)

export const syncChats = createAsyncThunk(
  'chat/syncChats',
  async (_, { getState }) => {
    const state = getState() as RootState
    const serverChats = await apiService.getChats()
    
    // Merge local and server chats
    const mergedChats = serverChats.map(serverChat => {
      const localChat = state.chat.chats.find(c => c.id === serverChat.id)
      if (localChat) {
        const localMessages = localChat.messages || []
        const serverMessages = serverChat.messages || []
        return {
          ...serverChat,
          messages: [...localMessages, ...serverMessages].filter((message, index, self) =>
            index === self.findIndex(m => m.id === message.id)
          )
        }
      }
      return ensureChatMessages(serverChat)
    })

    // Update local storage
    await storageService.saveChats(mergedChats)

    return mergedChats
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload.map(ensureChatMessages)
      state.lastSyncTime = new Date().toISOString()
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      state.chats.push(ensureChatMessages(action.payload))
    },
    updateChat: (state, action: PayloadAction<Chat>) => {
      const index = state.chats.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.chats[index] = ensureChatMessages(action.payload)
      }
    },
    removeChat: (state, action: PayloadAction<number>) => {
      state.chats = state.chats.filter(c => c.id !== action.payload)
      if (state.currentChat?.id === action.payload) {
        state.currentChat = null
      }
      delete state.unreadMessages[action.payload]
      delete state.draftMessages[action.payload]
    },
    setCurrentChat: (state, action: PayloadAction<Chat | null>) => {
      state.currentChat = action.payload ? ensureChatMessages(action.payload) : null
      if (action.payload) {
        state.unreadMessages[action.payload.id] = 0
      }
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      if (state.currentChat && state.currentChat.id === action.payload.chat_id) {
        if (!state.currentChat.messages) {
          state.currentChat.messages = []
        }
        state.currentChat.messages.push(action.payload)
        state.currentChat.last_message = action.payload.content
        state.currentChat.last_message_time = action.payload.timestamp
      }
      const chatIndex = state.chats.findIndex(c => c.id === action.payload.chat_id)
      if (chatIndex !== -1) {
        if (!state.chats[chatIndex].messages) {
          state.chats[chatIndex].messages = []
        }
        state.chats[chatIndex].messages.push(action.payload)
        state.chats[chatIndex].last_message = action.payload.content
        state.chats[chatIndex].last_message_time = action.payload.timestamp

        // Increment unread count if not current chat
        if (state.currentChat?.id !== action.payload.chat_id && action.payload.role === 'assistant') {
          state.unreadMessages[action.payload.chat_id] = (state.unreadMessages[action.payload.chat_id] || 0) + 1
        }
      }
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      if (state.currentChat) {
        if (!state.currentChat.messages) {
          state.currentChat.messages = []
        }
        const messageIndex = state.currentChat.messages.findIndex(m => m.id === action.payload.id)
        if (messageIndex !== -1) {
          state.currentChat.messages[messageIndex] = action.payload
        }
      }
    },
    removeMessage: (state, action: PayloadAction<string>) => {
      if (state.currentChat) {
        if (!state.currentChat.messages) {
          state.currentChat.messages = []
          return
        }
        state.currentChat.messages = state.currentChat.messages.filter(m => m.id !== action.payload)
      }
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload
    },
    setDraftMessage: (state, action: PayloadAction<{ chat_id: number; content: string }>) => {
      state.draftMessages[action.payload.chat_id] = action.payload.content
    },
    clearDraftMessage: (state, action: PayloadAction<number>) => {
      delete state.draftMessages[action.payload]
    },
    addToMessageQueue: (state, action: PayloadAction<{ chat_id: number; content: string; image?: string }>) => {
      state.messageQueue.push({ ...action.payload, retryCount: 0 })
    },
    removeFromMessageQueue: (state, action: PayloadAction<number>) => {
      state.messageQueue = state.messageQueue.filter((_, index) => index !== action.payload)
    },
    incrementRetryCount: (state, action: PayloadAction<number>) => {
      if (state.messageQueue[action.payload]) {
        state.messageQueue[action.payload].retryCount++
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch chats
      .addCase(fetchChats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.isLoading = false
        state.chats = action.payload
        state.lastSyncTime = new Date().toISOString()
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch chats'
      })
      
      // Create chat
      .addCase(createChat.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.isLoading = false
        state.chats.push(action.payload)
        state.currentChat = action.payload
      })
      .addCase(createChat.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to create chat'
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isTyping = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isTyping = false
        if (state.currentChat) {
          if (!state.currentChat.messages) {
            state.currentChat.messages = []
          }
          state.currentChat.messages.push(action.payload.userMessage)
          state.currentChat.last_message = action.payload.userMessage.content
          state.currentChat.last_message_time = action.payload.userMessage.timestamp
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isTyping = false
        state.error = action.error.message || 'Failed to send message'
      })
      
      // Regenerate message
      .addCase(regenerateMessage.pending, (state) => {
        state.isTyping = true
        state.error = null
      })
      .addCase(regenerateMessage.fulfilled, (state, action) => {
        state.isTyping = false
        if (state.currentChat) {
          if (!state.currentChat.messages) {
            state.currentChat.messages = []
          }
          state.currentChat.messages = state.currentChat.messages.filter(m => m.id !== action.payload.oldMessageId)
          state.currentChat.messages.push(action.payload.newMessage)
          state.currentChat.last_message = action.payload.newMessage.content
          state.currentChat.last_message_time = action.payload.newMessage.timestamp
        }
      })
      .addCase(regenerateMessage.rejected, (state, action) => {
        state.isTyping = false
        state.error = action.error.message || 'Failed to regenerate message'
      })
      
      // Delete chat
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.chats = state.chats.filter(c => c.id !== action.payload)
        if (state.currentChat?.id === action.payload) {
          state.currentChat = null
        }
        delete state.unreadMessages[action.payload]
        delete state.draftMessages[action.payload]
      })
      
      // Sync chats
      .addCase(syncChats.fulfilled, (state, action) => {
        state.chats = action.payload
        state.lastSyncTime = new Date().toISOString()
      })
  }
})

// Selectors
export const selectChats = (state: RootState) => state.chat.chats
export const selectCurrentChat = (state: RootState) => state.chat.currentChat
export const selectIsLoading = (state: RootState) => state.chat.isLoading
export const selectIsTyping = (state: RootState) => state.chat.isTyping
export const selectError = (state: RootState) => state.chat.error
export const selectUnreadMessages = (state: RootState) => state.chat.unreadMessages
export const selectDraftMessages = (state: RootState) => state.chat.draftMessages
export const selectMessageQueue = (state: RootState) => state.chat.messageQueue
export const selectLastSyncTime = (state: RootState) => state.chat.lastSyncTime

export const {
  setChats,
  addChat,
  updateChat,
  removeChat,
  setCurrentChat,
  addMessage,
  updateMessage,
  removeMessage,
  setIsTyping,
  setDraftMessage,
  clearDraftMessage,
  addToMessageQueue,
  removeFromMessageQueue,
  incrementRetryCount,
  setError,
  clearError
} = chatSlice.actions

export default chatSlice.reducer
