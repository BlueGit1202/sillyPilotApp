import { useState } from 'react'
import { ScrollView, Image, Dimensions, View, Pressable, StyleSheet, Linking } from 'react-native'
import { YStack, Stack, Text, Button, XStack, Input, styled, Paragraph } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList, Character } from '../../navigation/types'
import { characterCardService, characterRepositoryService } from '../../services'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>
type RouteProps = NativeStackScreenProps<RootStackParamList, 'BrowseCharacters'>['route']

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
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    alignItems: 'center',
  }
})

const UrlInput = styled(Input, {
  flex: 1,
  backgroundColor: '$background',
  borderColor: '$overlay0',
  fontSize: 16,
  height: 44,
})

const CharacterCard = styled(Stack, {
  backgroundColor: '$surface0',
  borderRadius: '$3',
  padding: '$2',
  alignItems: 'center',
  space: '$2',
  borderWidth: 1,
  borderColor: '$overlay0',
})

const CharacterAvatar = styled(Image, {
  width: '100%',
  aspectRatio: 1,
  borderRadius: '$2',
})

const TabButton = styled(Button, {
  flex: 1,
  borderRadius: 0,
  height: 50,
})

const InfoText = styled(Text, {
  color: '$text',
  fontSize: 14,
  opacity: 0.8,
})

const Link = styled(Text, {
  color: '$blue',
  fontSize: 14,
  textDecorationLine: 'underline',
})

interface RepositoryMetadata {
  name: string
  description: string
  version: string
  author: string
  website?: string
}

