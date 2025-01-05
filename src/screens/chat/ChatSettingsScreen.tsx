import React from 'react'
import { YStack, Text, Button } from 'tamagui'
import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../navigation/types'

type ChatSettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'ChatSettings'>

export const ChatSettingsScreen = () => {
  const navigation = useNavigation()
  const route = useRoute<ChatSettingsScreenProps['route']>()
  const { character } = route.params

  const handleResetChat = () => {
    // TODO: Implement reset chat
    navigation.goBack()
  }

  const handleEditCharacter = () => {
    navigation.navigate('CreateCharacter', { editCharacter: character })
  }

  return (
    <YStack f={1} backgroundColor="$background" padding="$4" space="$4">
      <YStack space="$2" backgroundColor="$surface" padding="$4" borderRadius="$4">
        <Text fontSize={16} fontWeight="600" color="$color">
          Chat Settings
        </Text>
        <Text fontSize={14} color="$color" opacity={0.8}>
          Manage settings for your chat with {character.data.name}
        </Text>
      </YStack>

      <YStack space="$3">
        <Button
          backgroundColor="$surface"
          pressStyle={{ opacity: 0.8 }}
          onPress={handleEditCharacter}
          height={50}
        >
          <Button.Text fontSize={14}>Edit Character</Button.Text>
        </Button>

        <Button
          backgroundColor="$red"
          pressStyle={{ opacity: 0.8 }}
          onPress={handleResetChat}
          height={50}
        >
          <Button.Text fontSize={14} color="white">Reset Chat History</Button.Text>
        </Button>
      </YStack>
    </YStack>
  )
}
