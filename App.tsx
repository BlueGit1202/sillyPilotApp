import React, { useEffect, useState } from 'react'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme, Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TamaguiProvider, Theme, YStack, Text, Button } from 'tamagui'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as NavigationBar from 'expo-navigation-bar'
import { Provider, useSelector } from 'react-redux'
import { store } from './src/store'
import { useSync } from './src/hooks/useSync'
import { selectServerStatus } from './src/store/slices/appSlice'

import config from './tamagui.config'
import { RootStackParamList } from './src/navigation/types'
import { Toast } from './src/components/Toast'
import { LoadingScreen } from './src/components/LoadingScreen'
import { ChatListScreen } from './src/screens/chat/ChatListScreen'
import { ChatScreen } from './src/screens/chat/ChatScreen'
import { CreateCharacterScreen } from './src/screens/character/CreateCharacterScreen'
import { BrowseCharactersScreen } from './src/screens/character/BrowseCharactersScreen'
import { SettingsScreen } from './src/screens/settings/SettingsScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

const AppContent = () => {
  const colorScheme = useColorScheme()
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [error, setError] = useState<{ type: 'error' | 'warning' | 'info', message: string } | null>(null)
  const { isOnline, checkConnection } = useSync()
  const serverStatus = useSelector(selectServerStatus)

  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    'JetBrains-Mono': require('./assets/fonts/JetBrainsMono-Regular.ttf'),
  })

  useEffect(() => {
    async function initializeApp() {
      try {
        // Set navigation bar color for native platforms
        if (Platform.OS !== 'web') {
          await NavigationBar.setBackgroundColorAsync('#1e1e2e')
          await NavigationBar.setButtonStyleAsync('light')
        }

        // Check network and server status
        if (!isOnline && Platform.OS !== 'web') {
          setInitError('No internet connection. Please check your network settings.')
          setIsInitializing(false)
          return
        }

        console.log('Checking server connection...')
        const isConnected = await checkConnection()
        console.log('Server connection status:', isConnected)
        
        if (!isConnected) {
          const errorMessage = Platform.OS === 'web'
            ? 'Unable to connect to the server. Please make sure the server is running at the correct URL.'
            : 'Unable to connect to the server. Please make sure the server is running and you have a stable internet connection.'
          
          setInitError(errorMessage)
          setIsInitializing(false)
          return
        }

        setIsInitializing(false)
      } catch (err) {
        console.error('Initialization error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize the app. Please try again.'
        setInitError(errorMessage)
        setIsInitializing(false)
      }
    }

    if (loaded) {
      initializeApp()
    }
  }, [loaded, isOnline, checkConnection])

  // Update error state when network status changes
  useEffect(() => {
    if (!isOnline && Platform.OS !== 'web') {
      setError({
        type: 'warning',
        message: 'No internet connection'
      })
    } else if (!serverStatus.isOnline) {
      setError({
        type: 'warning',
        message: Platform.OS === 'web'
          ? 'Server unavailable. Please check the server URL.'
          : 'Server unavailable. Please check your connection.'
      })
    } else {
      setError(null)
    }
  }, [isOnline, serverStatus.isOnline])

  if (!loaded || isInitializing) {
    return (
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={colorScheme || 'dark'}>
          <Theme name={colorScheme || 'dark'}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <LoadingScreen message="Initializing..." />
          </Theme>
        </TamaguiProvider>
      </SafeAreaProvider>
    )
  }

  if (initError) {
    return (
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={colorScheme || 'dark'}>
          <Theme name={colorScheme || 'dark'}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <YStack
              flex={1}
              backgroundColor="$background"
              alignItems="center"
              justifyContent="center"
              padding="$6"
              space="$4"
            >
              <Text fontSize={48}>🔌</Text>
              <Text
                color="$lavender"
                fontFamily="$heading"
                fontSize="$8"
                fontWeight="bold"
                textAlign="center"
              >
                Connection Error
              </Text>
              <Text
                color="$text"
                fontSize="$4"
                textAlign="center"
              >
                {initError}
              </Text>
              <Button
                backgroundColor="$blue"
                pressStyle={{ opacity: 0.8 }}
                onPress={() => {
                  setInitError(null)
                  setIsInitializing(true)
                }}
              >
                <Button.Text color="$base">Retry Connection</Button.Text>
              </Button>
            </YStack>
          </Theme>
        </TamaguiProvider>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config} defaultTheme={colorScheme || 'dark'}>
        <Theme name={colorScheme || 'dark'}>
          <NavigationContainer>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <YStack flex={1} backgroundColor="$background">
              <Stack.Navigator
                initialRouteName="ChatList"
                screenOptions={{
                  headerShown: false
                }}
              >
                <Stack.Screen
                  name="ChatList"
                  component={ChatListScreen}
                />
                <Stack.Screen
                  name="Chat"
                  component={ChatScreen}
                />
                <Stack.Screen
                  name="BrowseCharacters"
                  component={BrowseCharactersScreen}
                />
                <Stack.Screen
                  name="CreateCharacter"
                  component={CreateCharacterScreen}
                />
                <Stack.Screen
                  name="Settings"
                  component={SettingsScreen}
                />
              </Stack.Navigator>

              <Toast
                visible={!!error}
                message={error?.message || ''}
                type={error?.type || 'info'}
                onHide={() => setError(null)}
              />
            </YStack>
          </NavigationContainer>
        </Theme>
      </TamaguiProvider>
    </SafeAreaProvider>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}
