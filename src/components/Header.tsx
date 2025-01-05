import { styled, XStack, Text, Stack } from 'tamagui'
import { Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'

type Navigation = NativeStackNavigationProp<RootStackParamList>

interface HeaderProps {
  title: string
  showBack?: boolean
  showSettings?: boolean
  onBackPress?: () => void
  onTitlePress?: () => void
  hasNotification?: boolean
}

const HeaderContainer = styled(XStack, {
  backgroundColor: '$surface0',
  borderBottomWidth: 1,
  borderBottomColor: '$overlay0',
})

const IconButton = styled(Pressable, {
  width: 44,
  height: 44,
  alignItems: 'center',
  justifyContent: 'center',
})

const TitleButton = styled(Pressable, {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
})

const NotificationDot = styled(Stack, {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '$blue',
  position: 'absolute',
  top: -2,
  right: -2,
})

export const Header = ({ 
  title,
  showBack = false,
  showSettings = false,
  onBackPress,
  onTitlePress,
  hasNotification = false,
}: HeaderProps) => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<Navigation>()

  const handleBack = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      navigation.goBack()
    }
  }

  return (
    <HeaderContainer paddingTop={insets.top}>
      <XStack
        height={56}
        paddingHorizontal="$4"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <IconButton 
          onPress={showBack ? handleBack : undefined}
        >
          <Ionicons
            name={showBack ? "chevron-back" : "home"}
            size={24}
            color="#cdd6f4"
          />
        </IconButton>

        <TitleButton onPress={onTitlePress} disabled={!onTitlePress}>
          <Text
            color="$lavender"
            fontFamily="$heading"
            fontSize={20}
            fontWeight="600"
            textAlign="center"
          >
            {title}
          </Text>
          {hasNotification && <NotificationDot />}
        </TitleButton>

        <IconButton 
          onPress={showSettings ? () => navigation.navigate('Settings') : undefined}
        >
          {showSettings ? (
            <Ionicons 
              name="settings-outline" 
              size={24} 
              color="#cdd6f4" 
            />
          ) : (
            // Empty view to maintain spacing
            <Stack width={24} height={24} />
          )}
        </IconButton>
      </XStack>
    </HeaderContainer>
  )
}
