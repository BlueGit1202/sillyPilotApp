import React, { useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { Stack, Text, XStack, YStack, styled } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withSequence,
  withTiming,
  FadeIn,
  SlideInRight,
  SlideInLeft
} from 'react-native-reanimated'

const AnimatedStack = Animated.createAnimatedComponent(Stack)
const AnimatedText = Animated.createAnimatedComponent(Text)

export interface ChatMessageProps {
  content: string
  timestamp: string
  isUser?: boolean
  mood?: string
  isEditing?: boolean
  typing?: boolean
  showBubble?: boolean
  onRegenerateMessage?: () => void
  onEditMessage?: () => void
}

const MessageBubble = styled(Stack, {
  padding: '$3',
  borderRadius: 20,
  maxWidth: '85%',
  variants: {
    isUser: {
      true: {
        backgroundColor: '$blue',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
      },
      false: {
        backgroundColor: '$surface0',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
      },
    },
  } as const,
})

const MessageText = styled(Text, {
  fontSize: 15,
  lineHeight: 20,
})

const TimeText = styled(Text, {
  color: '$overlay0',
  fontSize: 12,
  marginHorizontal: '$2',
})

const EmotionTag = styled(XStack, {
  position: 'absolute',
  top: -20,
  left: 0,
  backgroundColor: '#313244',
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 12,
  alignItems: 'center',
  space: '$1',
})

const ActionMenu = styled(YStack, {
  position: 'absolute',
  right: 0,
  bottom: '100%',
  marginBottom: 4,
  backgroundColor: '$surface0',
  borderRadius: 12,
  padding: '$2',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
})

const ActionButton = styled(Pressable, {
  flexDirection: 'row',
  alignItems: 'center',
  padding: '$2',
  borderRadius: 8,
})

const TypingText = styled(AnimatedText, {
  color: '$sky',
  fontSize: 20,
})

export const ChatMessage = ({ 
  content, 
  timestamp, 
  isUser, 
  mood,
  isEditing,
  typing,
  showBubble = true,
  onRegenerateMessage,
  onEditMessage
}: ChatMessageProps) => {
  const [showActions, setShowActions] = useState(false)
  const actionScale = useSharedValue(1)

  const handlePress = () => {
    if (!isUser && !typing) {
      setShowActions(!showActions)
      actionScale.value = withSequence(
        withSpring(0.95, { damping: 8 }),
        withSpring(1, { damping: 12 })
      )
    }
  }

  const renderContent = () => {
    if (typing) {
      return (
        <Animated.View entering={FadeIn.duration(300)}>
          <TypingText>
            ૮ • ﻌ - ა
          </TypingText>
        </Animated.View>
      )
    }

    return (
      <MessageText
        color={showBubble ? (isUser ? 'white' : '$color') : '$color'}
      >
        {content}
      </MessageText>
    )
  }

  const renderMessage = () => {
    const entering = isUser ? SlideInRight : SlideInLeft
    
    if (showBubble) {
      return (
        <Animated.View entering={entering.duration(300)}>
          <Pressable onPress={handlePress}>
            <MessageBubble isUser={isUser}>
              {!isUser && mood && !typing && (
                <EmotionTag>
                  <Text color="$text" fontSize={12}>😊</Text>
                  <Text color="$text" fontSize={12}>{mood}</Text>
                </EmotionTag>
              )}
              {renderContent()}
              {showActions && !isUser && !typing && (
                <ActionMenu>
                  <ActionButton onPress={onRegenerateMessage}>
                    <Ionicons name="refresh" size={16} color="#cdd6f4" style={{ marginRight: 8 }} />
                    <Text color="$text">Regenerate</Text>
                  </ActionButton>
                  <ActionButton onPress={onEditMessage}>
                    <Ionicons name="pencil" size={16} color="#cdd6f4" style={{ marginRight: 8 }} />
                    <Text color="$text">Edit</Text>
                  </ActionButton>
                </ActionMenu>
              )}
            </MessageBubble>
          </Pressable>
        </Animated.View>
      )
    }

    return (
      <Animated.View entering={entering.duration(300)}>
        <YStack 
          space="$1" 
          alignItems={isUser ? 'flex-end' : 'flex-start'}
          paddingVertical="$2"
        >
          {!isUser && mood && !typing && (
            <EmotionTag>
              <Text color="$text" fontSize={12}>😊</Text>
              <Text color="$text" fontSize={12}>{mood}</Text>
            </EmotionTag>
          )}
          {renderContent()}
        </YStack>
      </Animated.View>
    )
  }

  return (
    <YStack space="$1" paddingHorizontal="$2" paddingVertical="$1">
      {renderMessage()}
      <XStack 
        space="$2"
        alignSelf={isUser ? 'flex-end' : 'flex-start'}
        alignItems="center"
        opacity={typing ? 0 : 1}
      >
        <TimeText>{timestamp}</TimeText>
      </XStack>
    </YStack>
  )
}
