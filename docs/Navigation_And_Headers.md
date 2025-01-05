# Navigation and Headers in SillyPilot

## Navigation Structure

The app uses React Navigation with a native stack navigator. The navigation flow is:

```
RootStack
├── ChatList (Home)
│   └── Chat
│       └── CreateCharacter (Edit Mode)
├── BrowseCharacters
├── CreateCharacter (Create Mode)
└── Settings
```

## Header Implementation

### Core Principles
1. Each screen implements its own header for consistent navigation handling
2. Headers follow a consistent slim design pattern
3. Form screens handle unsaved changes in their headers

### Header Template
```typescript
// screenHeader.tsx
import { View, Pressable, StyleSheet } from 'react-native'
import { Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'

interface HeaderProps {
  navigation: NativeStackNavigationProp<RootStackParamList>
  title: string
  hasUnsavedChanges?: boolean
  onRightPress?: () => void
  rightIcon?: string
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
```

### Header Types

1. **Form Screen Headers**
   - Used by: CreateCharacter, Settings
   - Features:
     * Back button with unsaved changes handling
     * Screen title
     * Optional right action button
   - Implementation:
     ```typescript
     <ScreenHeader
       navigation={navigation}
       title="Settings"
       hasUnsavedChanges={hasUnsavedChanges}
     />
     ```

2. **List Screen Headers**
   - Used by: ChatList, BrowseCharacters
   - Features:
     * Back button when not on home
     * Screen title
     * Settings gear (on home) or other actions
   - Implementation:
     ```typescript
     <ScreenHeader
       navigation={navigation}
       title="Browse Characters"
       rightIcon="settings-outline"
       onRightPress={() => navigation.navigate('Settings')}
     />
     ```

3. **Chat Screen Header**
   - Custom implementation for character-specific features
   - Features:
     * Back button
     * Character avatar with status
     * Character name and mood
     * Chat settings button
   - Implementation:
     ```typescript
     <CharacterHeader
       character={character}
       onBack={() => navigation.goBack()}
       onSettingsPress={() => setShowSettings(true)}
     />
     ```

## Navigation Best Practices

1. **Form Screen Navigation**
   - Handle unsaved changes in header's back action
   - Use navigation.goBack() for cancellation
   - Clear form state after successful save

2. **List Screen Navigation**
   - Use navigation.navigate() for forward navigation
   - Handle back navigation automatically through header
   - Maintain list state during navigation

3. **Chat Screen Navigation**
   - Custom back handling for chat context
   - Preserve chat state during character edits
   - Handle modal states properly

## Testing Checklist

### Form Screens
- [ ] Back prompts for unsaved changes
- [ ] Can discard changes
- [ ] Save clears changes state
- [ ] Cancel returns to previous screen

### List Screens
- [ ] Back returns to previous screen
- [ ] Settings/action button works
- [ ] List state preserved during navigation

### Chat Screen
- [ ] Back returns to chat list
- [ ] Character edit preserves chat
- [ ] Settings modal works properly

## Common Issues & Solutions

1. **Duplicate Headers**
   - Set headerShown: false in screen options
   - Use custom header in screen component
   - Example:
     ```typescript
     <Stack.Screen
       name="Settings"
       component={SettingsScreen}
       options={{ headerShown: false }}
     />
     ```

2. **Navigation State Loss**
   - Use navigation params for important data
   - Maintain state in parent components
   - Consider navigation state persistence

3. **Form State Management**
   - Track unsaved changes
   - Handle back navigation properly
   - Clear state after successful actions
