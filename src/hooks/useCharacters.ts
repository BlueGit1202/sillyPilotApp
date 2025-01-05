import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Character } from '../navigation/types'
import { apiService, characterCardService } from '../services'
import { 
  setCharacters,
  addCharacter,
  updateCharacter as updateCharacterAction,
  removeCharacter,
  setCurrentCharacter,
  uploadCharacterImage,
  createCharacter as createCharacterAction
} from '../store/slices/characterSlice'
import type { RootState, AppDispatch } from '../store'
import * as FileSystem from 'expo-file-system'
import { useSync } from './useSync'

export function useCharacters() {
  const dispatch = useDispatch<AppDispatch>()
  const characters = useSelector((state: RootState) => state.character.characters)
  const currentCharacter = useSelector((state: RootState) => state.character.currentCharacter)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isOnline } = useSync()

  // Load characters
  const loadCharacters = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiService.getCharacters()
      dispatch(setCharacters(response))
    } catch (err) {
      console.error('Failed to load characters:', err)
      setError(err instanceof Error ? err.message : 'Failed to load characters')
    } finally {
      setIsLoading(false)
    }
  }, [dispatch, isOnline])

  // Create character
  const createCharacter = useCallback(async (character: Omit<Character, 'id'>) => {
    setError(null)
    try {
      const response = await dispatch(createCharacterAction(character)).unwrap()
      dispatch(setCurrentCharacter(response))
      return response
    } catch (err) {
      console.error('Failed to create character:', err)
      setError(err instanceof Error ? err.message : 'Failed to create character')
      throw err
    }
  }, [dispatch])

  // Update character
  const updateCharacter = useCallback(async (id: number, character: Omit<Character, 'id'>) => {
    setError(null)
    try {
      const response = await dispatch(updateCharacterAction({ id, character })).unwrap()
      if (currentCharacter?.id === id) {
        dispatch(setCurrentCharacter(response))
      }
      return response
    } catch (err) {
      console.error('Failed to update character:', err)
      setError(err instanceof Error ? err.message : 'Failed to update character')
      throw err
    }
  }, [currentCharacter, dispatch])

  // Delete character
  const deleteCharacter = useCallback(async (character_id: number) => {
    setError(null)
    try {
      await dispatch(removeCharacter(character_id))
      if (currentCharacter?.id === character_id) {
        dispatch(setCurrentCharacter(null))
      }
    } catch (err) {
      console.error('Failed to delete character:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete character')
      throw err
    }
  }, [currentCharacter, dispatch])

  // Import character card
  const importCharacterCard = useCallback(async (uri: string) => {
    setError(null)
    try {
      const card = await characterCardService.parseCharacterCard(uri)
      if (!card) {
        throw new Error('Failed to parse character card')
      }

      // Get image info
      const info = await FileSystem.getInfoAsync(card.avatar_uri)
      if (!info.exists) {
        throw new Error('Image file not found')
      }

      // Upload avatar image
      const formData = new FormData()
      formData.append('avatar', {
        uri: card.avatar_uri,
        type: 'image/png',
        name: 'avatar.png',
        size: info.size
      } as any)

      const uploadResponse = await dispatch(uploadCharacterImage(formData)).unwrap()
      const character = characterCardService.createCharacterFromCard({
        ...card,
        avatar_uri: uploadResponse.avatar
      })

      const response = await createCharacter(character)
      return response
    } catch (err) {
      console.error('Failed to import character:', err)
      setError(err instanceof Error ? err.message : 'Failed to import character')
      throw err
    }
  }, [createCharacter, dispatch])

  // Export character card
  const exportCharacterCard = useCallback(async (character: Character) => {
    setError(null)
    try {
      const cardPath = await characterCardService.exportCharacterCard(character)
      return cardPath
    } catch (err) {
      console.error('Failed to export character:', err)
      setError(err instanceof Error ? err.message : 'Failed to export character')
      throw err
    }
  }, [])

  return {
    characters,
    currentCharacter,
    isLoading,
    error,
    loadCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    importCharacterCard,
    exportCharacterCard
  }
}
