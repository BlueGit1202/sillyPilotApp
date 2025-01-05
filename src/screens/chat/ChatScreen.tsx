import React, { useState, useRef, useCallback, useEffect } from 'react'
import { YStack, ScrollView, Text } from 'tamagui'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../navigation/types'
import { ChatMessage } from '../../components/chat/ChatMessage'
import { ChatInput } from '../../components/chat/ChatInput'
import { ChatSettings } from '../../components/chat/ChatSettings'
import { Toast } from '../../components/Toast'
import { useNavigation } from '@react-navigation/native'
import { 
  Keyboard, 
  Platform, 
  KeyboardAvoidingView,
  ScrollView as RNScrollView,
  View,
  StyleSheet,
  Image,
  Pressable,
  BackHandler
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useChats } from '../../hooks/useChats'
import { useDispatch, useSelector } from 'react-redux'
import { apiService, Chat, type Message } from '../../services'

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>
type Navigation = NativeStackScreenProps<RootStackParamList>['navigation']

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1e1e2e',
    borderBottomWidth: 1,
    borderBottomColor: '#313244',
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
  },
  settingsButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  }
})

import storageService from '../../services/storage';
import type { RootState, AppDispatch } from '../../store'
 
import { setCurrentChat } from 'store/slices/chatSlice'

