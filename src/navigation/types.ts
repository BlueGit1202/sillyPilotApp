export interface CharacterData {
  // Frontend required fields
  name: string
  avatar: string
  description: string
  personality: string
  scenario: string
  firstMessage: string
  systemPrompt: string
  creatorNotes: string
  tags: string[]
  status: string
  mood: string

  // Backend compatibility fields
  first_mes?: string
  mes_example?: string
  creator_notes?: string
  system_prompt?: string
  post_history_instructions?: string
  alternate_greetings?: string[]
  character_book?: any
  creator?: string
  character_version?: string
  extensions?: Record<string, any>
}

export interface Character {
  id: number
  data: CharacterData
}

export type RootStackParamList = {
  ChatList: undefined
  Chat: {
    character: Character
    forceOpenSettings?: boolean
  }
  BrowseCharacters: {
    tab?: 'repository' | 'local'
    repositoryUrl?: string
  }
  CreateCharacter: {
    editCharacter?: Character
  }
  Settings: undefined
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
