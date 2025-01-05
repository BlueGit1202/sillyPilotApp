import { YStack, XStack, styled } from 'tamagui'
import { Button } from '../../../components/Button'
import { Ionicons } from '@expo/vector-icons'

const ProfileButton = styled(Button, {
  flex: 1,
  height: 56,
  backgroundColor: '$surface1',
  variants: {
    active: {
      true: {
        backgroundColor: '$blue',
      }
    }
  }
})

export interface Profile {
  id: string
  name: string
  avatar?: string
  messageCount: number
  favoriteCharacter?: string
}

interface ProfileSelectorProps {
  profiles: Profile[]
  activeProfileId: string
  onProfileSelect: (profileId: string) => void
  onCreateProfile: () => void
}

export const ProfileSelector = ({
  profiles,
  activeProfileId,
  onProfileSelect,
  onCreateProfile
}: ProfileSelectorProps) => {
  return (
    <YStack space="$3">
      <XStack space="$3">
        {profiles.map(profile => (
          <ProfileButton
            key={profile.id}
            active={activeProfileId === profile.id}
            onPress={() => onProfileSelect(profile.id)}
          >
            <Button.Text 
              color={activeProfileId === profile.id ? '$base' : '$text'}
            >
              {profile.name}
            </Button.Text>
          </ProfileButton>
        ))}
      </XStack>
      <Button
        backgroundColor="$surface1"
        pressStyle={{ opacity: 0.8 }}
        onPress={onCreateProfile}
        height={44}
      >
        <XStack space="$2" alignItems="center">
          <Ionicons name="add-outline" size={20} color="#cdd6f4" />
          <Button.Text color="$text">Create New Profile</Button.Text>
        </XStack>
      </Button>
    </YStack>
  )
}
