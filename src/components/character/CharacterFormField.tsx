import React from 'react'
import { YStack, Text, Input, TextArea } from 'tamagui'

interface CharacterFormFieldProps {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder: string
  multiline?: boolean
  minHeight?: number
}

export const CharacterFormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  minHeight = 100
}: CharacterFormFieldProps) => {
  const InputComponent = multiline ? TextArea : Input

  return (
    <YStack space="$2">
      <Text color="$text" fontSize={16}>
        {label}
      </Text>
      <InputComponent
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        backgroundColor="$surface0"
        borderColor="$overlay0"
        color="$text"
        minHeight={multiline ? minHeight : undefined}
      />
    </YStack>
  )
}
