import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Settings } from '../services'
import { apiService, storageService } from '../services'
import { setSettings } from '../store/slices/appSlice'
import type { RootState, AppDispatch } from '../store'

export function useSettings() {
  const dispatch = useDispatch<AppDispatch>()
  const settings = useSelector((state: RootState) => state.app.settings)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load settings from storage and API
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true)
      setError(null)
      try {
        // Try to load from local storage first
        const localSettings = await storageService.getSettings()
        if (localSettings) {
          dispatch(setSettings(localSettings))
        }

        // Then try to sync with server
        const serverSettings = await apiService.getSettings()
        if (serverSettings) {
          dispatch(setSettings(serverSettings))
          // Update local storage with server settings
          await storageService.saveSettings(serverSettings)
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
        setError(err instanceof Error ? err.message : 'Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [dispatch])

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    setError(null)
    try {
      const updatedSettings = { ...settings, ...newSettings }
      
      // Update Redux store
      dispatch(setSettings(updatedSettings))
      
      // Save to local storage
      await storageService.saveSettings(updatedSettings)
      
      // Sync with server
      await apiService.updateSettings(updatedSettings)
    } catch (err) {
      console.error('Failed to update settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      throw err
    }
  }, [settings, dispatch])

  // Reset settings to defaults
  const resetSettings = useCallback(async () => {
    setError(null)
    try {
      const defaultSettings: Settings = {
        aiProvider: 'openrouter',
        sillyTavernIp: '',
        sillyTavernPort: '',
        openRouterApiKey: '',
        theme: 'mocha',
        showFullResponses: false
      }

      // Update Redux store
      dispatch(setSettings(defaultSettings))
      
      // Save to local storage
      await storageService.saveSettings(defaultSettings)
      
      // Sync with server
      await apiService.updateSettings(defaultSettings)
    } catch (err) {
      console.error('Failed to reset settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset settings')
      throw err
    }
  }, [dispatch])

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings
  }
}
