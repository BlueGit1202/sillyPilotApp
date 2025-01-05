import React from 'react'
import { YStack, Text, styled } from 'tamagui'
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  useSharedValue
} from 'react-native-reanimated'

const AnimatedText = Animated.createAnimatedComponent(Text)

const Container = styled(YStack, {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$4',
})

const EmoticonText = styled(AnimatedText, {
  fontSize: 48,
  marginBottom: '$4',
  color: '$sky',
})

const MessageText = styled(Text, {
  fontSize: '$5',
  color: '$overlay0',
  textAlign: 'center',
  fontFamily: '$heading',
})

interface EmptyChatProps {
  message?: string
}

export const EmptyChat = ({ message = "Start chatting!" }: EmptyChatProps) => {
  const float = useSharedValue(0)

  React.useEffect(() => {
    // Gentle floating animation
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: float.value * 10 }
    ]
  }))

  return (
    <Container>
      <Animated.View style={animatedStyle}>
        <EmoticonText>
          ૮ • ﻌ - ა
        </EmoticonText>
      </Animated.View>
      <MessageText>
        {message}
      </MessageText>
    </Container>
  )
}
