import React from 'react'
import { YStack } from 'tamagui'
import { CharacterFormField } from './CharacterFormField'

interface CharacterFormSectionProps {
  name: string
  description: string
  personality: string
  scenario: string
  firstMessage: string
  systemPrompt: string
  creatorNotes: string
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onPersonalityChange: (value: string) => void
  onScenarioChange: (value: string) => void
  onFirstMessageChange: (value: string) => void
  onSystemPromptChange: (value: string) => void
  onCreatorNotesChange: (value: string) => void
}

export const CharacterFormSection = ({
  name,
  description,
  personality,
  scenario,
  firstMessage,
  systemPrompt,
  creatorNotes,
  onNameChange,
  onDescriptionChange,
  onPersonalityChange,
  onScenarioChange,
  onFirstMessageChange,
  onSystemPromptChange,
  onCreatorNotesChange
}: CharacterFormSectionProps) => {
  return (
    <YStack space="$4">
      <CharacterFormField
        label="Name"
        value={name}
        onChangeText={onNameChange}
        placeholder="Character name"
      />

      <CharacterFormField
        label="Description"
        value={description}
        onChangeText={onDescriptionChange}
        placeholder="Character description"
        multiline
      />

      <CharacterFormField
        label="Personality"
        value={personality}
        onChangeText={onPersonalityChange}
        placeholder="Character personality"
        multiline
      />

      <CharacterFormField
        label="Scenario"
        value={scenario}
        onChangeText={onScenarioChange}
        placeholder="Character scenario"
        multiline
      />

      <CharacterFormField
        label="First Message"
        value={firstMessage}
        onChangeText={onFirstMessageChange}
        placeholder="Character's first message"
        multiline
      />

      <CharacterFormField
        label="System Prompt"
        value={systemPrompt}
        onChangeText={onSystemPromptChange}
        placeholder="System prompt for AI"
        multiline
      />

      <CharacterFormField
        label="Creator Notes"
        value={creatorNotes}
        onChangeText={onCreatorNotesChange}
        placeholder="Notes about the character"
        multiline
      />
    </YStack>
  )
}
