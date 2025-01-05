import { Image } from 'react-native'
import { Stack, Text, styled } from 'tamagui'
import { Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Character } from '../../navigation/types'
import { getRelativeTime } from '../../utils'

export interface ChatListItemProps {
  character: Character
  last_message?: string
  last_message_time?: string
  onPress: () => void
}

const Container = styled(Stack, {
  backgroundColor: '$surface0',
  padding: '$4',
  marginHorizontal: '$4',
  marginTop: '$3',
  borderRadius: '$4',
  flexDirection: 'row',
  alignItems: 'center',
  space: '$4',
})

const Avatar = styled(Image, {
  width: 48,
  height: 48,
  borderRadius: 24,
})

const Content = styled(Stack, {
  flex: 1,
  space: '$1',
})

const MessagePreview = styled(Text, {
  color: '$text',
  opacity: 0.7,
  fontSize: 14,
})

export const ChatListItem = ({
  character,
  last_message,
  last_message_time,
  onPress,
}: ChatListItemProps) => {

  const messageToShow = last_message || character.data?.firstMessage
  const timeToShow = last_message_time ? getRelativeTime(last_message_time) : ''

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Container>
        <Avatar source={{ uri: character.data?.avatar }} />
        <Content>
          <Text
            color="$lavender"
            fontSize={16}
            fontWeight="600"
          >
            {character.data.name}
          </Text>
          {messageToShow ? (
            <Stack flexDirection="row" alignItems="center">
              {timeToShow && (
                <Text color="$sky" fontSize={14} marginRight="$2">
                  {timeToShow}
                </Text>
              )}
              <MessagePreview numberOfLines={1} flex={1}>
                {messageToShow}
              </MessagePreview>
            </Stack>
          ) : (
            <Text color="$sky" fontSize={14}>
              No messages yet
            </Text>
          )}
        </Content>
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#cdd6f4"
        />
      </Container>
    </Pressable>
  )
}
