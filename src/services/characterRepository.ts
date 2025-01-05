import axios from 'axios'
import type { Character } from '../navigation/types'

export interface RepositoryMetadata {
  name: string
  description: string
  version: string
  author: string
  website?: string
}

export interface RepositoryCharacter {
  spec: 'chara_card_v2'
  data: {
    name: string
    description: string
    personality: string
    scenario: string
    first_mes: string
    avatar: string
    // V2 fields
    system_prompt?: string
    post_history_instructions?: string
    creator_notes?: string
    character_version?: string
    tags?: string[]
    creator?: string
    alternate_greetings?: string[]
    extensions?: Record<string, any>
  }
  id: string
  created_at: string
  updated_at: string
}

export interface RepositoryResponse {
  metadata: RepositoryMetadata
  characters: RepositoryCharacter[]
}

class CharacterRepositoryService {
  private async fetchRepository(url: string): Promise<RepositoryResponse> {
    try {
      // Validate URL format
      new URL(url)
      
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch repository: ${error.message}`)
      }
      throw error
    }
  }

  private validateRepositoryData(data: any): data is RepositoryResponse {
    // Basic validation of required fields
    if (!data || typeof data !== 'object') return false
    if (!Array.isArray(data.characters)) return false
    if (!data.metadata || typeof data.metadata !== 'object') return false

    // Validate metadata
    const metadata = data.metadata
    if (typeof metadata.name !== 'string') return false
    if (typeof metadata.description !== 'string') return false
    if (typeof metadata.version !== 'string') return false
    if (typeof metadata.author !== 'string') return false

    // Validate each character
    return data.characters.every((char: any) => {
      if (!char || typeof char !== 'object') return false
      if (char.spec !== 'chara_card_v2') return false
      if (!char.data || typeof char.data !== 'object') return false
      if (typeof char.id !== 'string') return false
      if (typeof char.created_at !== 'string') return false
      if (typeof char.updated_at !== 'string') return false

      // Validate required character data fields
      const charData = char.data
      if (typeof charData.name !== 'string') return false
      if (typeof charData.description !== 'string') return false
      if (typeof charData.personality !== 'string') return false
      if (typeof charData.scenario !== 'string') return false
      if (typeof charData.first_mes !== 'string') return false
      if (typeof charData.avatar !== 'string') return false

      // Optional fields validation
      if (charData.system_prompt && typeof charData.system_prompt !== 'string') return false
      if (charData.creator_notes && typeof charData.creator_notes !== 'string') return false
      if (charData.character_version && typeof charData.character_version !== 'string') return false
      if (charData.tags && !Array.isArray(charData.tags)) return false
      if (charData.alternate_greetings && !Array.isArray(charData.alternate_greetings)) return false

      return true
    })
  }

  private convertToCharacter(repoChar: RepositoryCharacter): Character {
    return {
      id: repoChar.id,
      data: {
        name: repoChar.data.name,
        avatar: repoChar.data.avatar,
        personality: repoChar.data.personality,
        description: repoChar.data.description,
        scenario: repoChar.data.scenario,
        firstMessage: repoChar.data.first_mes,
        systemPrompt: repoChar.data.system_prompt || '',
        creatorNotes: repoChar.data.creator_notes || `Created: ${new Date(repoChar.created_at).toLocaleDateString()}
Updated: ${new Date(repoChar.updated_at).toLocaleDateString()}`,
        tags: repoChar.data.tags || [],
        status: 'online',
        mood: 'neutral',
        mes_example: '',
        creator: repoChar.data.creator || '',
        character_version: repoChar.data.character_version || '1.0.0'
      }
    }
  }

  async loadRepository(url: string): Promise<{
    metadata: RepositoryMetadata
    characters: Character[]
  }> {
    try {
      const data = await this.fetchRepository(url)
      
      if (!this.validateRepositoryData(data)) {
        throw new Error('Invalid repository data format')
      }

      return {
        metadata: data.metadata,
        characters: data.characters.map(char => this.convertToCharacter(char))
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Repository error: ${error.message}`)
      }
      throw error
    }
  }

  async searchCharacters(url: string, query: string): Promise<Character[]> {
    try {
      const searchUrl = `${url}/search?q=${encodeURIComponent(query)}`
      const response = await axios.get(searchUrl)
      
      if (!Array.isArray(response.data.characters)) {
        throw new Error('Invalid search response format')
      }

      return response.data.characters.map((char: RepositoryCharacter) => 
        this.convertToCharacter(char)
      )
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Search error: ${error.message}`)
      }
      throw error
    }
  }

  async getCategories(url: string): Promise<string[]> {
    try {
      const response = await axios.get(`${url}/categories`)
      
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid categories response format')
      }

      return response.data
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch categories: ${error.message}`)
      }
      throw error
    }
  }
}

export const characterRepositoryService = new CharacterRepositoryService()
export default characterRepositoryService