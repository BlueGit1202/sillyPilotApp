# SillyPilot Technical Documentation

## System Architecture

### Current Implementation
- **Frontend**: Vue.js PWA with mobile-first design
- **Backend**: Express.js server
- **Database**: SQLite
- **AI Integration**: OpenRouter API with multi-model support
- **Authentication**: OAuth PKCE flow
- **Theming**: Catppuccin Mocha with dark mode aesthetics

### Design System

#### Catppuccin Theme Integration
```css
:root {
  /* Base Colors */
  --ctp-mauve: #cba6f7;
  --ctp-pink: #f5c2e7;
  --ctp-blue: #89b4fa;
  --ctp-lavender: #b4befe;
  --ctp-green: #a6e3a1;
  
  /* Surface Colors */
  --ctp-surface0: #313244;
  --ctp-surface1: #45475a;
  
  /* Overlay Colors */
  --ctp-overlay0: #6c7086;
  --ctp-blue-alpha: rgba(137, 180, 250, 0.2);
}
```

#### UI Components

1. **Message Bubbles**
```css
.message-bubble {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.message-bubble-user {
  background: linear-gradient(135deg, var(--ctp-mauve) 0%, var(--ctp-pink) 100%);
  transform-origin: bottom right;
}

.message-bubble-ai {
  background: linear-gradient(135deg, var(--ctp-blue) 0%, var(--ctp-lavender) 100%);
  transform-origin: bottom left;
}
```

2. **Character Presence**
```javascript
const characterStates = {
  active: {
    indicator: '🟢',
    animation: 'pulse',
    status: 'Here with you'
  },
  thinking: {
    indicator: '💭',
    animation: 'bounce',
    status: 'Processing...'
  },
  idle: {
    indicator: '💤',
    animation: 'float',
    status: 'Taking a breather'
  }
};
```

3. **Interactive Elements**
```css
.message-input-container {
  background: var(--ctp-surface0);
  border: 1px solid var(--ctp-overlay0);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.nav-item {
  position: relative;
  overflow: hidden;
}
```

### Core Components

#### Frontend Architecture
1. **Views**
   - HomeView: Chat list and navigation
   - ChatView: Main chat interface
   - CharacterEditView: Character creation/editing
   - SettingsView: App configuration
   - BrowseCharactersView: Character gallery

2. **State Management**
   ```javascript
   {
     currentView: string,
     chats: Array,
     currentChat: Object,
     settings: {
       aiProvider: string,
       sillyTavernIp: string,
       sillyTavernPort: string,
       openRouterApiKey: string,
       theme: string
     }
   }
   ```

#### Backend Services

1. **Database Service**
   - SQLite integration
   - Schema management
   - Data persistence
   - Migration handling

2. **AI Provider Service**
   - OpenRouter API integration
   - Model routing
   - Response processing
   - Error handling

3. **Image Service**
   - Avatar management
   - File upload handling
   - Image optimization

### API Integration

#### OpenRouter Implementation
```javascript
const openRouterRequest = {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
    "HTTP-Referer": "${YOUR_SITE_URL}",
    "X-Title": "${YOUR_SITE_NAME}",
    "Content-Type": "application/json"
  },
  body: {
    model: "openai/gpt-3.5-turbo",
    messages: [
      {role: "user", content: string}
    ]
  }
}
```

### Database Schema

```sql
-- Core Tables
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  settings JSON
);

CREATE TABLE characters (
  id INTEGER PRIMARY KEY,
  name TEXT,
  avatar TEXT,
  personality TEXT,
  scenario TEXT,
  first_message TEXT
);

CREATE TABLE chats (
  id INTEGER PRIMARY KEY,
  character_id INTEGER,
  created_at TIMESTAMP
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  chat_id INTEGER,
  role TEXT,
  content TEXT,
  timestamp TIMESTAMP
);

-- System Tables
CREATE TABLE onboarding_status (
  id INTEGER PRIMARY KEY,
  completed BOOLEAN,
  completed_at TIMESTAMP,
  current_step INTEGER
);

CREATE TABLE system_events (
  id INTEGER PRIMARY KEY,
  event_type TEXT,
  event_data TEXT,
  created_at TIMESTAMP
);
```

## Feature Implementation

### Chat System
1. **Message Handling**
   - Real-time updates
   - Message regeneration
   - Image support
   - Typing indicators
   - Scroll management
   - Animated message bubbles
   - Feedback animations

2. **Character System**
   - Creation/editing interface
   - Avatar management
   - Metadata handling
   - SillyTavern compatibility
   - Presence indicators
   - Status animations

