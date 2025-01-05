import { useState, useEffect } from 'react'
import { ScrollView, Image, View, Pressable, StyleSheet, BackHandler } from 'react-native'
import { YStack, Stack, Text, Button, Input, TextArea, XStack, styled } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList, Character } from '../../navigation/types'
import { apiService, characterCardService, Chat } from '../../services'
import { useSafeAreaInsets } from 'react-native-safe-area-context'  
import * as FileSystem from 'expo-file-system'
import { useChats } from 'hooks'


type Props = NativeStackScreenProps<RootStackParamList, 'CreateCharacter'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FormInput = styled(Input, {
    backgroundColor: '$surface0',
  borderColor: '$overlay0',
    color:'$sky',
    borderWidth: 1,
    fontSize: 16,
    padding: '$3',
    focusStyle: {
        borderColor: '$blue',
        borderWidth: 1,
    },
});

const FormTextArea = styled(TextArea, {
    backgroundColor: '$surface0',
    borderColor: '$overlay0',
    borderWidth: 1,
    fontSize: 16,
    padding: '$3',
    focusStyle: {
        borderColor: '$blue',
        borderWidth: 1,
    },
});

const Tag = styled(XStack, {
  backgroundColor: '$surface0',
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderRadius: 100,
  alignItems: 'center',
  space: '$2',
})

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

});

interface FormData {
    name: string;
    description: string;
    personality: string;
    scenario: string;
    firstMessage: string;
    systemPrompt: string;
    creatorNotes: string;
    tags: string[];
    image?: string;
}

const FileInput = ({ onChange }: { onChange: (uri: string) => void }) => {
    const handleFileChange = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*', // You can specify the file types here
            copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets?.[0]) {
            const uri = result.assets[0].uri; // Get the URI of the selected file
            console.log('Selected file:', uri);
            onChange(uri); // Call the onChange prop with the selected file URI
        }
    };

    return (
        <Pressable onPress={handleFileChange}>
            <Text>Upload Character Image</Text>
        </Pressable>
    );
};

