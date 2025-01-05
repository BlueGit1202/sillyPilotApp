import axios, { AxiosResponse, AxiosError } from 'axios'
import type { Character } from '../navigation/types'
import type { ThemeMode } from '../types/theme'
import NetInfo from '@react-native-community/netinfo'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'

// Get the backend URL from environment variable
const getBackendUrl = async () => {
  const defaultUrl = process.env.EXPO_PUBLIC_BACKEND_URL
  console.log('Default backend URL:', defaultUrl)

  // For web platform, use the URL as is
  if (Platform.OS === 'web') {
    console.log('Web platform detected, using URL:', defaultUrl)
    return defaultUrl
  }

  // For native platforms, handle localhost conversion
  const netInfo = await NetInfo.fetch()
  console.log('NetInfo state:', netInfo)

  // If we're on a physical device and using localhost, try to get the actual IP
  if (defaultUrl.includes('localhost') && netInfo.type === 'wifi') {
    const parts = defaultUrl.split(':')
    // Try to use the device's IP
    const details = netInfo.details as { ipAddress?: string; subnet?: string; gateway?: string }
    if (details?.gateway) {
      const gatewayUrl = `http://${details.gateway}:${parts[2] || '3000'}`
      console.log('Using gateway URL:', gatewayUrl)
      return gatewayUrl
    }
  }

  console.log('Using default URL:', defaultUrl)
  return defaultUrl
}

// Create axios instance with dynamic base URL
const createApi = async () => {
  const baseURL = await getBackendUrl()
  console.log('Creating API instance with base URL:', baseURL)
  
  return axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true // Enable credentials for CORS
  })
}

// Response interceptor for error handling
const setupInterceptors = (api: ReturnType<typeof axios.create>) => {
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      // console.log('API Response:', {
      //   url: response.config.url,
      //   status: response.status,
      //   data: response.data
      // })
      return response
    },
    (error: AxiosError<{ error?: string }>) => {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        console.error('API Error:', {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url
        })
        throw new Error(error.response.data?.error || 'Server error')
      } else if (error.request) {
        // Request was made but no response received
        console.error('Network Error:', {
          request: error.request,
          url: error.config?.url,
          baseURL: error.config?.baseURL
        })
        throw new Error(`Network error - cannot reach server at ${error.config?.baseURL}`)
      } else {
        // Something else happened while setting up the request
        console.error('Request Error:', error.message)
        throw new Error('Request failed - please try again')
      }
    }
  )
  return api
}

export interface APIResponse<T> {
  success: boolean
  data: T
  error?: string
}

export interface Settings {
  aiProvider: 'openrouter' | 'sillytavern'
  sillyTavernIp: string
  sillyTavernPort: string
  openRouterApiKey: string
  theme: ThemeMode
  showFullResponses: boolean
  useSystemTheme?: boolean
}

export interface Chat {
  id: number
  character_id: number,
  name: string
  messages: Message[]
  data: {
    name: string
    avatar?: string
    personality: string
    description: string
    scenario?: string
    system_prompt?: string
    mes_example?: string
  }
  last_message?: string
  last_message_time?: string
}

export interface Message {
  id: string
  chat_id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  image?: string
}

class ApiService {
  private api: ReturnType<typeof axios.create> | null = null
  private initPromise: Promise<void> | null = null