3. **Settings Management**
   - AI provider configuration
   - Theme customization
   - Connection management
   - Factory reset capability
   - Status indicators

### Onboarding Flow

1. **Welcome Screen**
   - Feature introduction
   - Getting started guide
   - Animated transitions

2. **AI Provider Setup**
   - Provider selection
   - API key configuration
   - Connection testing
   - Visual feedback

3. **Character Creation**
   - Basic information
   - Personality definition
   - Avatar upload
   - Initial message setup
   - Preview animations

4. **Tutorial**
   - Feature walkthrough
   - Basic usage guide
   - Quick tips
   - Interactive elements

## React Native Migration Plan

### Architecture Changes

1. **Frontend Framework**
   - Migrate from Vue.js to React Native/Expo
   - Implement native navigation
   - Convert web components to native components
   - Maintain state management patterns
   - Port Catppuccin theme to native styles

2. **Data Layer**
   - Replace SQLite with React Native compatible storage
   - Implement offline-first architecture
   - Add data synchronization

3. **UI/UX Adaptations**
   - Convert web-based UI to native components
   - Implement native gestures
   - Optimize for mobile performance
   - Maintain design consistency
   - Adapt animations for native platform

### Mobile-Specific Enhancements

1. **Native Features**
   - Haptic feedback
   - Native animations
   - Platform-specific UI components
   - Device-specific optimizations

2. **Performance Optimizations**
   - Use native animations
   - Implement lazy loading
   - Optimize image handling
   - Memory management

3. **Accessibility**
   - VoiceOver/TalkBack support
   - Dynamic text sizing
   - Reduced motion support
   - High contrast support

### Implementation Priorities

1. **Core Features**
   - Chat functionality
   - Character management
   - Settings system
   - AI integration

2. **Enhanced Features**
   - Push notifications
   - Background processing
   - Native image handling
   - Deep linking

3. **Mobile-Specific Features**
   - Biometric authentication
   - Native sharing
   - Camera integration
   - Local file system access

## Development Guidelines

### Best Practices
1. Keep secrets in .env files
2. Use OpenPipe AI for inference
3. Implement proper error handling
4. Follow mobile-first design principles
5. Maintain comprehensive documentation

### Code Standards
1. TypeScript for type safety
2. ESLint for code quality
3. Jest for testing
4. Proper component organization
5. Clear naming conventions

### Design Standards
1. Maintain Catppuccin theme consistency
2. Implement smooth animations
3. Provide clear feedback
4. Ensure touch-friendly targets
5. Support dark mode

### Security Considerations
1. Secure storage of API keys
2. Data encryption
3. Input validation
4. Error handling
5. Rate limiting

## Future Roadmap

### Short-term Goals
1. Complete React Native migration
2. Implement offline support
3. Add push notifications
4. Enhance error handling

### Medium-term Goals
1. Add multi-device sync
2. Implement end-to-end encryption
3. Add advanced media support
4. Create plugin system

### Long-term Vision
1. Character marketplace
2. Advanced AI features
3. Community features
4. Extended platform support

## User Experience Guidelines

### Feedback System
```javascript
const feedbackMessages = {
  connection: {
    success: "Connected and ready to chat!",
    error: "Having trouble connecting. Give it another shot?",
    reconnecting: "Reconnecting..."
  },
  message: {
    sent: "Message sent ✨",
    failed: "Message didn't go through. Try again?",
    typing: "Thinking of a response..."
  }
};
```

### Mobile Optimizations
```css
@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }
  
  .character-avatar {
    width: 40px;
    height: 40px;
  }
  
  .settings-card {
    padding: 12px;
  }
}
```

### Performance Considerations
1. Use native animations
2. Implement passive scroll listeners
3. Lazy load images and components
4. Cache character data locally
5. Optimize render cycles

# SillyPilot Technical Documentation

## Additional Technical Specifications

### STAHP (SillyTavern API Host Plugin) Integration

The STAHP system provides a bridge between SillyPilot and SillyTavern, enabling seamless character and chat synchronization. It implements a queue-based architecture to handle asynchronous communication between the UI and API layers.

#### Core Architecture
```javascript
/**
 * STAHP uses a dual-queue system:
 * - uiQueue: Handles outgoing requests from the UI
 * - apiQueue: Manages incoming responses from the API
 * 
 * This architecture enables asynchronous communication while maintaining
 * request-response pairing through unique IDs.
 */
const systemQueues = {
  uiQueue: [], // UI -> API requests
  apiQueue: [] // API -> UI responses
};
```

