import React from 'react'
import { Image } from 'react-native'
import { YStack, Text, Button } from 'tamagui'
import * as ImagePicker from 'expo-image-picker'
import { characterCardService } from '../../services/characterCard'
import type { CharacterCard } from '../../services/characterCard'

interface AvatarPickerProps {
  avatar: string | null
  onAvatarChange: (uri: string) => void
  onCharacterCardFound?: (card: CharacterCard) => void
  onError: (message: string) => void
}

export const AvatarPicker = ({ 
  avatar, 
  onAvatarChange, 
  onCharacterCardFound,
  onError 
}: AvatarPickerProps) => {
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri
        onAvatarChange(uri)

        // Try to parse character card data if present
        try {
          const card = await characterCardService.parseCharacterCard(uri)
          if (card && onCharacterCardFound) {
            onCharacterCardFound(card)
          }
        } catch (err) {
          // Not a character card, just use as regular avatar
          console.log('No character card data found in image')
        }
      }
    } catch (err) {
      console.error('Failed to pick image:', err)
      onError('Failed to select image')
    }
  }

  return (
    <YStack alignItems="center" space="$2">
      {avatar ? (
        <Image
          source={{ uri: avatar }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 8
          }}
        />
      ) : (
        <YStack
          width={120}
          height={120}
          borderRadius={60}
          backgroundColor="$overlay0"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="$text" fontSize={48}>
            👤
          </Text>
        </YStack>
      )}
      <Button
        backgroundColor="$blue"
        pressStyle={{ opacity: 0.8 }}
        onPress={handlePickImage}
      >
        <Button.Text color="$base">
          {avatar ? 'Change Avatar' : 'Select Avatar'}
        </Button.Text>
      </Button>
    </YStack>
  )
}
