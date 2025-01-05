import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Chat, Settings } from './api'
import type { Character } from '../navigation/types'

interface UserProfile {
  id: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

interface SystemLog {
  timestamp: string
  message: string
  type: 'info' | 'warning' | 'error'
  metadata?: Record<string, any>
}

const STORAGE_KEYS = {
  SETTINGS: '@sillypilot/settings',
  CHATS: '@sillypilot/chats',
  CHARACTERS: '@sillypilot/characters',
  ONBOARDING: '@sillypilot/onboarding',
  THEME: '@sillypilot/theme',
  PROFILES: '@sillypilot/profiles',
  SYSTEM_LOGS: '@sillypilot/system_logs'
}

export class StorageService {
  // Settings
  async getSettings(): Promise<Settings | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS)
      return data ? JSON.parse(data) : null
    } catch (err) {
      console.error('Failed to get settings:', err)
      return null
    }
  }

  async saveSettings(settings: Settings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    }
  }

  // Characters
  async getCharacters(): Promise<Character[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHARACTERS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to get characters:', error)
      return []
    }
  }

  async saveCharacters(characters: Character[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters))
    } catch (error) {
      console.error('Failed to save characters:', error)
      throw error
    }
  }

  async addCharacter(character: Character): Promise<void> {
    try {
      const characters = await this.getCharacters()
      characters.push(character)
      await this.saveCharacters(characters)
    } catch (error) {
      console.error('Failed to add character:', error)
      throw error
    }
  }

  async updateCharacter(character: Character): Promise<void> {
    try {
      const characters = await this.getCharacters()
      const index = characters.findIndex(c => c.id === character.id)
      if (index !== -1) {
        characters[index] = character
        await this.saveCharacters(characters)
      }
    } catch (error) {
      console.error('Failed to update character:', error)
      throw error
    }
  }

  async deleteCharacter(character_id: number): Promise<void> {
    try {
      const characters = await this.getCharacters()
      const filtered = characters.filter(c => c.id !== character_id)
      await this.saveCharacters(filtered)
    } catch (error) {
      console.error('Failed to delete character:', error)
      throw error
    }
  }

  // Chats
  async getChats(): Promise<Chat[]> {
    try {
      
      // AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify([])); // testing 

      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHATS)
      console.log("getChats data-----------", data)
      return data ? JSON.parse(data) : []
    } catch (err) {
      console.error('Failed to get chats:', err)
      return []
    }
  }

  async saveChats(chats: Chat[]): Promise<void> {

    try {
      console.log('==================================chats on save', typeof chats, typeof JSON.stringify(chats));
      const updatedChats = chats?.map(chat => (
        {
          ...chat,
          data: { ...chat.data, avatar: '' }
        }
      ));

      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updatedChats)) // chats
    } catch (error) {
      console.error('Failed to save chats:', error)
      throw error
    }
  }

  async addChat(chat: Chat): Promise<void> {
    try {
      const chats = await this.getChats()
      chats.push(chat)
      await this.saveChats(chats)
    } catch (error) {
      console.error('Failed to add chat:', error)
      throw error
    }
  }

  async updateChat(chat: Chat): Promise<void> {
    try {
      const chats = await this.getChats()
      const index = chats.findIndex(c => c.id === chat.id)
      if (index !== -1) {
        chats[index] = chat
        await this.saveChats(chats)
      }
    } catch (error) {
      console.error('Failed to update chat:', error)
      throw error
    }
  }

  async deleteChat(chat_id: number): Promise<void> {
    try {
      const chats = await this.getChats()
      const filtered = chats.filter(c => c.id !== chat_id)
      await this.saveChats(filtered)
    } catch (error) {
      console.error('Failed to delete chat:', error)
      throw error
    }
  }

  // User Profiles
  async getProfiles(): Promise<UserProfile[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILES)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to get profiles:', error)
      return []
    }
  }

  async saveProfiles(profiles: UserProfile[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles))
    } catch (error) {
      console.error('Failed to save profiles:', error)
      throw error
    }
  }

  async getActiveProfile(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.THEME)
    } catch (err) {
      console.error('Failed to get theme:', err)
      return null
    }
  }

  async saveTheme(theme: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme)
    } catch (err) {
      console.error('Failed to save theme:', err)
      throw err
    }
  }

  // System Logs
  async getSystemLogs(): Promise<SystemLog[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SYSTEM_LOGS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to get system logs:', error)
      return []
    }
  }

  async addSystemLog(log: SystemLog): Promise<void> {
    try {
      const logs = await this.getSystemLogs()
      logs.push(log)
      // Keep only the last 100 logs
      const trimmedLogs = logs.slice(-100)
      await AsyncStorage.setItem(STORAGE_KEYS.SYSTEM_LOGS, JSON.stringify(trimmedLogs))
    } catch (error) {
      console.error('Failed to add system log:', error)
      throw error
    }
  }

  // Onboarding
  async getOnboardingStatus(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING)
      return data === 'completed'
    } catch (error) {
      console.error('Failed to get onboarding status:', error)
      return false
    }
  }

  async completeOnboarding(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'completed')
    } catch (err) {
      console.error('Failed to complete onboarding:', err)
      throw err
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear()
    } catch (err) {
      console.error('Failed to clear storage:', err)
      throw err
    }
  }
}

export const storageService = new StorageService()
export default storageService
export type { UserProfile, SystemLog }