#### API Endpoints and Their Purpose
1. **GET /ex/poll**
   - Enables UI to poll for pending actions
   - Returns queued commands/requests
   - Used for real-time updates

2. **POST /ex/response**
   - Handles API responses
   - Matches responses with requests via UUID
   - Ensures response delivery

3. **POST /api/slash**
   - Executes SillyTavern commands
   - Supports character management
   - Enables advanced control

4. **POST /api/send**
   - Handles message sending
   - Manages chat flow
   - Supports multimedia content

5. **GET /api/get-characters**
   - Retrieves character list
   - Syncs with SillyTavern
   - Maintains character consistency

#### Implementation Example
```javascript
/**
 * The STAHP implementation provides a robust communication layer
 * between SillyPilot and SillyTavern, ensuring reliable data
 * exchange and command execution.
 */
const stahpImplementation = {
  // Execute SillyTavern commands
  executeCommand: async (command) => {
    const id = generateUUID();
    uiQueue.push({
      id,
      action: 'executeSlashCommands',
      command: command
    });
    return await waitForResponse(id);
  },
  
  // Send messages with proper queueing
  sendMessage: async (message) => {
    const id = generateUUID();
    uiQueue.push({
      id,
      action: 'send',
      message: message
    });
    return await waitForResponse(id);
  }
};
```

### Character Card System

The character card system is a crucial component that handles the parsing and management of character metadata embedded within PNG/JPG files. This system is compatible with SillyTavern's character format and provides robust error handling.

#### PNG Metadata Structure
```typescript
/**
 * Character cards store metadata in PNG chunks with specific identifiers.
 * The system supports both 'chara' and 'tavern' chunk types for
 * compatibility with different character card formats.
 */
interface CharacterCard {
  name: string;
  personality: string;
  scenario: string;
  first_message: string;
  avatar_uri: string;
  metadata: {
    creator: string;
    version: string;
    tags: string[];
    extensions: {
      specs: string; // Character specifications
      world: string; // World/setting information
      system_prompt: string; // Base behavior instructions
    }
  }
}
```

#### Metadata Parsing Implementation
```typescript
/**
 * The PNG parser is carefully implemented to handle various edge cases
 * and ensure reliable metadata extraction across different character
 * card formats and versions.
 */
const parseCharacterCard = async (file: File): Promise<CharacterCard> => {
  // Read PNG chunks with error handling
  const chunks = await readPNGChunks(file);
  
  // Locate character data chunk with format detection
  const characterChunk = chunks.find(chunk => 
    chunk.type === 'chara' || 
    chunk.type === 'tavern'
  );
  
  // Parse metadata with validation
  const metadata = JSON.parse(
    new TextDecoder().decode(characterChunk.data)
  );
  
  return {
    ...metadata,
    avatar_uri: URL.createObjectURL(file)
  };
};
```

### Typography and Design System

The application uses JetBrains Mono as its primary font, chosen for its excellent readability and distinct character shapes. The typography system is designed to maintain consistency across different platforms while supporting the Catppuccin theme.

#### Font System Implementation
```css
/**
 * Typography Implementation
 * - JetBrains Mono: Primary monospace font
 * - Carefully selected glyphs for UI elements
 * - Consistent spacing and sizing system
 */
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap; // Optimize font loading
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* Typography System Variables */
:root {
  --font-mono: 'JetBrains Mono', monospace;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Carefully selected glyphs for UI consistency */
  --glyph-arrow: '→';
  --glyph-check: '✓';
  --glyph-cross: '×';
  --glyph-bullet: '•';
}
```

### Idle System Implementation

The idle system is a sophisticated feature that simulates character presence and activity levels. Rather than a simple online/offline status, it provides a dynamic simulation of character engagement based on user settings and conversation context.

