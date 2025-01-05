import React from 'react'
import { ActivityIndicator } from 'react-native'
import { YStack, Text } from 'tamagui'

interface LoadingScreenProps {
  message?: string
}

export const LoadingScreen = ({ message = 'Loading...' }: LoadingScreenProps) => {
  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      alignItems="center"
      justifyContent="center"
      space="$4"
    >
      <ActivityIndicator size="large" color="#89b4fa" />
      <Text
        color="$text"
        fontSize={16}
        opacity={0.8}
      >
        {message}
      </Text>
    </YStack>
  )
}

export default LoadingScreen
