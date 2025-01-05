import { View, Pressable, StyleSheet, Alert } from 'react-native'
import { Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'

type IconName = React.ComponentProps<typeof Ionicons>['name']

interface HeaderProps {
  navigation: NativeStackNavigationProp<RootStackParamList>
  title: string
  hasUnsavedChanges?: boolean
  onRightPress?: () => void
  rightIcon?: IconName
}

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
  button: {
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

export const ScreenHeader = ({ 
  navigation, 
  title,
  hasUnsavedChanges,
  onRightPress,
  rightIcon
}: HeaderProps) => {
  const insets = useSafeAreaInsets()

  const handleBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: "Don't leave", style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      )
    } else {
      navigation.goBack()
    }
  }

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        <Pressable 
          style={styles.button} 
          onPress={handleBack}
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
            {title}
          </Text>
        </View>

        <Pressable 
          style={styles.button}
          onPress={onRightPress}
        >
          {rightIcon ? (
            <Ionicons name={rightIcon} size={24} color="#cdd6f4" />
          ) : (
            <View style={{ width: 24, height: 24 }} />
          )}
        </Pressable>
      </View>
    </View>
  )
}
