import { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Chat, Message } from '../services'
import { apiService, storageService, openRouterService } from '../services'
import { 
  setChats, 
  addChat, 
  removeChat, 
  setCurrentChat,
  addMessage,
  updateMessage as updateMessageAction,
  removeMessage,
  setIsTyping
} from '../store/slices/chatSlice'
import type { RootState, AppDispatch } from '../store'
import { useSync } from './useSync'

export function useChats() {
  const dispatch = useDispatch<AppDispatch>()
  const chats = useSelector((state: RootState) => state.chat.chats)
  const currentChat = useSelector((state: RootState) => state.chat.currentChat)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isOnline, serverStatus, queueMessage } = useSync()

  // Setup socket event listeners
  // useEffect(() => {
  //   const unsubscribeMessage = socketService.onMessage((message: Message) => {
  //     if (currentChat && message.chat_id === currentChat.id) {
  //       dispatch(addMessage(message))
  //       // Update local storage
  //       storageService.getChats().then(currentChats => {
  //         const updatedChats = currentChats.map(chat => {
  //           if (chat.id === message.chat_id) {
  //             return {
  //               ...chat,
  //               messages: [...(chat.messages || []), message],
  //               last_message: message.content,
  //               last_message_time: message.timestamp
  //             }
  //           }
  //           return chat
  //         })
  //         storageService.saveChats(updatedChats)
  //       })
  //     }
  //   })

  //   const unsubscribeError = socketService.onError((error: string) => {
  //     setError(error)
  //   })

  //   return () => {
  //     unsubscribeMessage()
  //     unsubscribeError()
  //   }
  // }, [dispatch, currentChat])

  // Load chats
  const loadChats = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {

      // Then try to sync with server if online
      if (isOnline && serverStatus.isOnline) {
        const serverChats = await apiService.getChats();
        
        dispatch(setChats(serverChats))
        // Update local storage with server data
        
        await storageService.saveChats([]) //serverChats

      } else {
        // Try to load from local storage first
        const localChats = await storageService.getChats()
        if (localChats.length > 0) {
          dispatch(setChats(localChats))
        }
      }
    } catch (err) {
      console.error('Failed to load chats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chats')
    } finally {
      setIsLoading(false)
    }
  }, [dispatch, isOnline, serverStatus.isOnline])

  // Create chat
  const createChat = useCallback(async (chatData: Omit<Chat, 'id' | 'messages'>) => {
    setError(null)
    try {
      if (!isOnline || !serverStatus.isOnline) {
        throw new Error('No connection to server')
      }

      // Create chat on server
      const newChat = await apiService.createChat(chatData)
      
      // Update Redux store
      dispatch(addChat(newChat))
      dispatch(setCurrentChat(newChat))
      
      // Update local storage
      const currentChats = await storageService.getChats()
      await storageService.saveChats([...currentChats, newChat])

      // Connect to chat room
      // if (!socketService.isConnected()) {
      //   await socketService.connect()
      // }
      // await socketService.joinChat(newChat.id)
      
      return newChat
    } catch (err) {
      console.error('Failed to create chat:', err)
      setError(err instanceof Error ? err.message : 'Failed to create chat')
      throw err
    }
  }, [dispatch, isOnline, serverStatus.isOnline])

  // Send message
  const sendMessage = useCallback(async (content: string, image?: string) => {
    if (!currentChat) {
      throw new Error('No active chat')
    }

    setError(null)
    try {
      if (!isOnline || !serverStatus.isOnline) {
        // Queue message for later if offline
        queueMessage({ chat_id: currentChat.id, content, image })
        console.log("-------------------------------------Message Queuing called")
        throw new Error('No connection to server - message queued')
      }

      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        chat_id: currentChat.id,
        role: 'user',
        content,
        image,
        timestamp: new Date().toISOString()
      }
      // Add user message to Redux store
      dispatch(addMessage(userMessage))
    
      // Ensure socket connection
      // if (!socketService.isConnected()) {
      //   await socketService.connect()
      //   await socketService.joinChat(currentChat.id)
      // }

      // // Send message through socket
      // // await socketService.sendMessage(currentChat.id, content, 'user', image)
      // await socketService.sendMessageToChat(currentChat.id, content, 'user', image)

      // Update local storage with user message
      // const currentChats = await storageService.getChats();
      const currentChats = await storageService.getChats();

      const updatedChats = currentChats.map(chat => {
        if (chat.id === currentChat.id) {
          return {
            ...chat,
            messages: [...(chat.messages || []), userMessage],
            last_message: content,
            last_message_time: userMessage.timestamp
          }
        }
        return chat
      })

      await storageService.saveChats(updatedChats)
      dispatch(setChats(updatedChats))

      const result = await apiService.sendMessage(currentChat.id, content, image);
      
      const assistantMessage = result.assistantMessage
      dispatch(addMessage(assistantMessage))

      const currentChats1 = await storageService.getChats()
      const updatedChats1 = currentChats1.map(chat => {
        if (chat.id === currentChat.id) {
          const messages = (chat.messages || []).filter(m => m.id !== userMessage.id)
          return {
            ...chat,
            messages: [...messages, assistantMessage],
            last_message: assistantMessage.content,
            last_message_time: assistantMessage.timestamp
          }
        }
        return chat
      })
      await storageService.saveChats(updatedChats1)
      dispatch(setChats(updatedChats1))

      return userMessage
    } catch (err) {
      console.error('Failed to send message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      throw err
    }
  }, [currentChat, dispatch, isOnline, serverStatus.isOnline, queueMessage])

  // Update message
  const updateMessage = useCallback(async (message: Message) => {
    console.log("updateMessage called");
    if (!currentChat) {
      throw new Error('No active chat')
    }

    setError(null)
    try {
      if (!isOnline || !serverStatus.isOnline) {
        throw new Error('No connection to server')
      }

      // Update message on server
      const updatedMessage = await apiService.updateMessage(currentChat.id, message.id, message.content)
      console.log("Updated Message:",updatedMessage.content)
      
      // Update Redux store
      dispatch(updateMessageAction(updatedMessage))

      // Update local storage
      const currentChats = await storageService.getChats()
      const updatedChats = currentChats.map(chat => {
        if (chat.id === currentChat.id) {
          return {
            ...chat,
            messages: (chat.messages || []).map(m => 
              m.id === message.id ? updatedMessage : m
            ),
            last_message: chat.messages[chat.messages.length - 1].id === message.id 
              ? updatedMessage.content 
              : chat.last_message,
            last_message_time: chat.messages[chat.messages.length - 1].id === message.id
              ? updatedMessage.timestamp
              : chat.last_message_time
          }
        }
        return chat
      })
      
      await storageService.saveChats(updatedChats)

      return updatedMessage
    } catch (err) {
      console.error('Failed to update message:', err)
      setError(err instanceof Error ? err.message : 'Failed to update message')
      throw err
    }
  }, [currentChat, dispatch, isOnline, serverStatus.isOnline])

  // Regenerate message
  const regenerateMessage = useCallback(async (messageId: string) => {
    if (!currentChat) {
      throw new Error('No active chat')
    }

    setError(null)
    try {
      if (!isOnline || !serverStatus.isOnline) {
        throw new Error('No connection to server')
      }

      dispatch(setIsTyping(true))

      // Find the user message that prompted this response
      const messageIndex = currentChat.messages.findIndex(m => m.id === messageId)
      if (messageIndex === -1) {
        throw new Error('Message not found')
      }

      const userMessage = currentChat.messages[messageIndex - 1]
      if (!userMessage || userMessage.role !== 'user') {
        throw new Error('No user message found to regenerate from')
      }

      // Remove the old AI message
      dispatch(removeMessage(messageId))

      // Get new response from OpenRouter
      const aiResponse = await openRouterService.sendMessage(userMessage.content, currentChat)
      
      // Create new message
      const newMessage: Message = {
        id: Date.now().toString(),
        chat_id: currentChat.id,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      }

      // Add new message to Redux store
      dispatch(addMessage(newMessage))

      // Update local storage
      const currentChats = await storageService.getChats()
      const updatedChats = currentChats.map(chat => {
        if (chat.id === currentChat.id) {
          const messages = (chat.messages || []).filter(m => m.id !== messageId)
          return {
            ...chat,
            messages: [...messages, newMessage],
            last_message: newMessage.content,
            last_message_time: newMessage.timestamp
          }
        }
        return chat
      })
      await storageService.saveChats(updatedChats)

      return newMessage
    } catch (err) {
      console.error('Failed to regenerate message:', err)
      setError(err instanceof Error ? err.message : 'Failed to regenerate message')
      throw err
    } finally {
      dispatch(setIsTyping(false))
    }
  }, [currentChat, dispatch, isOnline, serverStatus.isOnline])

  // Delete chat
  const deleteChat = useCallback(async (chat_id: number) => {
    setError(null)
    try {
      // Leave chat room if it's the current chat
      // if (currentChat?.id === chat_id) {
      //   await socketService.leaveChat(chat_id)
      // }

      if (isOnline && serverStatus.isOnline) {
        // Delete from server
        await apiService.deleteChat(chat_id)
      }
      
      // Update Redux store
      dispatch(removeChat(chat_id))
      if (currentChat?.id === chat_id) {
        dispatch(setCurrentChat(null))
      }
      
      // Update local storage
      const currentChats = await storageService.getChats()
      const updatedChats = currentChats.filter(c => c.id !== chat_id)
      await storageService.saveChats(updatedChats)
    } catch (err) {
      console.error('Failed to delete chat:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete chat')
      throw err
    }
  }, [currentChat, dispatch, isOnline, serverStatus.isOnline])

  // Cleanup on unmount
  // useEffect(() => {
  //   return () => {
  //     if (currentChat) {
  //       socketService.leaveChat(currentChat.id).catch(console.error)
  //     }
  //     socketService.disconnect()
  //   }
  // }, [currentChat])

  return {
    chats,
    currentChat,
    isLoading,
    error,
    loadChats,
    createChat,
    sendMessage,
    updateMessage,
    regenerateMessage,
    deleteChat
  }
}
