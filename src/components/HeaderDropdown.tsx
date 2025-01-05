import React, { useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { Sheet, YStack, Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface HeaderDropdownProps {
  isMuted: boolean
  onMuteToggle: () => void
  onAboutPress: () => void
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
  },
  menuItemHover: {
    backgroundColor: 'rgba(205, 214, 244, 0.1)',
  },
  menuText: {
    marginLeft: 12,
    color: '#cdd6f4',
    fontSize: 16,
  }
})

export const HeaderDropdown = ({ isMuted, onMuteToggle, onAboutPress }: HeaderDropdownProps) => {
  const navigation = useNavigation<NavigationProp>()
  const [isOpen, setIsOpen] = useState(false)

  const handlePress = () => {
    setIsOpen(!isOpen)
  }

  const handleGlobalSettings = () => {
    setIsOpen(false)
    navigation.navigate('Settings')
  }

  const handleAbout = () => {
    setIsOpen(false)
    onAboutPress()
  }

  const handleMuteToggle = () => {
    setIsOpen(false)
    onMuteToggle()
  }

  return (
    <>
      <Pressable style={styles.button} onPress={handlePress}>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#cdd6f4" 
        />
      </Pressable>

      <Sheet
        modal
        open={isOpen}
        onOpenChange={setIsOpen}
        snapPoints={[25]}
        position={0}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay 
          animation="lazy" 
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame
          padding="$4"
          backgroundColor="#313244"
          space="$4"
        >
          <YStack space="$2">
            <Pressable 
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemHover
              ]} 
              onPress={handleGlobalSettings}
            >
              <Ionicons name="settings-outline" size={20} color="#cdd6f4" />
              <Text style={styles.menuText}>Global Settings</Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemHover
              ]} 
              onPress={handleMuteToggle}
            >
              <Ionicons 
                name={isMuted ? "volume-mute" : "volume-medium"} 
                size={20} 
                color="#cdd6f4" 
              />
              <Text style={styles.menuText}>
                {isMuted ? 'Unmute' : 'Mute'} Notifications
              </Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemHover
              ]} 
              onPress={handleAbout}
            >
              <Ionicons name="information-circle-outline" size={20} color="#cdd6f4" />
              <Text style={styles.menuText}>About</Text>
            </Pressable>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