export const CreateCharacterScreen = ({ route }: Props) => {
    const navigation = useNavigation<NavigationProp>()
  const insets = useSafeAreaInsets()
  const editCharacter = route.params?.editCharacter
  const isEditing = !!editCharacter
  const {loadChats} =useChats()
  const [newTag, setNewTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [back,setBack]=useState(0)
    
    const [formData, setFormData] = useState<FormData>({
        name: editCharacter?.data.name || '',
        description: editCharacter?.data.description || '',
        personality: editCharacter?.data.personality || '',
        scenario: editCharacter?.data.scenario || '',
        firstMessage: editCharacter?.data.firstMessage || '',
        systemPrompt: editCharacter?.data.systemPrompt || '',
        creatorNotes: editCharacter?.data.creatorNotes || '',
        tags: editCharacter?.data.tags || [],
        image: editCharacter?.data.avatar,
    });

     useEffect(() => {
    const backAction = () => {
        loadChats();
        navigation.goBack();
        return true;
    };

    const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
    );

    return () => backHandler.remove();
}, []);
  
    useEffect(() => {
    return () => {
      if (formData.image?.startsWith('blob:')) {
        characterCardService.cleanupBlobUrl(formData.image)
      }
    }
  }, [formData.image])

    // Handle image change
    const handleImageChange = (uri: string) => {
        setFormData(prev => ({ ...prev, image: uri }));
  };



   const handleCharacterCard = async (uri: string) => {
    try {
      const card = await characterCardService.parseCharacterCard(uri)
      if (card) {
        // Clean up previous blob URL if exists
        if (formData.image?.startsWith('blob:')) {
          characterCardService.cleanupBlobUrl(formData.image)
        }

        setFormData({
          name: card.name,
          description: card.description,
          personality: card.personality,
          scenario: card.scenario,
          firstMessage: card.first_message,
          systemPrompt: card.metadata.extensions.system_prompt || '',
          creatorNotes: card.metadata.creator_notes || '',
          tags: card.metadata.tags || [],
          image: uri,
        })
        return true
      }
      return false
    } catch (err) {
      console.log('Not a character card:', err)
      return false
    }
  }

  const importCharacterCard = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/png',
        copyToCacheDirectory: true
      })

      if (!result.canceled && result.assets?.[0]) {
        const isCharacterCard = await handleCharacterCard(result.assets[0].uri)
        if (!isCharacterCard) {
          setError('Not a valid character card')
        }
      }
    } catch (err) {
      console.error('Failed to import character:', err)
      setError('Failed to import character card')
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({ ...prev, image: result.assets[0].uri }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    if (!formData.image) {
      setError('Character image is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Upload image if it's a local file
      let avatarUrl = formData.image
      if (formData.image.startsWith('file://') || formData.image.startsWith('data:')) {
        // Get image info
        const info = await FileSystem.getInfoAsync(formData.image)
        if (!info.exists) {
          throw new Error('Image file not found')
        }
// Create form data for image upload
        const imageFormData = new FormData()
        imageFormData.append('avatar', {
          uri: formData.image,
          type: 'imag/png',
          name: 'avatar.png',
          size: info.size
        } as any)

        // Upload image
        const result = await apiService.uploadCharacterImage(imageFormData);
        avatarUrl = result.avatar
      }

      // Create character data matching server expectations
      const characterPayload = {
        data: {
          name: formData.name.trim(),
          avatar: avatarUrl,
          description: formData.description,
          personality: formData.personality,
          scenario: formData.scenario,
          firstMessage: formData.firstMessage,
          systemPrompt: formData.systemPrompt,
          creatorNotes: formData.creatorNotes,
          tags: formData.tags,
          status: 'online',
          mood: editCharacter?.data.mood || 'Cheerful',

          // Backend compatibility fields (optional)
          first_mes: formData.firstMessage,
          mes_example: '',
          creator_notes: formData.creatorNotes,
          system_prompt: formData.systemPrompt,
          post_history_instructions: '',
          alternate_greetings: [],
          character_book: {},
          creator: '',
          character_version: '1.0',
          extensions: {},
          avatarUrl
        }
      }

      let character: Character
      let chat: Chat
      if (isEditing && editCharacter) {
        character = await apiService.updateCharacter(editCharacter.id, characterPayload)
      } else {
        character = await apiService.createCharacter(characterPayload)
        const tempData = character.data;

        const chatPayload = {
          data: character.data,          
          name: tempData.name,
          character_id: character.id 
        }
       
        chat = await apiService.createChat(chatPayload)
        // await createChat({
        //     name: `Chat with ${character.data.name}`,
        //     character_id: character.id,
        //     data: character.data
        //   })
      }

      // Clean up blob URL if exists
      if (formData.image.startsWith('blob:')) {
        characterCardService.cleanupBlobUrl(formData.image)
      }

      // Navigate to chat with the character
      navigation.navigate('Chat', { character })
    } catch (err) {
      console.error('Failed to save character:', err)
      setError('Failed to save character')
    } finally {
      setIsLoading(false)
    }
  }

    return (
        <YStack flex={1} backgroundColor="$background">
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color="#cdd6f4" />
                    </Pressable>
                    <Text color="$lavender" fontSize={20} fontWeight="600">
                        {editCharacter ? `Edit ${editCharacter.data.name}` : 'Create Character'}
                    </Text>
                </View>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
                <YStack space="$4" paddingBottom="$6">
                    {/* Image Upload */}
                    <Stack space="$2">
                        <Text color="$sky" fontSize={14}>Character Image</Text>
                        <XStack space="$4" alignItems="center">
                            <Stack width={96} height={96} backgroundColor="$surface0" borderRadius="$4" alignItems="center" justifyContent="center" borderWidth={2} borderColor="$lavender" overflow="hidden">
                                {formData.image ? (
                                    <Image source={{ uri: formData.image }} style={{ width: '100%', height: '100%' }} />
                                ) : (
                                    <Ionicons name="image-outline" size={32} color="#6c7086" />
                                )}
                            </Stack>
                <YStack flex={1} space="$2">
                  <Button
                  backgroundColor="$surface0"
                  pressStyle={{ opacity: 0.8 }}
                  onPress={pickImage}
                  icon={<Ionicons name="image-outline" size={20} color="#cdd6f4" />}
                  height={44}
                >
                  <Button.Text color="$text"><FileInput onChange={handleImageChange}/></Button.Text>
                </Button>

                  
                  <Button
                  backgroundColor="$surface0"
                  pressStyle={{ opacity: 0.8 }}
                  onPress={importCharacterCard}
                  icon={<Ionicons name="document-outline" size={20} color="#cdd6f4" />}
                  height={44}
                >
                  <Button.Text color="$text">Import Card</Button.Text>
                </Button>
                            </YStack>
                        </XStack>
                    </Stack>
<Stack space="$2">
            <Text color="$sky" fontSize={14}>Name</Text>
            <FormInput
              value={formData.name}
              onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Character name"
              numberOfLines={1}
            />
          </Stack>

          {/* Description */}
          <Stack space="$2">
            <Text color="$sky" fontSize={14}>Description</Text>
            <FormTextArea
              value={formData.description}
              onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Character description"
              numberOfLines={3}
            />
          </Stack>

          {/* Personality */}
          <Stack space="$2">
            <Text color="$sky" fontSize={14}>Personality</Text>
            <FormTextArea
              value={formData.personality}
              onChangeText={text => setFormData(prev => ({ ...prev, personality: text }))}
              placeholder="Character personality traits"
              numberOfLines={3}
            />
          </Stack>

          {/* Scenario */}
          <Stack space="$2">
            <Text color="$sky" fontSize={14}>Scenario</Text>
            <FormTextArea
              value={formData.scenario}
              onChangeText={text => setFormData(prev => ({ ...prev, scenario: text }))}
              placeholder="Character scenario or background"
              numberOfLines={3}
            />
          </Stack>

          {/* First Message */}
          <Stack space="$2">
            <Text color="$sky" fontSize={14}>First Message</Text>
            <FormTextArea
              value={formData.firstMessage}
              onChangeText={text => setFormData(prev => ({ ...prev, firstMessage: text }))}
              placeholder="Character's first message"
              numberOfLines={3}
            />
          </Stack>

          {/* System Prompt */}
          <Stack space="$2">
            <Text color="$sky" fontSize={14}>System Prompt</Text>
            <FormTextArea
              value={formData.systemPrompt}
              onChangeText={text => setFormData(prev => ({ ...prev, systemPrompt: text }))}
              placeholder="Instructions for the AI about how to roleplay this character"
              numberOfLines={3}
            />
          </Stack>

          {/* Creator Notes */}
          <Stack space="$2">
            <Text color="$sky" fontSize={14}>Creator Notes</Text>
            <FormTextArea
              value={formData.creatorNotes}
              onChangeText={text => setFormData(prev => ({ ...prev, creatorNotes: text }))}
              placeholder="Additional notes about the character"
              numberOfLines={2}
            />
          </Stack>

          {/* Tags */}
          <Stack space="$2">
            <Text color="$sky" fontSize={14}>Tags</Text>
            <YStack space="$2">
              <FormInput
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add tag..."
                onSubmitEditing={addTag}
              />
              <XStack flexWrap="wrap" gap="$2">
                {formData.tags.map((tag, index) => (
                  <Tag key={index}>
                    <Text color="$text">{tag}</Text>
                    <Button
                      size={1}
                      circular
                      onPress={() => removeTag(tag)}
                      backgroundColor="$overlay0"
                    >
                      <Ionicons name="close" size={12} color="#cdd6f4" />
                    </Button>
                  </Tag>
                ))}
              </XStack>
            </YStack>
          </Stack>

          {error && (
            <Text color="$red" fontSize={14}>
              {error}
            </Text>
          )}

          {/* Action Buttons */}
          <XStack space="$3" marginTop="$4">
            <Button
              flex={1}
              backgroundColor="$surface0"
              pressStyle={{ opacity: 0.8 }}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
              height={50}
            >
              <Button.Text color="$text">Cancel</Button.Text>
            </Button>
            <Button
              flex={1}
              backgroundColor="$blue"
              pressStyle={{ opacity: 0.8 }}
              onPress={handleSave}
              disabled={isLoading}
              height={50}
            >
              <Button.Text color="$base">
                {isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Character')}
              </Button.Text>
            </Button>
          </XStack>
                    {/* Other form fields go here... */}
                </YStack>
            </ScrollView>
        </YStack>
    );
};