#### Core Idle System
```typescript
/**
 * The idle system manages character activity levels and automatic responses.
 * It uses a combination of user settings and AI-generated content to create
 * a more immersive experience.
 */
interface IdleState {
  level: number; // Activity level (0-100)
  isActive: boolean;
  lastInteraction: Date;
  autoReply: boolean;
  typingSimulation: boolean;
}

class IdleManager {
  private state: IdleState;
  
  // Carefully crafted prompt for natural status generation
  private statusPrompt: string = `
    You are {character_name}. Based on the current conversation and your personality,
    generate a brief, natural status message that reflects your current mood and
    activity level ({idle_level}%). Keep it under 60 characters and in character.
    Previous messages: {last_messages}
  `;

  constructor() {
    this.state = {
      level: 50, // Default activity level
      isActive: true,
      lastInteraction: new Date(),
      autoReply: true,
      typingSimulation: true
    };
  }

  /**
   * Updates the idle level with smooth animation
   * Higher levels increase the likelihood of automatic responses
   */
  updateIdleLevel(level: number) {
    this.state.level = level;
    this.updateActivityState();
  }

  /**
   * Handles automatic replies based on idle level
   * Includes realistic typing simulation
   */
  async handleAutoReply() {
    if (this.state.autoReply && this.state.level > 70) {
      await this.simulateTyping();
      return this.generateResponse();
    }
  }

  /**
   * Generates contextual status messages using the AI
   * Takes into account recent conversation history
   */
  async generateStatus(): Promise<string> {
    const context = {
      character_name: this.characterName,
      idle_level: this.state.level,
      last_messages: this.getRecentMessages(3)
    };
    
    return await this.aiProvider.complete(
      this.formatPrompt(this.statusPrompt, context)
    );
  }
}
```

#### Idle System UI Implementation
```css
/**
 * The idle slider provides visual feedback for the character's
 * activity level while maintaining the Catppuccin theme aesthetics.
 */
.idle-slider {
  position: relative;
  height: 4px;
  background: var(--ctp-surface0);
  border-radius: 2px;
  overflow: hidden;
}

.idle-slider__fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--ctp-blue) 0%,
    var(--ctp-mauve) 50%,
    var(--ctp-pink) 100%
  );
  transition: width 0.3s ease, opacity 0.3s ease;
}

.idle-slider__handle {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background: var(--ctp-blue);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: transform 0.2s ease;
}
```
# SillyPilot Technical Overview

## Core Architecture
- Vue.js frontend application
- Express.js backend (implied by API endpoints)
- SQLite database for persistent storage
- Support for multiple AI providers (OpenRouter, SillyTavern)
- Mobile-first responsive design

## Current Features

### Authentication & Settings
- Settings management for AI provider configuration
- OpenRouter API key storage
- SillyTavern connection settings (IP/Port)
- Server status monitoring (60-second interval checks)

### Character Management
- Character creation and editing
- Character avatar upload support
- Character metadata storage (personality, scenario, etc.)
- Character card format compatible with SillyTavern

### Chat Interface
1. Home Screen
   - List of active chats
   - Character avatars
   - Last message timestamps
   - Navigation to settings
   - Create new chat option

2. Chat Screen
   - Message history display
   - Real-time message sending
   - Image upload support
   - Typing indicators
   - Message regeneration
   - Idle mode with timed messages
   - Scroll to bottom functionality
   - Expandable text input
   - Mood detection system
   - Emotion detection in messages

3. Settings Screen
   - AI provider selection
   - Server configuration
   - Theme selection (Catppuccin support)
   - Connection testing

## Data Flow

### Message Processing
1. User sends message
   ```
   User Input -> Frontend validation -> API request -> AI Provider -> Response -> UI Update
   ```

2. Character Creation
   ```
   Character Form -> Image Upload -> Character Data Storage -> Chat Creation -> Chat Interface
   ```

3. Settings Management
   ```
   Settings Input -> Validation -> API Storage -> Connection Test -> Status Update
   ```

## Missing Components

### Critical Features
1. Authentication System
   - User accounts
   - Session management
   - Access control

2. Error Handling
   - Comprehensive error messages
   - Offline mode support
   - Connection retry logic

3. Data Management
   - Chat history export
   - Character backup/restore
   - Message search functionality

### User Experience
1. Notifications
   - Push notification system
   - Message alerts
   - Connection status alerts

2. Media Support
   - Voice messages
   - File attachments
   - Image gallery

3. Chat Features
   - Message editing
   - Message deletion
   - Chat archiving
   - Chat categories/folders

### Technical Debt
1. Performance
   - Message pagination
   - Image optimization
   - Cache management

2. Testing
   - Unit tests
   - Integration tests
   - E2E testing

3. Documentation
   - API documentation
   - Setup guide
   - Deployment instructions

## Integration Points

### OpenRouter Integration
- API key management
- Character card injection
- Response processing
- Error handling

### SillyTavern Integration
- STAHP plugin dependency
- Connection management
- Character format compatibility
- Message synchronization

## Future Considerations
1. Multi-device sync
2. Offline support
3. End-to-end encryption
4. Character sharing marketplace
5. Voice interaction
6. Custom themes support
7. Plugin system
8. Analytics and usage tracking
