import { useEffect, useState } from 'react'
import { FlatList, View, StyleSheet } from 'react-native'
import { YStack, Stack, Text, Button, XStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../navigation/types'
import { ChatListItem } from '../../components/chat/ChatListItem'
import { HeaderDropdown } from '../../components/HeaderDropdown'
import { useChats } from '../../hooks/useChats'
import { useCharacters } from '../../hooks/useCharacters'
import { Toast } from '../../components/Toast'
import { LoadingScreen } from '../../components/LoadingScreen'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1e1e2e',
    borderBottomWidth: 1,
    borderBottomColor: '#313244',
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  title: {
    flex: 1,
    alignItems: 'center',
  },
  spacer: {
    width: 44,
    height: 44,
  }
})

const EmptyState = () => (
  <YStack
    flex={1}
    alignItems="center"
    justifyContent="center"
    space="$4"
    padding="$4"
  >
    <Text fontSize={48}>✨</Text>
    <Text
      color="$lavender"
      fontFamily="$heading"
      fontSize={20}
      fontWeight="600"
      textAlign="center"
    >
      Welcome to SillyPilot!
    </Text>
    <Text
      color="$text"
      fontSize={16}
      textAlign="center"
      opacity={0.8}
    >
      Create your first chat by clicking the button below to get started.
    </Text>
  </YStack>
)

export const ChatListScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const { 
    chats, 
    isLoading, 
    error,
    loadChats 
  } = useChats();
  
  const { characters, loadCharacters } = useCharacters()
  const [isMuted, setIsMuted] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [flg, setFlg] = useState(0);

  // Load chats on mount
  useEffect(() => {
    loadChats()
    loadCharacters()
  }, [loadChats,loadCharacters,flg])
 

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      showToastMessage(error)
    }
  }, [error])

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    setFlg(1 - flg);
  }

  const handleAboutPress = () => {
    // TODO: Implement about dialog
    console.log('About pressed')
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const handleChatPress = (character_id: number) => {
    const character = characters.find(c => c.id === character_id)
    if (character) {
      console.log("selected character's name is ", character.data.name)
      setFlg(1 - flg);
      navigation.navigate('Chat', { character })
    } else {
      showToastMessage('Character not found')
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
    >
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <View style={styles.spacer} />
          <View style={styles.title}>
            <Text
              color="$lavender"
              fontFamily="$heading"
              fontSize={20}
              fontWeight="600"
            >
              SillyPilot
            </Text>
          </View>
          <HeaderDropdown
            isMuted={isMuted}
            onMuteToggle={handleMuteToggle}
            onAboutPress={handleAboutPress}
          />
        </View>
      </View>
      <FlatList
        data={chats}
        renderItem={({ item }) => {
          const character = characters.find(c => c.id === item.character_id)
          if (!character) {
            console.log('not found', item.character_id, item.character_id);
            return null
          }
          console.log("character numnber:", item.character_id);
          console.log("chat number:",item.id);
          console.log("character name:", item.data?.name);
          console.log("-------------------------------------")
          return (
            <ChatListItem
              character={character}
              last_message={item.last_message}
              last_message_time={item.last_message_time}
              onPress={() => handleChatPress(character.id)}
              // onPress={() => console.log("selected character is: ",character.id,typeof(character.id))}
            />
          )
        }}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Math.max(120, insets.bottom + 100),
        }}
        ListEmptyComponent={EmptyState}
        onRefresh={loadChats}
        refreshing={isLoading}
      />

      {/* Bottom Buttons */}
      <Stack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        padding="$4"
        paddingBottom={Math.max(16, insets.bottom + 16)}
        space="$3"
        backgroundColor="$background"
        borderTopWidth={1}
        borderTopColor="$overlay0"
      >
        <XStack space="$3">
          <Button
            flex={1}
            backgroundColor="$surface0"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => navigation.navigate('BrowseCharacters', { tab: 'repository' })}
            height={50}
            borderRadius="$4"
          >
            <Button.Text color="$text">Browse Online 🔍</Button.Text>
          </Button>
          <Button
            flex={1}
            backgroundColor="$surface0"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => navigation.navigate('BrowseCharacters', { tab: 'local' })}
            height={50}
            borderRadius="$4"
          >
            <Button.Text color="$text">Local Cards 🎭</Button.Text>
          </Button>
        </XStack>

        <Button
          backgroundColor="$blue"
          pressStyle={{ opacity: 0.8 }}
          onPress={() => navigation.navigate('CreateCharacter', {})}
          height={50}
          borderRadius="$4"
        >
          <Button.Text color="$base">New Chat ✨</Button.Text>
        </Button>
      </Stack>

      {showToast && (
        <Toast
          message={toastMessage}
          type="error"
          visible={showToast}
          onHide={() => setShowToast(false)}
        />
      )}
    </YStack>
  )
}