  private async initialize() {
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          this.api = await createApi()
          setupInterceptors(this.api)
        } catch (error) {
          console.error('Failed to initialize API service:', error)
          throw error
        }
      })()
    }
    return this.initPromise
  }

  private async getApi() {
    if (!this.api) {
      await this.initialize()
    }
    if (!this.api) {
      throw new Error('API service not initialized')
    }
    return this.api
  }

  // Test connection
  async testConnection() {
    try {
      const api = await this.getApi()
      const response = await api.get<APIResponse<{ message: string; timestamp: string }>>('/api/test')
      console.log('Server test response:', response.data)
      return response.data.data
    } catch (error) {
      console.error('Server test failed:', error)
      throw error
    }
  }

  // Server status
  async checkStatus() {
    try {
      const api = await this.getApi()
      console.log('Checking server status...')
      const response = await api.get<APIResponse<{ status: 'online' | 'offline' }>>('/api/status')
      console.log('Server status response:', response.data)
      return response.data.data
    } catch (error) {
      console.error('Server status check failed:', error)
      throw error
    }
  }

  // Settings
  async getSettings() {
    const api = await this.getApi()
    const response = await api.get<APIResponse<Settings>>('/api/settings')
    return response.data.data
  }

  async updateSettings(settings: Settings) {
    const api = await this.getApi()
    const response = await api.post<APIResponse<Settings>>('/api/settings', settings)
    return response.data.data
  }

  // Characters
  async getCharacters() {
    const api = await this.getApi()
    const response = await api.get<APIResponse<Character[]>>('/api/characters')
    // console.log("-------------------------",response);
    return response.data.data
  }

  async createCharacter(character: Omit<Character, 'id'>) {
    const api = await this.getApi()
    // Transform the frontend character structure to match backend expectations
    const backendCharacter = {
      character: JSON.stringify({
        name: character.data.name,
        data: character.data
      })
    }
    // console.log("sdfsdfsdsdsdsssssssssssssssss----",backendCharacter)
    const response = await api.post<APIResponse<any>>('/api/characters', backendCharacter)
    console.log("reasdfasdfadfsdf",response.data.data)
    // Transform the backend response back to frontend structure
    return {
      id: response.data.data.id.toString(),
      data: response.data.data.character
    } as Character
  }

  async updateCharacter(character_id: number, character: Omit<Character, 'id'>) {
    const api = await this.getApi()
    // Transform the frontend character structure to match backend expectations
    const backendCharacter = {
      character: JSON.stringify({
        name: character.data.name,
        data: character.data
      })
    }
    const response = await api.put<APIResponse<any>>(`/api/characters/${character_id}`, backendCharacter)
    // Transform the backend response back to frontend structure
    return {
      id: response.data.data.id.toString(),
      data: response.data.data.characterData
    } as Character
  }

  async uploadCharacterImage(formData: FormData) {
    const api = await this.getApi()
    const response = await api.post<APIResponse<{ avatar: string }>>('/api/characters/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      transformRequest: (data) => data // Prevent axios from trying to transform FormData
    })
    return response.data.data
  }

  async deleteCharacter(character_id: number) {
    const api = await this.getApi()
    const response = await api.delete<APIResponse<void>>(`/api/characters/${character_id}`)
    return response.data.data
  }

  // Chats
  async getChats() {
    const api = await this.getApi()
    const response = await api.get<APIResponse<Chat[]>>('/api/chats');
    // console.log('get chats', response.data);

    return response.data.data
  }

  async createChat(chat: Omit<Chat, 'id' | 'messages' | 'data'>) {
    const api = await this.getApi()
    const response = await api.post<APIResponse<Chat>>('/api/chats', chat)
    return response.data.data
  }

  async getChat(chat_id: number) {
    const api = await this.getApi()
    const response = await api.get<APIResponse<Chat>>(`/api/chats/${chat_id}`)
    return response.data.data
  }

  async deleteChat(chat_id: number) {
    const api = await this.getApi()
    const response = await api.delete<APIResponse<void>>(`/api/chats/${chat_id}`)
    return response.data.data
  }

  async sendMessage(chat_id: number, content: string, image?: string) {
    const api = await this.getApi()
    const response = await api.post<APIResponse<{
      userMessage: Message
      assistantMessage: Message
    }>>(`/api/chats/${chat_id}/messages`, {
      content,
      image
    })
    return response.data.data
  }

  async updateMessage(chat_id: number, messageId: string, content: string) {
    const api = await this.getApi()
    const response = await api.put<APIResponse<Message>>(`/api/chats/${chat_id}/messages/${messageId}`, {
      content
    })
    return response.data.data
  }

  // System
  async factoryReset() {
    const api = await this.getApi()
    const response = await api.post<APIResponse<{
      message: string
      onboardingStatus: { completed: boolean; current_step: number }
    }>>('/api/factory-reset')
    return response.data.data
  }

  async checkDatabase() {
    const api = await this.getApi()
    const response = await api.get<APIResponse<{
      isEmpty: boolean
      onboardingStatus: { completed: boolean; current_step: number }
    }>>('/api/check-database')
    return response.data.data
  }
}

export const apiService = new ApiService()
export default apiService
