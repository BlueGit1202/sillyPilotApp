import React, { useEffect } from 'react'
import { StyleSheet, Dimensions } from 'react-native'
import { Stack, Text } from 'tamagui'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface ToastProps {
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  visible: boolean
  duration?: number
  position?: 'top' | 'bottom'
  onHide?: () => void
}

const AnimatedStack = Animated.createAnimatedComponent(Stack)

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    minWidth: SCREEN_WIDTH * 0.6,
    maxWidth: SCREEN_WIDTH - 32,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }
})

const getBackgroundColor = (type: ToastProps['type']) => {
  switch (type) {
    case 'success':
      return '#a6e3a1'
    case 'warning':
      return '#f9e2af'
    case 'error':
      return '#f38ba8'
    default:
      return '#89b4fa'
  }
}

const getTextColor = (type: ToastProps['type']) => {
  switch (type) {
    case 'warning':
      return '#1e1e2e'
    default:
      return '#1e1e2e'
  }
}

export const Toast = ({
  message,
  type = 'info',
  visible,
  duration = 2000,
  position = 'bottom',
  onHide
}: ToastProps) => {
  const insets = useSafeAreaInsets()
  const translateY = useSharedValue(position === 'top' ? -100 : 100)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150
      })
      opacity.value = withSpring(1)

      const timeout = setTimeout(() => {
        translateY.value = withSpring(position === 'top' ? -100 : 100, {
          damping: 15,
          stiffness: 150
        })
        opacity.value = withTiming(0, {
          duration: 300,
          easing: Easing.ease
        })
        onHide?.()
      }, duration)

      return () => clearTimeout(timeout)
    }
  }, [visible, duration, position, translateY, opacity, onHide])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value
  }))

  return (
    <AnimatedStack
      style={[
        styles.container,
        position === 'top' ? { top: insets.top + 16 } : { bottom: insets.bottom + 16 },
        animatedStyle
      ]}
    >
      <Stack
        style={[
          styles.toast,
          { backgroundColor: getBackgroundColor(type) }
        ]}
      >
        <Text
          color={getTextColor(type)}
          fontSize={14}
          fontWeight="500"
          textAlign="center"
        >
          {message}
        </Text>
      </Stack>
    </AnimatedStack>
  )
}

export default Toast
