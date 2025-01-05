import { Pressable } from 'react-native'
import { Text, XStack, YStack, Circle, styled } from 'tamagui'

const Card = styled(Pressable, {
  backgroundColor: '$surface0',
  borderRadius: '$4',
  padding: '$4',
  borderWidth: 1,
  borderColor: '$overlay0',
  marginBottom: '$4',
})

interface UserProfileCardProps {
  name: string
  messageCount: number
  favoriteCharacter?: string
  onPress: () => void
}

export const UserProfileCard = ({ 
  name, 
  messageCount, 
  favoriteCharacter,
  onPress 
}: UserProfileCardProps) => {
  return (
    <Card onPress={onPress}>
      <XStack space="$4" alignItems="center">
        <Circle size={60} backgroundColor="$blue">
          <Text color="$base" fontSize={24}>
            {name.charAt(0) || 'U'}
          </Text>
        </Circle>
        <YStack flex={1}>
          <Text color="$lavender" fontSize={24} fontWeight="600">
            Hello, {name}! 👋
          </Text>
          <Text color="$text" fontSize={16} opacity={0.8}>
            Messages Sent: {messageCount}
          </Text>
          {favoriteCharacter && (
            <Text color="$text" fontSize={16} opacity={0.8}>
              Favorite Character: {favoriteCharacter}
            </Text>
          )}
        </YStack>
      </XStack>
    </Card>
  )
}
