import { Stack, Text, styled } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface StatusBarProps {
  isOnline: boolean
  currentTheme: string
}

const StatusContainer = styled(Stack, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: '$background',
  borderBottomWidth: 1,
  borderBottomColor: '$overlay0',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
})

const StatusText = styled(Text, {
  color: '$text',
  fontSize: 12,
  opacity: 0.7,
})

export const StatusBar = ({ isOnline, currentTheme }: StatusBarProps) => {
  const insets = useSafeAreaInsets()

  return (
    <StatusContainer paddingTop={insets.top + 4} paddingBottom={4}>
      <StatusText>
        {isOnline ? 'Connected' : 'Offline'}
      </StatusText>
      <StatusText>
        {currentTheme === 'dark' ? 'Mocha (Dark)' : 'Latte (Light)'}
      </StatusText>
    </StatusContainer>
  )
}