export const BrowseCharactersScreen = () => {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProps>()
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<'repository' | 'local'>(route.params?.tab || 'repository')
  const [repositoryUrl, setRepositoryUrl] = useState(route.params?.repositoryUrl || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [onlineCharacters, setOnlineCharacters] = useState<Character[]>([])
  const [localCharacters, setLocalCharacters] = useState<Character[]>([])
  const [repositoryMetadata, setRepositoryMetadata] = useState<RepositoryMetadata | null>(null)
  
  const screenWidth = Dimensions.get('window').width
  const cardWidth = (screenWidth - 48 - 16) / 2 // accounting for padding and gap

  const loadRepository = async () => {
    if (!repositoryUrl) {
      setError('Please enter a repository URL')
      return
    }

    setIsLoading(true)
    setError(null)
    setRepositoryMetadata(null)
    setOnlineCharacters([])
    
    try {
      const { metadata, characters } = await characterRepositoryService.loadRepository(repositoryUrl)
      setRepositoryMetadata(metadata)
      setOnlineCharacters(characters)
    } catch (err) {
      console.error('Failed to load repository:', err)
      setError(err instanceof Error ? err.message : 'Failed to load repository')
    } finally {
      setIsLoading(false)
    }
  }

  const importCharacterCard = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/png',
        copyToCacheDirectory: true
      })

      if (!result.canceled && result.assets?.[0]) {
        const card = await characterCardService.parseCharacterCard(result.assets[0].uri)
        if (card) {
          const character = characterCardService.createCharacterFromCard(card)
          setLocalCharacters(prev => [...prev, character])
        } else {
          setError('Not a valid character card')
        }
      }
    } catch (err) {
      console.error('Failed to import character:', err)
      setError('Failed to import character card')
    }
  }

  const deleteCharacter = (id: number) => {
    setLocalCharacters(prev => prev.filter(char => char.id !== id))
  }

  const editCharacter = (character: Character) => {
    navigation.navigate('CreateCharacter', { editCharacter: character })
  }

  const openRepositoryDocs = () => {
    Linking.openURL('https://github.com/yourusername/character-repository')
  }

  const renderRepositoryTab = () => (
    <YStack space="$4">
      {/* Repository URL Input */}
      <Stack
        backgroundColor="$surface0"
        padding="$4"
        borderRadius="$4"
        space="$4"
      >
        <Stack space="$2">
          <XStack space="$2" alignItems="center">
            <UrlInput
              value={repositoryUrl}
              onChangeText={setRepositoryUrl}
              placeholder="Enter repository URL..."
              placeholderTextColor="$overlay0"
              borderWidth={1}
              focusStyle={{
                borderColor: '$blue',
                borderWidth: 1,
              }}
            />
            <Button
              backgroundColor="$blue"
              onPress={loadRepository}
              paddingHorizontal="$4"
              disabled={isLoading}
              height={44}
              minWidth={80}
            >
              <Button.Text color="$base">
                {isLoading ? 'Loading...' : 'Load'}
              </Button.Text>
            </Button>
          </XStack>

          <InfoText>
            Enter a URL to a character repository. Want to create your own?{' '}
            <Link onPress={openRepositoryDocs}>Learn how</Link>
          </InfoText>
        </Stack>

        {error && (
          <Text color="$red" fontSize={14}>
            {error}
          </Text>
        )}

        {repositoryMetadata && (
          <Stack space="$2" paddingTop="$2">
            <Text color="$lavender" fontSize={18} fontWeight="600">
              {repositoryMetadata.name}
            </Text>
            <Text color="$text" fontSize={14}>
              {repositoryMetadata.description}
            </Text>
            <XStack space="$4">
              <Text color="$overlay2" fontSize={12}>
                Version {repositoryMetadata.version}
              </Text>
              <Text color="$overlay2" fontSize={12}>
                By {repositoryMetadata.author}
              </Text>
              {repositoryMetadata.website && (
                <Link onPress={() => Linking.openURL(repositoryMetadata.website!)}>
                  Website
                </Link>
              )}
            </XStack>
          </Stack>
        )}
      </Stack>

      {/* Online Characters Grid */}
      {onlineCharacters.length > 0 ? (
        <XStack flexWrap="wrap" gap="$4" justifyContent="center">
          {onlineCharacters.map((character) => (
            <CharacterCard key={character.id} width={cardWidth}>
              <CharacterAvatar source={{ uri: character.data.avatar }} />
              <Text
                color="$lavender"
                fontSize={16}
                fontWeight="600"
                textAlign="center"
              >
                {character.data.name}
              </Text>
              <Button
                backgroundColor="$blue"
                onPress={() => navigation.navigate('Chat', { character })}
                width="100%"
                height={44}
              >
                <Button.Text color="$base">Chat</Button.Text>
              </Button>
            </CharacterCard>
          ))}
        </XStack>
      ) : (
        <Stack
          backgroundColor="$surface0"
          borderRadius="$4"
          padding="$6"
          alignItems="center"
          space="$6"
        >
          <Text fontSize={48}>🔍</Text>
          <Stack alignItems="center" space="$2">
            <Text
              color="$lavender"
              fontFamily="$heading"
              fontSize={20}
              fontWeight="600"
              textAlign="center"
            >
              Browse Online Characters
            </Text>
            <Paragraph
              color="$text"
              textAlign="center"
              opacity={0.8}
              maxWidth={300}
            >
              Enter a repository URL to discover and chat with characters. You can also create your own repository to share characters with others.
            </Paragraph>
          </Stack>
        </Stack>
      )}
    </YStack>
  )

  const renderLocalTab = () => (
    <YStack space="$4">
      {/* Import Button */}
      <Button
        backgroundColor="$blue"
        onPress={importCharacterCard}
        height={50}
        icon={<Ionicons name="cloud-upload-outline" size={20} color="#fff" />}
      >
        <Button.Text color="$base">Import Character Card</Button.Text>
      </Button>

      {/* Local Characters Grid */}
      {localCharacters.length > 0 ? (
        <XStack flexWrap="wrap" gap="$4" justifyContent="center">
          {localCharacters.map((character) => (
            <CharacterCard key={character.id} width={cardWidth}>
              <CharacterAvatar source={{ uri: character.data.avatar }} />
              <Text
                color="$lavender"
                fontSize={16}
                fontWeight="600"
                textAlign="center"
              >
                {character.data.name}
              </Text>
              <Stack space="$2" width="100%">
                <Button
                  backgroundColor="$blue"
                  onPress={() => navigation.navigate('Chat', { character })}
                  width="100%"
                  height={44}
                >
                  <Button.Text color="$base">Chat</Button.Text>
                </Button>
                <XStack space="$2">
                  <Button
                    flex={1}
                    backgroundColor="$surface1"
                    onPress={() => editCharacter(character)}
                    height={36}
                  >
                    <Button.Text color="$text">Edit</Button.Text>
                  </Button>
                  <Button
                    flex={1}
                    backgroundColor="$red"
                    onPress={() => deleteCharacter(character.id)}
                    height={36}
                  >
                    <Button.Text color="$base">Delete</Button.Text>
                  </Button>
                </XStack>
              </Stack>
            </CharacterCard>
          ))}
        </XStack>
      ) : (
        <Stack
          backgroundColor="$surface0"
          borderRadius="$4"
          padding="$6"
          alignItems="center"
          space="$6"
        >
          <Text fontSize={48}>🎭</Text>
          <Stack alignItems="center" space="$2">
            <Text
              color="$lavender"
              fontFamily="$heading"
              fontSize={20}
              fontWeight="600"
              textAlign="center"
            >
              Import Character Cards
            </Text>
            <Text
              color="$text"
              fontSize={16}
              textAlign="center"
              opacity={0.8}
              maxWidth={300}
            >
              Import and manage your character cards locally.
            </Text>
          </Stack>
        </Stack>
      )}
    </YStack>
  )

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Pressable 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#cdd6f4" />
          </Pressable>

          <View style={styles.title}>
            <Text
              color="$lavender"
              fontFamily="$heading"
              fontSize={20}
              fontWeight="600"
            >
              Character Repository
            </Text>
          </View>

          <View style={styles.backButton} />
        </View>
      </View>

      {/* Tab Navigation */}
      <XStack borderBottomWidth={1} borderBottomColor="$overlay0">
        <TabButton
          backgroundColor={activeTab === 'repository' ? '$surface1' : '$surface0'}
          onPress={() => setActiveTab('repository')}
        >
          <Button.Text 
            color={activeTab === 'repository' ? '$lavender' : '$text'}
            fontWeight={activeTab === 'repository' ? '600' : '400'}
          >
            Repository
          </Button.Text>
        </TabButton>
        <TabButton
          backgroundColor={activeTab === 'local' ? '$surface1' : '$surface0'}
          onPress={() => setActiveTab('local')}
        >
          <Button.Text
            color={activeTab === 'local' ? '$lavender' : '$text'}
            fontWeight={activeTab === 'local' ? '600' : '400'}
          >
            Local Cards
          </Button.Text>
        </TabButton>
      </XStack>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'repository' ? renderRepositoryTab() : renderLocalTab()}
      </ScrollView>
    </YStack>
  )
}