export const ChatScreen = ({ route }: ChatScreenProps) => {
  const { character, forceOpenSettings } = route.params
  const navigation = useNavigation<Navigation>()
  const insets = useSafeAreaInsets()
  const scrollViewRef = useRef<RNScrollView>(null)
  
  // Chat state and hooks
  const { 
    currentChat,
    error,
    createChat,
    loadChats,
    sendMessage,
    regenerateMessage,
    updateMessage
  } = useChats()
   
  const isTyping = useSelector((state: RootState) => state.chat.isTyping)
  
  // UI state
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [idleMode, setIdleMode] = useState(false)
  const [idleInterval, setIdleInterval] = useState(30)
  const [showBubbles] = useState(true)
  const [isInitializing, setIsInitializing] = useState(true)
  const idleTimeoutRef = useRef<NodeJS.Timeout>()
  const [flg, setFlg] = useState(0)
  const [back,setBack]=useState(0)

  const dispatch = useDispatch<AppDispatch>()

  // Reload Chats
  
  useEffect(() => {

    const backAction = () => {
      setBack(1 - back);
      loadChats()
    navigation.goBack();
    return true;
    };

const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
    }, [back]);

  // Initialize chat when screen loads
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsInitializing(true)
        dispatch(setCurrentChat(await apiService.getChat(character.id)));
        console.log(currentChat)
        // console.log("wwwwwwwwwwwwwwwwwwwwww",typeof(chat))
        // if (!currentChat) {
        //   await createChat({
        //     name: `Chat with ${character.data.name}`,
        //     character_id: character.id,
        //     data: character.data
        //   })
        // }
      } catch (err) {
        showToastMessage('Failed to initialize chat')
        console.error('Initialize chat error:', err)
      } finally {
        setIsInitializing(false)
      }
    }
    initializeChat()
  }, [character, createChat,flg])
  

  useEffect(() => {
    if (forceOpenSettings) {
      setShowSettings(true)
    }
  }, [forceOpenSettings])

  useEffect(() => {
    if (error) {
      showToastMessage(error)
    }
  }, [error])

  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated })
    }, 100)
  }, [])

  const handleSend = async (content: string) => {
    if (isInitializing) {
      showToastMessage('Please wait for chat to initialize')
      return
    }

    try {
      console.log("-----------------------------------called Send request")
      if (editingMessage) {
        await updateMessage({
          ...editingMessage,
          content
        })
        setFlg(1-flg)
        setEditingMessage(null)
        showToastMessage('Message updated')
      } else {
        await sendMessage(content)
        scrollToBottom()
        setFlg(1-flg)
        console.log("idleMode------------------/-----------------------------",idleMode)
        if (idleMode) {
          scheduleNextIdleResponse()
        }
      }
    } catch (err) {
      showToastMessage('Failed to send message')
      console.error('Send message error:', err)
    }
  }

  const handleRegenerateMessage = async (messageId: string) => {
    if (isInitializing) {
      showToastMessage('Please wait for chat to initialize')
      return
    }

    try {
      await regenerateMessage(messageId)
      showToastMessage('Regenerating response...')
    } catch (err) {
      showToastMessage('Failed to regenerate message')
      console.error('Regenerate message error:', err)
    }
  }

  const handleEditMessage = (message: Message) => {
    console.log("message-----------",message);
    setEditingMessage(message)
    Keyboard.dismiss()
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  }

  const handleIdleModeChange = (enabled: boolean) => {
    setIdleMode(enabled)
    if (enabled) {
      scheduleNextIdleResponse()
      showToastMessage('Idle mode enabled')
    } else {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }
      showToastMessage('Idle mode disabled')
    }
  }

  const scheduleNextIdleResponse = () => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current)
    }
    
    idleTimeoutRef.current = setTimeout(async () => {
      if (idleMode && !isInitializing) {
        try {
          await sendMessage('(Idle response)')
          scheduleNextIdleResponse()
        } catch (err) {
          console.error('Idle response error:', err)
        }
      }
    }, idleInterval * 1000)
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const handleResetChat = () => {
    // TODO: Implement chat reset
    setShowSettings(false)
    showToastMessage('Chat history cleared')
  }

  const handleEditCharacter = () => {
    setShowSettings(false)
    navigation.navigate('CreateCharacter', { editCharacter: character })
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#1e1e2e' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <YStack flex={1} backgroundColor="$background">
        {/* Slim Header with Character Info */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <Pressable 
              style={styles.backButton} 
              onPress={() => {
                loadChats()
                navigation.goBack()
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#cdd6f4" />
            </Pressable>

            <Pressable 
              style={styles.characterInfo}
              onPress={handleEditCharacter}
            >
              <Image 
                source={{ uri: character.data?.avatar }} 
                style={[
                  styles.avatar,
                  { borderColor: idleMode ? '#f38ba8' : '#a6e3a1' }
                ]} 
              />
              <YStack>
                <Text
                  color="$lavender"
                  fontSize={16}
                  fontWeight="600"
                >
                  {character.data?.name}
                </Text>
                <Text
                  color="$overlay0"
                  fontSize={12}
                >
                  {character.data?.mood}
                </Text>
              </YStack>
            </Pressable>

            <Pressable 
              style={styles.settingsButton} 
              onPress={() => setShowSettings(true)}
            >
              <Ionicons name="settings-outline" size={20} color="#cdd6f4" />
            </Pressable>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={{ flex: 1 }} 
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollToBottom(false)}
        >
          
          {currentChat?.messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              timestamp={new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
              isUser={message.role === 'user'}
              mood={character.data.mood}
              isEditing={editingMessage?.id === message.id}
              showBubble={showBubbles}
              onRegenerateMessage={() => handleRegenerateMessage(message.id)}
              onEditMessage={() => handleEditMessage(message)}
            />
          ))}
          {isTyping && (
            <ChatMessage
              key="typing"
              content={`${character.data.name} is typing...`}
              timestamp=""
              isUser={false}
              typing={true}
              showBubble={showBubbles}
            />
          )}
        </ScrollView>

        <ChatInput
          onSend={handleSend}
          isEditing={!!editingMessage}
          editingMessage={editingMessage?.content}
          onCancelEdit={() => setEditingMessage(null)}
          idleMode={idleMode}
          onIdleModeChange={handleIdleModeChange}
          idleInterval={idleInterval}
          onIdleIntervalChange={setIdleInterval}
          disabled={isInitializing}
        />

        <ChatSettings
          open={showSettings}
          onOpenChange={setShowSettings}
          character={character}
          onResetChat={handleResetChat}
          onEditCharacter={handleEditCharacter}
        />

        {showToast && (
          <Toast
            message={toastMessage}
            type="info"
            visible={showToast}
            onHide={() => setShowToast(false)}
          />
        )}
      </YStack>
    </KeyboardAvoidingView>
  )
}
