import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface UserProfile {
  id: string
  name: string
  bio: string
  messageCount: number
  favoriteCharacter?: string
  dataBank: string
  settings: {
    theme: 'mocha' | 'latte'
    allowNSFW: boolean
    showSystemLogs: boolean
  }
}

interface UserState {
  profiles: UserProfile[]
  activeProfile: string
  isLoading: boolean
  error: string | null
}

const initialState: UserState = {
  profiles: [{
    id: 'default',
    name: 'Main Profile',
    bio: '',
    messageCount: 0,
    dataBank: '',
    settings: {
      theme: 'mocha',
      allowNSFW: false,
      showSystemLogs: true
    }
  }],
  activeProfile: 'default',
  isLoading: false,
  error: null
}

// In a full implementation, these would connect to a backend API
// For now, we'll use local storage
const STORAGE_KEY = 'sillypilot_user_profiles'

export const loadProfiles = createAsyncThunk(
  'user/loadProfiles',
  async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored) as UserProfile[]
      }
      return initialState.profiles
    } catch (error) {
      console.error('Failed to load profiles:', error)
      return initialState.profiles
    }
  }
)

export const saveProfiles = createAsyncThunk(
  'user/saveProfiles',
  async (profiles: UserProfile[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
      return profiles
    } catch (error) {
      console.error('Failed to save profiles:', error)
      throw error
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setActiveProfile: (state, action: PayloadAction<string>) => {
      state.activeProfile = action.payload
    },
    createProfile: (state, action: PayloadAction<Omit<UserProfile, 'id' | 'messageCount'>>) => {
      const newProfile: UserProfile = {
        id: Date.now().toString(),
        messageCount: 0,
        ...action.payload
      }
      state.profiles.push(newProfile)
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile> & { id: string }>) => {
      const index = state.profiles.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.profiles[index] = {
          ...state.profiles[index],
          ...action.payload
        }
      }
    },
    deleteProfile: (state, action: PayloadAction<string>) => {
      // Don't allow deleting the default profile
      if (action.payload === 'default') return
      
      state.profiles = state.profiles.filter(p => p.id !== action.payload)
      if (state.activeProfile === action.payload) {
        state.activeProfile = 'default'
      }
    },
    incrementMessageCount: (state) => {
      const profile = state.profiles.find(p => p.id === state.activeProfile)
      if (profile) {
        profile.messageCount++
      }
    },
    updateProfileSettings: (state, action: PayloadAction<{
      profileId: string
      settings: Partial<UserProfile['settings']>
    }>) => {
      const profile = state.profiles.find(p => p.id === action.payload.profileId)
      if (profile) {
        profile.settings = {
          ...profile.settings,
          ...action.payload.settings
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProfiles.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadProfiles.fulfilled, (state, action) => {
        state.isLoading = false
        state.profiles = action.payload
        // Ensure default profile exists
        if (!state.profiles.find(p => p.id === 'default')) {
          state.profiles.push(initialState.profiles[0])
        }
      })
      .addCase(loadProfiles.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to load profiles'
      })
      .addCase(saveProfiles.fulfilled, (state, action) => {
        state.profiles = action.payload
      })
  }
})

export const {
  setActiveProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  incrementMessageCount,
  updateProfileSettings
} = userSlice.actions

export default userSlice.reducer
