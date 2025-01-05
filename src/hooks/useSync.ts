import { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import NetInfo from '@react-native-community/netinfo'
import { setOnline, checkServerStatus, selectServerStatus, selectIsOnline, addSystemLog } from '../store/slices/appSlice'
import type { RootState, AppDispatch } from '../store'
import { apiService } from '../services'
import { Platform } from 'react-native'

interface SyncResult {
  success: boolean
  syncTime?: string
  error?: string
  remainingMessages?: number
}

interface QueuedMessage {
  chat_id: number
  content: string
  image?: string
  retryCount: number
}

export function useSync() {
  const dispatch = useDispatch<AppDispatch>()
  const isOnline = useSelector(selectIsOnline)
  const serverStatus = useSelector(selectServerStatus)
  const [isChecking, setIsChecking] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([])

  // Monitor network connectivity
  useEffect(() => {
    // For web platform, assume online unless server check fails
    if (Platform.OS === 'web') {
      dispatch(setOnline(true))
      dispatch(checkServerStatus())
      return
    }

    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = !!state.isConnected && !!state.isInternetReachable
      dispatch(setOnline(isConnected))
      
      // Log network state changes
      dispatch(addSystemLog({
        message: `Network state changed: ${isConnected ? 'online' : 'offline'}`,
        type: isConnected ? 'info' : 'warning',
        metadata: {
          type: state.type,
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable
        }
      }))

      if (isConnected) {
        dispatch(checkServerStatus())
      }
    })

    // Initial network check
    NetInfo.fetch().then(state => {
      const isConnected = !!state.isConnected && !!state.isInternetReachable
      dispatch(setOnline(isConnected))
    })

    return () => unsubscribe()
  }, [dispatch])

  // Add message to queue
  const queueMessage = useCallback((message: Omit<QueuedMessage, 'retryCount'>) => {
    setMessageQueue(prev => [...prev, { ...message, retryCount: 0 }])
    dispatch(addSystemLog({
      message: 'Message queued for later sending',
      type: 'info',
      metadata: { chat_id: message.chat_id }
    }))
  }, [dispatch])

  // Remove message from queue
  const removeFromQueue = useCallback((chat_id: number, content: string) => {
    setMessageQueue(prev => prev.filter(m => 
      m.chat_id !== chat_id || m.content !== content
    ))
  }, [])

  // Process message queue
  const processQueue = useCallback(async () => {
    if (!isOnline || !serverStatus.isOnline || messageQueue.length === 0) {
      return
    }

    const currentQueue = [...messageQueue]
    const failedMessages: QueuedMessage[] = []

    for (const message of currentQueue) {
      try {
        await apiService.sendMessage(
          message.chat_id,
          message.content,
          message.image
        )
        removeFromQueue(message.chat_id, message.content)
        dispatch(addSystemLog({
          message: 'Queued message sent successfully',
          type: 'info',
          metadata: { chat_id: message.chat_id }
        }))
      } catch (err) {
        console.error('Failed to send queued message:', err)
        if (message.retryCount < 3) {
          failedMessages.push({
            ...message,
            retryCount: message.retryCount + 1
          })
          dispatch(addSystemLog({
            message: 'Failed to send queued message',
            type: 'error',
            metadata: { 
              chat_id: message.chat_id,
              retryCount: message.retryCount + 1,
              error: err instanceof Error ? err.message : 'Unknown error'
            }
          }))
        }
      }
    }

    setMessageQueue(failedMessages)
  }, [isOnline, serverStatus.isOnline, messageQueue, removeFromQueue, dispatch])

  // Check server status
  const checkConnection = useCallback(async () => {
    if (!isOnline && Platform.OS !== 'web') {
      dispatch(addSystemLog({
        message: 'Cannot check server - offline',
        type: 'warning'
      }))
      return false
    }

    try {
      console.log('Checking server status...')
      const result = await dispatch(checkServerStatus()).unwrap()
      console.log('Server status check result:', result)
      return result.status === 'online'
    } catch (err) {
      console.error('Server check failed:', err)
      dispatch(addSystemLog({
        message: 'Server check failed',
        type: 'error',
        metadata: { error: err instanceof Error ? err.message : 'Unknown error' }
      }))
      return false
    }
  }, [isOnline, dispatch])

  // Sync data with server
  const sync = useCallback(async (): Promise<SyncResult> => {
    if (!isOnline && Platform.OS !== 'web') {
      setError('No internet connection')
      return { success: false, error: 'No internet connection' }
    }

    setIsChecking(true)
    setError(null)

    try {
      // Check server connection first
      const isConnected = await checkConnection()
      if (!isConnected) {
        setError('Server unavailable')
        return { success: false, error: 'Server unavailable' }
      }

      // Process message queue
      await processQueue()
      
      // Update last sync time
      const syncTime = new Date().toISOString()
      setLastSyncTime(syncTime)

      dispatch(addSystemLog({
        message: 'Sync completed successfully',
        type: 'info',
        metadata: { 
          syncTime,
          remainingMessages: messageQueue.length
        }
      }))

      return {
        success: true,
        syncTime,
        remainingMessages: messageQueue.length
      }
    } catch (err) {
      console.error('Sync failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Sync failed'
      setError(errorMessage)
      dispatch(addSystemLog({
        message: 'Sync failed',
        type: 'error',
        metadata: { error: errorMessage }
      }))
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsChecking(false)
    }
  }, [isOnline, checkConnection, processQueue, messageQueue.length, dispatch])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && serverStatus.isOnline && messageQueue.length > 0) {
      sync().catch(console.error)
    }
  }, [isOnline, serverStatus.isOnline, messageQueue.length, sync])

  return {
    isOnline,
    isChecking,
    lastSyncTime,
    error,
    messageQueue,
    serverStatus,
    sync,
    checkConnection,
    queueMessage,
    removeFromQueue
  }
}
