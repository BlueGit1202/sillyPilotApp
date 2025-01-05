import React, { useState, useRef, useEffect } from 'react'
import { TextInput, StyleSheet, Keyboard, Pressable, Platform, View } from 'react-native'
import { Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import Animated, { 
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence
} from 'react-native-reanimated'
import { IdleSettingsModal } from './IdleSettingsModal'

interface ChatInputProps {
  onSend: (message: string) => void
  isEditing?: boolean
  editingMessage?: string
  onCancelEdit?: () => void
  idleMode?: boolean
  onIdleModeChange?: (value: boolean) => void
  idleInterval?: number
  onIdleIntervalChange?: (value: number) => void
  disabled?: boolean
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e2e',
    borderTopWidth: 1,
    borderTopColor: '#313244',
    paddingVertical: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#313244',
    borderRadius: 20,
    marginHorizontal: 8,
    paddingLeft: 12,
    paddingRight: 4,
    minHeight: 40,
  },
  input: {
    flex: 1,
    color: '#cdd6f4',
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 4,
    ...Platform.select({
      ios: {
        lineHeight: 20,
      },
      android: {
        textAlignVertical: 'center',
      },
    }),
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  sendButton: {
    backgroundColor: '#89b4fa',
  },
  disabledSendButton: {
    backgroundColor: '#45475a',
  },
  idleButton: {
    backgroundColor: '#f5c2e7',
  },
  disabledIdleButton: {
    backgroundColor: '#45475a',
  },
  editingBanner: {
    backgroundColor: '#313244',
    paddingVertical: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
})

export const ChatInput = ({ 
  onSend,
  isEditing,
  editingMessage,
  onCancelEdit,
  idleMode,
  onIdleModeChange,
  idleInterval = 30,
  onIdleIntervalChange,
  disabled
}: ChatInputProps) => {
  const [message, setMessage] = useState(editingMessage || '')
  const [isIdle, setIsIdle] = useState(idleMode || false)
  const [interval, setInterval] = useState(idleInterval)
  const [showIdleSettings, setShowIdleSettings] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const sendScale = useSharedValue(1)
  const idleScale = useSharedValue(1)

  useEffect(() => {
    if (isEditing && editingMessage) {
      setMessage(editingMessage)
      inputRef.current?.focus()
    }
  }, [isEditing, editingMessage])

  const handleSend = () => {
    if (message.trim() && !disabled) {
      sendScale.value = withSequence(
        withSpring(0.8, { damping: 4 }),
        withSpring(1, { damping: 10 })
      )
      onSend(message.trim())
      setMessage('')
      Keyboard.dismiss()
    }
  }

  const handleIdleModeChange = (enabled: boolean) => {
    if (!disabled) {
      setIsIdle(enabled)
      onIdleModeChange?.(enabled)
      idleScale.value = withSequence(
        withSpring(0.8, { damping: 4 }),
        withSpring(1, { damping: 10 })
      )
    }
  }

  const handleIntervalChange = (value: number) => {
    if (!disabled) {
      setInterval(value)
      onIdleIntervalChange?.(value)
    }
  }

  const handleCancelEdit = () => {
    if (!disabled) {
      setMessage('')
      onCancelEdit?.()
    }
  }

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }]
  }))

  const idleButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: idleScale.value }]
  }))

  return (
    <View style={styles.container}>
      {isEditing && (
        <View style={styles.editingBanner}>
          <Text color="$text" fontSize={14}>
            Editing message...
          </Text>
          <Pressable onPress={handleCancelEdit}>
            <Text color="$red" fontSize={14}>
              Cancel
            </Text>
          </Pressable>
        </View>
      )}

      <View style={styles.inputRow}>
        <Animated.View style={idleButtonStyle}>
          <Pressable 
            style={[
              styles.iconButton,
              isIdle && !disabled ? styles.idleButton : styles.disabledIdleButton
            ]}
            onPress={() => !disabled && setShowIdleSettings(true)}
          >
            <Ionicons 
              name={isIdle ? "timer" : "timer-outline"} 
              size={20} 
              color={isIdle && !disabled ? "#1e1e2e" : "#cdd6f4"} 
            />
          </Pressable>
        </Animated.View>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={disabled ? "Initializing chat..." : "Type a message..."}
            placeholderTextColor="#6c7086"
            value={message}
            onChangeText={setMessage}
            multiline
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!disabled}
          />

          <Animated.View style={sendButtonStyle}>
            <Pressable
              style={[
                styles.iconButton,
                message.trim() && !disabled ? styles.sendButton : styles.disabledSendButton
              ]}
              onPress={handleSend}
              disabled={disabled || !message.trim()}
            >
              <Ionicons 
                name={isEditing ? "checkmark" : "paper-plane"} 
                size={20} 
                color={message.trim() && !disabled ? "#1e1e2e" : "#cdd6f4"} 
              />
            </Pressable>
          </Animated.View>
        </View>
      </View>

      <IdleSettingsModal
        open={showIdleSettings}
        onOpenChange={setShowIdleSettings}
        idleMode={isIdle}
        onIdleModeChange={handleIdleModeChange}
        idleInterval={interval}
        onIdleIntervalChange={handleIntervalChange}
      />
    </View>
  )
}
