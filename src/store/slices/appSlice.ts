import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiService, storageService } from '../../services'
import type { ThemeMode } from '../../types/theme'
import type { RootState } from '../index'

export interface Settings {
  aiProvider: 'openrouter' | 'sillytavern'
  sillyTavernIp: string
  sillyTavernPort: string
  openRouterApiKey: string
  theme: ThemeMode
  showFullResponses: boolean
  useSystemTheme?: boolean
}

interface AppState {
  settings: Settings
  isInitialized: boolean
  isOnline: boolean
  isLoading: boolean
  error: string | null
  onboardingStatus: {
    completed: boolean
    currentStep: number
  }
  serverStatus: {
    isOnline: boolean
    lastChecked: string | null
  }
  notifications: {
    hasUnread: boolean
    lastChecked: string | null
  }
  systemLogs: Array<{
    timestamp: string
    message: string
    type: 'info' | 'warning' | 'error'
    metadata?: Record<string, any>
  }>
}

const initialState: AppState = {
  settings: {
    aiProvider: 'openrouter',
    sillyTavernIp: 'localhost',
    sillyTavernPort: '8000',
    openRouterApiKey: '',
    theme: 'mocha',
    showFullResponses: false,
    useSystemTheme: true
  },
  isInitialized: false,
  isOnline: true,
  isLoading: false,
  error: null,
  onboardingStatus: {
    completed: false,
    currentStep: 0
  },
  serverStatus: {
    isOnline: false,
    lastChecked: null
  },
  notifications: {
    hasUnread: false,
    lastChecked: null
  },
  systemLogs: []
}

// Async thunks
export const initializeApp = createAsyncThunk(
  'app/initialize',
  async () => {
    // Try to load settings from local storage first
    const localSettings = await storageService.getSettings()
    if (localSettings) {
      return localSettings
    }

    // If no local settings, try to get from server
    const serverSettings = await apiService.getSettings()
    
    // Save server settings to local storage
    await storageService.saveSettings(serverSettings)
    
    return serverSettings
  }
)

export const updateSettings = createAsyncThunk(
  'app/updateSettings',
  async (settings: Settings) => {
    // Update server settings
    const updatedSettings = await apiService.updateSettings(settings)
    
    // Save to local storage
    await storageService.saveSettings(updatedSettings)
    
    return updatedSettings
  }
)

export const checkServerStatus = createAsyncThunk(
  'app/checkServerStatus',
  async () => {
    console.log('Checking server status...')
    try {
      const status = await apiService.checkStatus()
      console.log('Server status response:', status)
      return status
    } catch (error) {
      console.error('Server status check failed:', error)
      throw error
    }
  }
)

export const factoryReset = createAsyncThunk(
  'app/factoryReset',
  async () => {
    const result = await apiService.factoryReset()
    return result
  }
)

export const checkDatabase = createAsyncThunk(
  'app/checkDatabase',
  async () => {
    const result = await apiService.checkDatabase()
    return {
      ...result,
      onboardingStatus: {
        completed: result.onboardingStatus.completed,
        currentStep: result.onboardingStatus.current_step
      }
    }
  }
)

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Settings>) => {
      state.settings = action.payload
    },
    setOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload
    },
    addSystemLog: (state, action: PayloadAction<{
      message: string
      type: 'info' | 'warning' | 'error'
      metadata?: Record<string, any>
    }>) => {
      state.systemLogs.push({
        timestamp: new Date().toISOString(),
        ...action.payload
      })
    },
    clearSystemLogs: (state) => {
      state.systemLogs = []
    },
    setHasUnreadNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications.hasUnread = action.payload
      state.notifications.lastChecked = new Date().toISOString()
    },
    completeOnboarding: (state) => {
      state.onboardingStatus.completed = true
      state.onboardingStatus.currentStep = 0
    },
    setOnboardingStep: (state, action: PayloadAction<number>) => {
      state.onboardingStatus.currentStep = action.payload
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
      // Initialize app
      .addCase(initializeApp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.isLoading = false
        state.isInitialized = true
        state.settings = action.payload
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to initialize app'
      })
      
      // Update settings
      .addCase(updateSettings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isLoading = false
        state.settings = action.payload
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to update settings'
      })

      // Check server status
      .addCase(checkServerStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(checkServerStatus.fulfilled, (state, action) => {
        console.log('Server status check fulfilled:', action.payload)
        state.isLoading = false
        state.serverStatus = {
          isOnline: action.payload.status === 'online',
          lastChecked: new Date().toISOString()
        }
        // Clear error if server is online
        if (action.payload.status === 'online') {
          state.error = null
        }
      })
      .addCase(checkServerStatus.rejected, (state, action) => {
        console.error('Server status check rejected:', action.error)
        state.isLoading = false
        state.serverStatus.isOnline = false
        state.serverStatus.lastChecked = new Date().toISOString()
        state.error = action.error.message || 'Failed to check server status'
      })
      
      // Factory reset
      .addCase(factoryReset.fulfilled, (state) => {
        return {
          ...initialState,
          isInitialized: true
        }
      })
      
      // Check database
      .addCase(checkDatabase.fulfilled, (state, action) => {
        state.onboardingStatus = action.payload.onboardingStatus
      })
  }
})

// Selectors
export const selectSettings = (state: RootState) => state.app.settings
export const selectIsInitialized = (state: RootState) => state.app.isInitialized
export const selectIsOnline = (state: RootState) => state.app.isOnline
export const selectIsLoading = (state: RootState) => state.app.isLoading
export const selectError = (state: RootState) => state.app.error
export const selectOnboardingStatus = (state: RootState) => state.app.onboardingStatus
export const selectServerStatus = (state: RootState) => state.app.serverStatus
export const selectNotifications = (state: RootState) => state.app.notifications
export const selectSystemLogs = (state: RootState) => state.app.systemLogs

export const {
  setSettings,
  setOnline,
  addSystemLog,
  clearSystemLogs,
  setHasUnreadNotifications,
  completeOnboarding,
  setOnboardingStep,
  setError,
  clearError
} = appSlice.actions

export default appSlice.reducer
