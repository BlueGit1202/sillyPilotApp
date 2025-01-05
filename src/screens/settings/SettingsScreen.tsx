import { useState, useEffect } from 'react'
import { ScrollView, Alert } from 'react-native'
import { YStack, Stack, XStack, Switch, Input, TextArea, Text, styled } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Button } from '../../components/Button'
import { ScreenHeader } from '../../components/ScreenHeader'
import { UserProfileCard } from './components/UserProfileCard'
import { LogViewer, SystemLog } from './components/LogViewer'
import { ProfileSelector, Profile } from './components/ProfileSelector'
import { SettingsSection, SettingRow } from './components/SettingsSection'

type Navigation = NativeStackNavigationProp<RootStackParamList>

const FormInput = styled(Input, {
  backgroundColor: '$surface0',
  borderColor: '$overlay0',
  borderWidth: 1,
  fontSize: 16,
  height: 56,
  borderRadius: 12,
  paddingHorizontal: 16,
})

const FormTextArea = styled(TextArea, {
  backgroundColor: '$surface0',
  borderColor: '$overlay0',
  borderWidth: 1,
  fontSize: 16,
  minHeight: 120,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
})

interface UserSettings {
  name: string
  bio: string
  theme: 'mocha' | 'latte'
  allowNSFW: boolean
  dataBank: string
  showSystemLogs: boolean
}

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<Navigation>()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeProfile, setActiveProfile] = useState<string>('default')
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    bio: '',
    theme: 'mocha',
    allowNSFW: false,
    dataBank: '',
    showSystemLogs: true,
  })

  // Mock profiles - In real app, this would come from storage/API
  const profiles: Profile[] = [
    {
      id: 'default',
      name: 'Main Profile',
      messageCount: 1234,
      favoriteCharacter: 'Lucario',
    },
    {
      id: 'alt',
      name: 'Alt Profile',
      messageCount: 567,
      favoriteCharacter: 'Pikachu',
    },
  ]

  // Mock system logs - In real app, this would be actual system events
  useEffect(() => {
    const mockLogs: SystemLog[] = [
      { timestamp: '2024-02-20 15:45:23', message: 'Application started', type: 'info' },
      { timestamp: '2024-02-20 15:45:24', message: 'Settings loaded successfully', type: 'info' },
      { timestamp: '2024-02-20 15:46:01', message: 'Chat system initialized', type: 'info' },
      { timestamp: '2024-02-20 15:47:12', message: 'Memory optimization complete', type: 'info' },
      { timestamp: '2024-02-20 15:48:30', message: 'Background tasks synchronized', type: 'info' },
    ]
    setSystemLogs(mockLogs)
  }, [])

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    // TODO: Implement settings persistence
    setHasUnsavedChanges(false)
    navigation.goBack()
  }

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              name: '',
              bio: '',
              theme: 'mocha',
              allowNSFW: false,
              dataBank: '',
              showSystemLogs: true,
            })
            setHasUnsavedChanges(true)
          }
        }
      ]
    )
  }

  const handleExportLogs = () => {
    // TODO: Implement log export functionality
    const logText = systemLogs
      .map(log => `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`)
      .join('\n')
    console.log('Exporting logs:', logText)
  }

  const activeProfileData = profiles.find(p => p.id === activeProfile)

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScreenHeader 
        navigation={navigation}
        title="Settings"
        hasUnsavedChanges={hasUnsavedChanges}
      />
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Math.max(16, insets.bottom + 80),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        {activeProfileData && (
          <UserProfileCard
            name={activeProfileData.name}
            messageCount={activeProfileData.messageCount}
            favoriteCharacter={activeProfileData.favoriteCharacter}
            onPress={() => setHasUnsavedChanges(true)}
          />
        )}

        {/* Profile Selection */}
        <SettingsSection title="Active Profile">
          <ProfileSelector
            profiles={profiles}
            activeProfileId={activeProfile}
            onProfileSelect={setActiveProfile}
            onCreateProfile={() => {/* TODO: Implement new profile creation */}}
          />
        </SettingsSection>

        {/* User Profile Settings */}
        <SettingsSection title="Profile Settings">
          <YStack space="$3">
            <SettingRow label="Your Name">
              <FormInput
                value={settings.name}
                onChangeText={(text) => updateSettings({ name: text })}
                placeholder="Enter your name"
                placeholderTextColor="$overlay0"
              />
            </SettingRow>

            <SettingRow label="Bio">
              <FormTextArea
                value={settings.bio}
                onChangeText={(text) => updateSettings({ bio: text })}
                placeholder="Tell us about yourself..."
                placeholderTextColor="$overlay0"
                numberOfLines={4}
              />
            </SettingRow>
          </YStack>
        </SettingsSection>

        {/* Theme */}
        <SettingsSection title="Theme">
          <SettingRow label="Color Theme">
            <XStack space="$3">
              <Button
                flex={1}
                backgroundColor={settings.theme === 'mocha' ? '$blue' : '$surface1'}
                pressStyle={{ opacity: 0.8 }}
                onPress={() => updateSettings({ theme: 'mocha' })}
                height={56}
              >
                <Button.Text color={settings.theme === 'mocha' ? '$base' : '$text'}>
                  Mocha (Dark)
                </Button.Text>
              </Button>
              <Button
                flex={1}
                backgroundColor={settings.theme === 'latte' ? '$blue' : '$surface1'}
                pressStyle={{ opacity: 0.8 }}
                onPress={() => updateSettings({ theme: 'latte' })}
                height={56}
              >
                <Button.Text color={settings.theme === 'latte' ? '$base' : '$text'}>
                  Latte (Light)
                </Button.Text>
              </Button>
            </XStack>
          </SettingRow>
        </SettingsSection>

        {/* Content Settings */}
        <SettingsSection title="Content Settings">
          <SettingRow label="NSFW Content">
            <XStack alignItems="center" justifyContent="space-between">
              <Text color="$text" fontSize={16}>Enable NSFW Content</Text>
              <Switch
                checked={settings.allowNSFW}
                onCheckedChange={(checked) => updateSettings({ allowNSFW: checked })}
                backgroundColor={settings.allowNSFW ? '$blue' : '$surface1'}
                size="$4"
              >
                <Switch.Thumb animation="quick" />
              </Switch>
            </XStack>
          </SettingRow>
        </SettingsSection>

        {/* Data Bank */}
        <SettingsSection title="Data Bank">
          <SettingRow label="Personal Information">
            <Text color="$text" fontSize={14} opacity={0.8} marginBottom="$2">
              Add information you'd like the AI to remember about you:
              • Communication preferences
              • Interests and hobbies
              • Important dates
              • Favorite topics
            </Text>
            <FormTextArea
              value={settings.dataBank}
              onChangeText={(text) => updateSettings({ dataBank: text })}
              placeholder="Share details you want the AI to know..."
              placeholderTextColor="$overlay0"
              numberOfLines={6}
            />
          </SettingRow>
        </SettingsSection>

        {/* System */}
        <SettingsSection title="System">
          <YStack space="$3">
            <SettingRow label="System Logs">
              <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
                <Text color="$text" fontSize={16}>Show System Logs</Text>
                <Switch
                  checked={settings.showSystemLogs}
                  onCheckedChange={(checked) => updateSettings({ showSystemLogs: checked })}
                  backgroundColor={settings.showSystemLogs ? '$blue' : '$surface1'}
                  size="$4"
                >
                  <Switch.Thumb animation="quick" />
                </Switch>
              </XStack>

              {settings.showSystemLogs && (
                <LogViewer
                  logs={systemLogs}
                  onExport={handleExportLogs}
                />
              )}
            </SettingRow>

            <Button
              backgroundColor="$red"
              pressStyle={{ opacity: 0.8 }}
              onPress={handleReset}
              height={56}
              marginTop="$2"
            >
              <Button.Text color="$base">Reset All Settings</Button.Text>
            </Button>
          </YStack>
        </SettingsSection>
      </ScrollView>

      {/* Save Button */}
      {hasUnsavedChanges && (
        <Stack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          padding="$4"
          paddingBottom={Math.max(16, insets.bottom + 16)}
          backgroundColor="$background"
          borderTopWidth={1}
          borderTopColor="$overlay0"
        >
          <Button
            backgroundColor="$blue"
            pressStyle={{ opacity: 0.8 }}
            onPress={handleSave}
            height={56}
          >
            <Button.Text color="$base">Save Changes</Button.Text>
          </Button>
        </Stack>
      )}
    </YStack>
  )
}
