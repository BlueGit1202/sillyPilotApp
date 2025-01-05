# SillyPilot Technical Stack Documentation

## Overview
SillyPilot is a mobile-first AI chat application built using React Native and Expo, focusing on character-based roleplay conversations while maintaining privacy and security. The application is designed to work with both OpenRouter's public AI models and local SillyTavern instances.

## Core Technology Stack

### Frontend Framework
- **React Native** (v0.76.3)
- **Expo** (v52.0.17)
- **TypeScript** (v5.3.3)

### UI/UX Framework
- **Tamagui** (v1.120.1)
  - Custom UI component library optimized for React Native
  - Includes animations and theming support
  - Uses @tamagui/core for base components
  - Integrated with @tamagui/animations-react-native

### Navigation
- **React Navigation** (v7.x)
  - @react-navigation/native
  - @react-navigation/native-stack
  - Type-safe navigation using TypeScript

### Device Integration
- **Expo Modules**
  - expo-font: Custom font management
  - expo-image-picker: Native image selection
  - expo-linear-gradient: Gradient effects
  - expo-navigation-bar: Navigation bar customization
  - expo-status-bar: Status bar management

### Animation & Interaction
- react-native-reanimated: Advanced animations
- react-native-safe-area-context: Safe area handling
- react-native-screens: Screen management
- react-native-svg: SVG support

### Development Tools
- @babel/core
- babel-plugin-transform-inline-environment-variables
- TypeScript configuration
- Expo development server

## Architecture

### Component Structure
```
src/
├── components/
│   ├── chat/
│   │   ├── CharacterHeader.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatListItem.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatSettings.tsx
│   │   ├── EmptyChat.tsx
│   │   └── IdleSettingsModal.tsx
│   ├── Button.tsx
│   ├── Header.tsx
│   ├── LoadingScreen.tsx
│   ├── StatusBar.tsx
│   └── Toast.tsx
├── screens/
│   ├── chat/
│   ├── character/
│   ├── settings/
│   └── welcome/
├── navigation/
├── theme/
└── utils/
```

### Key Features Implementation

#### Chat System
- Real-time message handling
- Message regeneration capability
- Typing indicators
- Idle mode with configurable intervals
- Message editing and history management
- Character mood and status tracking

#### Character Management
- Character creation and editing
- Avatar support
- Personality customization
- Mood system integration

#### UI/UX Features
- Native mobile-optimized interface
- Dark theme support
- Safe area handling
- Custom toast notifications
- Keyboard-aware layouts

## Integration Points

### AI Provider Integration
1. **OpenRouter Integration**
   - API key management
   - Model selection
   - Credit system integration

2. **SillyTavern Connection**
   - Local server connection
   - External connections plugin support
   - Advanced character customization

## Security & Privacy Features

- Local-only storage mode
- No data collection or processing
- Private conversation handling
- Secure API key management

## Development Workflow

### Setup Requirements
```bash
# Installation
npm install

# Development
npm start

# Platform-specific development
npm run ios
npm run android
npm run web
```

### Build Configuration
- Expo configuration in app.json
- Tamagui theme configuration
- TypeScript configuration
- Babel configuration for environment variables

## Future Development Areas

1. **Planned Features**
   - Offline support
   - Push notifications
   - Character Card V3 spec support
   - Local model integration
   - V-Tuber / VRM support
   - Real-time voice features

2. **Technical Improvements**
   - Performance optimizations
   - Enhanced type safety
   - Expanded test coverage
   - Component library refinement

## Performance Considerations

- Optimized message rendering
- Efficient state management
- Responsive UI handling
- Memory management for chat history
- Image optimization for avatars

## Best Practices

1. **Code Organization**
   - TypeScript for type safety
   - Component modularity
   - Consistent styling patterns
   - Clear separation of concerns

2. **State Management**
   - Local component state
   - Props drilling minimization
   - Context usage where appropriate
   - Efficient re-render management

3. **Error Handling**
   - Graceful error recovery
   - User-friendly error messages
   - Network error handling
   - API failure management

## Contributing Guidelines

1. Fork the repository
2. Create feature branch
3. Follow TypeScript standards
4. Maintain existing code style
5. Include appropriate tests
6. Submit pull request

---

*This documentation is maintained as part of the SillyPilot project. Last updated: 2024*
