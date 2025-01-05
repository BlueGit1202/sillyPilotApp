import type { ThemeMode } from './theme'

// Navigation Types
export interface RootStackParamList {
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

// Character Types
export interface Character {
  id: number
  data: {
    name: string
    avatar: string
    description: string
    personality: string
    scenario: string
    firstMessage: string
    systemPrompt: string
    creatorNotes: string
    tags: string[]
    status: 'online' | 'offline'
    mood: string
  }
}

// Settings Types
export interface Settings {
  aiProvider: 'openrouter' | 'sillytavern'
  sillyTavernIp: string
  sillyTavernPort: string
  openRouterApiKey: string
  theme: ThemeMode
  showFullResponses: boolean
  useSystemTheme?: boolean
}

// API Response Types
export interface APIErrorResponse {
  success: false
  error: string
  status?: number
}

export interface APISuccessResponse<T> {
  success: true
  data: T
}

export type APIResponse<T> = APISuccessResponse<T> | APIErrorResponse

// Event Types
export interface SyncEvent {
  type: 'sync'
  status: 'start' | 'complete' | 'error'
  timestamp: string
  error?: string
}

export interface MessageEvent {
  type: 'message'
  status: 'sent' | 'received' | 'error'
  timestamp: string
  messageId: string
  error?: string
}

export type AppEvent = SyncEvent | MessageEvent

// System Types
export interface SystemLog {
  timestamp: string
  message: string
  type: 'info' | 'warning' | 'error'
  metadata?: Record<string, any>
}

export interface AppMetrics {
  messageCount: number
  characterCount: number
  lastSyncTime: string | null
  uptime: number
  memoryUsage: number
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type WithTimestamp = {
  createdAt: string
  updatedAt: string
}

export type WithOptionalTimestamp = {
  createdAt?: string
  updatedAt?: string
}

// Re-export theme types
export * from './theme'
