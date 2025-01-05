import React from 'react'
import { Button } from 'tamagui'
import * as DocumentPicker from 'expo-document-picker'

interface CharacterImportProps {
  onImport: (uri: string) => Promise<void>
  onError: (message: string) => void
}

export const CharacterImport = ({ onImport, onError }: CharacterImportProps) => {
  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/png',
        copyToCacheDirectory: true
      })

      if (!result.canceled && result.assets?.[0]) {
        await onImport(result.assets[0].uri)
      }
    } catch (err) {
      console.error('Failed to import character:', err)
      onError('Failed to import character card')
    }
  }

  return (
    <Button
      backgroundColor="transparent"
      pressStyle={{ opacity: 0.8 }}
      onPress={handleImport}
    >
      <Button.Text color="$blue">Import</Button.Text>
    </Button>
  )
}
