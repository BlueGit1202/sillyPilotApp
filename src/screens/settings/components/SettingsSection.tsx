import { YStack, Text, Stack } from 'tamagui'

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
}

export const SettingsSection = ({ title, children }: SettingsSectionProps) => (
  <YStack space="$2" marginBottom="$4">
    <Text 
      color="$sky" 
      fontSize={14}
    >
      {title}
    </Text>
    <Stack
      backgroundColor="$surface0"
      padding="$4"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$overlay0"
    >
      {children}
    </Stack>
  </YStack>
)

interface SettingRowProps {
  label: string
  children: React.ReactNode
}

export const SettingRow = ({ label, children }: SettingRowProps) => (
  <YStack space="$2" marginBottom="$3">
    <Text 
      color="$text" 
      fontSize={16}
      opacity={0.8}
    >
      {label}
    </Text>
    {children}
  </YStack>
)
