import React, { useState } from 'react'
import { YStack, XStack, Text, Sheet, Button, Input, Switch, styled } from 'tamagui'
import { ScrollView, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Character } from '../../navigation/types'
import { LinearGradient } from 'tamagui/linear-gradient'
import { Select as NativeSelect } from '@tamagui/select'

interface ChatSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  character: Character
  onResetChat?: () => void
  onEditCharacter?: () => void
}

const SettingSection = styled(YStack, {
  space: '$2',
  paddingVertical: '$2',
  borderBottomWidth: 1,
  borderBottomColor: '$overlay0',
})

const SettingRow = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: '$2',
  width: '100%',
})

const FormInput = styled(Input, {
  backgroundColor: '$surface0',
  borderWidth: 1,
  borderColor: '$overlay0',
  height: 40,
  width: '100%',
  color: '$text',
})

const NumberInput = styled(Input, {
  backgroundColor: '$surface0',
  borderWidth: 1,
  borderColor: '$overlay0',
  height: 40,
  width: 100,
  textAlign: 'center',
  color: '$text',
})

const StyledSwitch = styled(Switch, {
  width: 52,
  height: 32,
  backgroundColor: '$surface1',
  borderRadius: 16,
  variants: {
    checked: {
      true: {
        backgroundColor: '$blue',
      }
    }
  } as const
})

const SwitchThumb = styled(Switch.Thumb, {
  width: 28,
  height: 28,
  backgroundColor: 'white',
})

const SelectTrigger = styled(Button, {
  backgroundColor: '$surface0',
  borderWidth: 1,
  borderColor: '$overlay0',
  height: 40,
  width: '100%',
  justifyContent: 'space-between',
  paddingHorizontal: '$3',
  flexDirection: 'row',
  alignItems: 'center',
})

