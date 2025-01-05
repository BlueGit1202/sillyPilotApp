import { useState, useEffect, useCallback } from 'react'
import { useColorScheme } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { THEME_NAMES } from '../types/theme'
import { storageService } from '../services'
import { getTheme } from '../utils/theme'
import type { ThemeTokens, ThemeMode } from '../types/theme'
import type { RootState, AppDispatch } from '../store'
import { setSettings } from '../store/slices/appSlice'

export function useTheme() {
  const dispatch = useDispatch<AppDispatch>()
  const systemColorScheme = useColorScheme()
  const settings = useSelector((state: RootState) => state.app.settings)
  const [theme, setTheme] = useState<ThemeTokens>(
    getTheme(settings.theme === THEME_NAMES.SYSTEM 
      ? (systemColorScheme === 'dark' ? THEME_NAMES.MOCHA : THEME_NAMES.LATTE)
      : settings.theme
    )
  )

  // Handle system theme changes
  useEffect(() => {
    if (settings.theme === THEME_NAMES.SYSTEM) {
      const newTheme = systemColorScheme === 'dark' ? THEME_NAMES.MOCHA : THEME_NAMES.LATTE
      setTheme(getTheme(newTheme))
    }
  }, [systemColorScheme, settings.theme])

  // Switch theme
  const switchTheme = useCallback(async (newTheme: ThemeMode) => {
    try {
      const updatedSettings = {
        ...settings,
        theme: newTheme,
        useSystemTheme: newTheme === THEME_NAMES.SYSTEM
      }

      // Update Redux store
      dispatch(setSettings(updatedSettings))

      // Save to storage
      await storageService.saveSettings(updatedSettings)

      // Update theme tokens
      if (newTheme === THEME_NAMES.SYSTEM) {
        const systemTheme = systemColorScheme === 'dark' ? THEME_NAMES.MOCHA : THEME_NAMES.LATTE
        setTheme(getTheme(systemTheme))
      } else {
        setTheme(getTheme(newTheme))
      }
    } catch (error) {
      console.error('Failed to switch theme:', error)
    }
  }, [dispatch, settings, systemColorScheme])

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = settings.theme === THEME_NAMES.MOCHA ? THEME_NAMES.LATTE : THEME_NAMES.MOCHA
    switchTheme(newTheme)
  }, [settings.theme, switchTheme])

  // Use system theme
  const useSystemTheme = useCallback(() => {
    switchTheme(THEME_NAMES.SYSTEM)
  }, [switchTheme])

  return {
    theme,
    currentTheme: settings.theme,
    systemTheme: systemColorScheme,
    isDark: settings.theme === THEME_NAMES.MOCHA || 
            (settings.theme === THEME_NAMES.SYSTEM && systemColorScheme === 'dark'),
    switchTheme,
    toggleTheme,
    useSystemTheme
  }
}
