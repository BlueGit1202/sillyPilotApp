import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { Character } from '../../navigation/types'
import { apiService, storageService } from '../../services'
import type { RootState } from '../index'

interface CharacterState {
  characters: Character[]
  currentCharacter: Character | null
  isLoading: boolean
  error: string | null
  lastSyncTime: string | null
}

const initialState: CharacterState = {
  characters: [],
  currentCharacter: null,
  isLoading: false,
  error: null,
  lastSyncTime: null
}

// Async thunks
export const fetchCharacters = createAsyncThunk(
  'character/fetchCharacters',
  async () => {
    const response = await apiService.getCharacters()
    return response
  }
)

export const uploadCharacterImage = createAsyncThunk(
  'character/uploadImage',
  async (formData: FormData) => {
    const response = await apiService.uploadCharacterImage(formData)
    return response
  }
)

export const createCharacter = createAsyncThunk(
  'character/createCharacter',
  async (character: Omit<Character, 'id'>) => {
    const response = await apiService.createCharacter(character)
    return response
  }
)

export const updateCharacter = createAsyncThunk(
  'character/updateCharacter',
  async ({ id, character }: { id: number; character: Omit<Character, 'id'> }) => {
    const response = await apiService.updateCharacter(id, character)
    return response
  }
)

export const deleteCharacter = createAsyncThunk(
  'character/deleteCharacter',
  async (character_id: number) => {
    await apiService.deleteCharacter(character_id)
    return character_id
  }
)

export const syncCharacters = createAsyncThunk(
  'character/syncCharacters',
  async (_, { getState }) => {
    const state = getState() as RootState
    const serverCharacters = await apiService.getCharacters()
    
    // Merge local and server characters
    const mergedCharacters = serverCharacters.map(serverChar => {
      const localChar = state.character.characters.find(c => c.id === serverChar.id)
      if (localChar) {
        return {
          ...serverChar,
          data: {
            ...serverChar.data,
            ...localChar.data
          }
        }
      }
      return serverChar
    })

    // Update local storage
    await storageService.saveCharacters(mergedCharacters)

    return mergedCharacters
  }
)

const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    setCharacters: (state, action: PayloadAction<Character[]>) => {
      state.characters = action.payload
      state.lastSyncTime = new Date().toISOString()
    },
    addCharacter: (state, action: PayloadAction<Character>) => {
      state.characters.push(action.payload)
    },
    updateCharacterInStore: (state, action: PayloadAction<Character>) => {
      const index = state.characters.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.characters[index] = action.payload
      }
    },
    removeCharacter: (state, action: PayloadAction<number>) => {
      state.characters = state.characters.filter(c => c.id !== action.payload)
      if (state.currentCharacter?.id === action.payload) {
        state.currentCharacter = null
      }
    },
    setCurrentCharacter: (state, action: PayloadAction<Character | null>) => {
      state.currentCharacter = action.payload
    },
    updateCharacterMood: (state, action: PayloadAction<{ character_id: number; mood: string }>) => {
      const character = state.characters.find(c => c.id === action.payload.character_id)
      if (character) {
        character.data.mood = action.payload.mood
      }
      if (state.currentCharacter?.id === action.payload.character_id) {
        state.currentCharacter.data.mood = action.payload.mood
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch characters
      .addCase(fetchCharacters.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCharacters.fulfilled, (state, action) => {
        state.isLoading = false
        state.characters = action.payload
        state.lastSyncTime = new Date().toISOString()
      })
      .addCase(fetchCharacters.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch characters'
      })
      
      // Upload image
      .addCase(uploadCharacterImage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadCharacterImage.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(uploadCharacterImage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to upload image'
      })
      
      // Create character
      .addCase(createCharacter.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCharacter.fulfilled, (state, action) => {
        state.isLoading = false
        state.characters.push(action.payload)
        state.currentCharacter = action.payload
      })
      .addCase(createCharacter.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to create character'
      })
      
      // Update character
      .addCase(updateCharacter.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCharacter.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.characters.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.characters[index] = action.payload
        }
        if (state.currentCharacter?.id === action.payload.id) {
          state.currentCharacter = action.payload
        }
      })
      .addCase(updateCharacter.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to update character'
      })
      
      // Delete character
      .addCase(deleteCharacter.fulfilled, (state, action) => {
        state.characters = state.characters.filter(c => c.id !== action.payload)
        if (state.currentCharacter?.id === action.payload) {
          state.currentCharacter = null
        }
      })
      
      // Sync characters
      .addCase(syncCharacters.fulfilled, (state, action) => {
        state.characters = action.payload
        state.lastSyncTime = new Date().toISOString()
      })
  }
})

// Selectors
export const selectCharacters = (state: RootState) => state.character.characters
export const selectCurrentCharacter = (state: RootState) => state.character.currentCharacter
export const selectIsLoading = (state: RootState) => state.character.isLoading
export const selectError = (state: RootState) => state.character.error
export const selectLastSyncTime = (state: RootState) => state.character.lastSyncTime

export const {
  setCharacters,
  addCharacter,
  updateCharacterInStore,
  removeCharacter,
  setCurrentCharacter,
  setError,
  clearError
} = characterSlice.actions

export default characterSlice.reducer