export const ChatSettings = ({
  open,
  onOpenChange,
  character,
  onResetChat,
  onEditCharacter,
}: ChatSettingsProps) => {
  const [aiProvider, setAiProvider] = useState<'openrouter' | 'sillytavern'>('openrouter')
  const [apiEndpoint, setApiEndpoint] = useState('https://api.openpipe.ai/v1')
  const [apiKey, setApiKey] = useState('')
  const [sillyTavernIp, setSillyTavernIp] = useState('localhost')
  const [sillyTavernPort, setSillyTavernPort] = useState('8000')
  const [showSystemLogs, setShowSystemLogs] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2000)
  const [nsfw, setNsfw] = useState(false)
  const [erpLevel, setErpLevel] = useState<'off' | 'mild' | 'spicy'>('off')

  const handleOpenRouterLogin = () => {
    Linking.openURL('https://openrouter.ai/keys')
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[90]}
      dismissOnSnapToBottom
      animation="quick"
    >
      <Sheet.Overlay 
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame padding="$0" space="$0">
        {/* Gradient Handle Area */}
        <LinearGradient
          colors={['$surface0', '$background']}
          start={[0, 0]}
          end={[0, 1]}
          height={50}
          padding="$2"
          alignItems="center"
        >
          <Sheet.Handle />
          <Text 
            fontFamily="$heading"
            fontSize={12}
            color="$overlay0"
            marginTop="$2"
          >
            Pull down to close
          </Text>
        </LinearGradient>

        <ScrollView style={{ flex: 1 }}>
          <YStack space="$4" padding="$4">
            <Text 
              fontFamily="$heading"
              fontSize={20}
              fontWeight="600"
              color="$color"
            >
              Chat Settings
            </Text>

            {/* AI Provider */}
            <SettingSection>
              <Text 
                fontFamily="$heading"
                fontSize={16}
                fontWeight="600"
                color="$color"
                marginBottom="$2"
              >
                AI Provider
              </Text>
              <YStack space="$3" width="100%">
                <SelectTrigger onPress={() => {
                  setAiProvider(prev => prev === 'openrouter' ? 'sillytavern' : 'openrouter')
                }}>
                  <Text color="$text" fontSize={14}>
                    {aiProvider === 'openrouter' ? 'OpenRouter' : 'SillyTavern'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#cdd6f4" />
                </SelectTrigger>

                {aiProvider === 'openrouter' ? (
                  <YStack space="$2">
                    <Text fontSize={14} color="$color">API Key</Text>
                    <FormInput
                      value={apiKey}
                      onChangeText={setApiKey}
                      placeholder="Enter API key"
                      secureTextEntry
                    />
                    <Button
                      onPress={handleOpenRouterLogin}
                      backgroundColor="$blue"
                      height={40}
                      borderRadius="$2"
                      marginTop="$2"
                    >
                      <Button.Text color="white" fontSize={14}>Login to OpenRouter</Button.Text>
                    </Button>
                  </YStack>
                ) : (
                  <YStack space="$3">
                    <YStack space="$2">
                      <Text fontSize={14} color="$color">SillyTavern IP</Text>
                      <FormInput
                        value={sillyTavernIp}
                        onChangeText={setSillyTavernIp}
                        placeholder="Enter IP address"
                      />
                    </YStack>
                    <YStack space="$2">
                      <Text fontSize={14} color="$color">SillyTavern Port</Text>
                      <FormInput
                        value={sillyTavernPort}
                        onChangeText={setSillyTavernPort}
                        placeholder="Enter port"
                      />
                    </YStack>
                  </YStack>
                )}
              </YStack>
            </SettingSection>

            {/* Model Settings */}
            <SettingSection>
              <Text 
                fontFamily="$heading"
                fontSize={16}
                fontWeight="600"
                color="$color"
                marginBottom="$2"
              >
                Model Settings
              </Text>
              <YStack space="$3">
                <SettingRow>
                  <Text fontSize={14} color="$color">Temperature</Text>
                  <NumberInput
                    value={temperature.toString()}
                    onChangeText={(value) => setTemperature(Number(value))}
                    keyboardType="numeric"
                  />
                </SettingRow>
                <SettingRow>
                  <Text fontSize={14} color="$color">Max Tokens</Text>
                  <NumberInput
                    value={maxTokens.toString()}
                    onChangeText={(value) => setMaxTokens(Number(value))}
                    keyboardType="numeric"
                  />
                </SettingRow>
              </YStack>
            </SettingSection>

            {/* Sexual Preferences */}
            <SettingSection>
              <Text 
                fontFamily="$heading"
                fontSize={16}
                fontWeight="600"
                color="$color"
                marginBottom="$2"
              >
                Sexual Preferences
              </Text>
              <YStack space="$3">
                <SettingRow>
                  <Text fontSize={14} color="$color">NSFW Content</Text>
                  <StyledSwitch
                    checked={nsfw}
                    onCheckedChange={setNsfw}
                  >
                    <SwitchThumb animation="quick" />
                  </StyledSwitch>
                </SettingRow>
                {nsfw && (
                  <YStack space="$2">
                    <Text fontSize={14} color="$color">ERP Level</Text>
                    <SelectTrigger onPress={() => {
                      const levels = ['off', 'mild', 'spicy'] as const
                      const currentIndex = levels.indexOf(erpLevel)
                      const nextIndex = (currentIndex + 1) % levels.length
                      setErpLevel(levels[nextIndex])
                    }}>
                      <Text color="$text" fontSize={14}>
                        {erpLevel.charAt(0).toUpperCase() + erpLevel.slice(1)}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#cdd6f4" />
                    </SelectTrigger>
                  </YStack>
                )}
              </YStack>
            </SettingSection>

            {/* System Logs */}
            <SettingSection>
              <Text 
                fontFamily="$heading"
                fontSize={16}
                fontWeight="600"
                color="$color"
                marginBottom="$2"
              >
                System Logs
              </Text>
              <SettingRow>
                <Text fontSize={14} color="$color">Show System Logs</Text>
                <StyledSwitch
                  checked={showSystemLogs}
                  onCheckedChange={setShowSystemLogs}
                >
                  <SwitchThumb animation="quick" />
                </StyledSwitch>
              </SettingRow>
              {showSystemLogs && (
                <YStack
                  backgroundColor="$surface0"
                  padding="$3"
                  borderRadius="$3"
                  marginTop="$2"
                  height={150}
                >
                  <ScrollView>
                    <Text color="$overlay0" fontFamily="$mono" fontSize={12}>
                      [System] Chat initialized{'\n'}
                      [System] Character loaded: {character.data.name}{'\n'}
                      [System] API Provider: {aiProvider}{'\n'}
                      [System] API Status: {apiKey ? 'Connected' : 'Not Connected'}{'\n'}
                      [System] NSFW: {nsfw ? 'Enabled' : 'Disabled'}{'\n'}
                      [System] ERP Level: {erpLevel}{'\n'}
                      [System] Memory: Active
                    </Text>
                  </ScrollView>
                </YStack>
              )}
            </SettingSection>

            {/* Character Settings */}
            <SettingSection>
              <Text 
                fontFamily="$heading"
                fontSize={16}
                fontWeight="600"
                color="$color"
                marginBottom="$2"
              >
                Character Settings
              </Text>
              <YStack space="$3">
                <Button
                  icon={<Ionicons name="pencil" size={20} color="#cdd6f4" />}
                  onPress={onEditCharacter}
                  backgroundColor="$surface0"
                  height={40}
                  borderRadius="$2"
                >
                  <Button.Text color="$text" fontSize={14}>Edit Character Card</Button.Text>
                </Button>
                <Button
                  icon={<Ionicons name="refresh" size={20} color="#cdd6f4" />}
                  onPress={onResetChat}
                  backgroundColor="$surface0"
                  height={40}
                  borderRadius="$2"
                >
                  <Button.Text color="$text" fontSize={14}>Reset Chat History</Button.Text>
                </Button>
              </YStack>
            </SettingSection>
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  )
}
