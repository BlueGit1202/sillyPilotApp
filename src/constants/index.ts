// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const

// OpenRouter Configuration
export const OPENROUTER_CONFIG = {
  BASE_URL: 'https://openrouter.ai/api/v1',
  DEFAULT_MODEL: 'qwen/qwen-2-7b-instruct:free',
  TEMPERATURE: 0.9,
  MAX_TOKENS: 1000,
  TOP_P: 0.9,
  FREQUENCY_PENALTY: 0,
  PRESENCE_PENALTY: 0,
  HEADERS: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'SillyPilot',
    'OpenAI-Organization': 'SillyPilot',
    'User-Agent': 'SillyPilot/1.0.0'
  }
} as const

// Storage Keys
export const STORAGE_KEYS = {
  SETTINGS: '@SillyPilot:settings',
  CHARACTERS: '@SillyPilot:characters',
  CHATS: '@SillyPilot:chats',
  ACTIVE_PROFILE: '@SillyPilot:activeProfile',
  PROFILES: '@SillyPilot:profiles',
  SYSTEM_LOGS: '@SillyPilot:systemLogs',
  AUTH_TOKEN: '@SillyPilot:authToken',
  THEME: '@SillyPilot:theme'
} as const

// Sync Configuration
export const SYNC_CONFIG = {
  INTERVAL: 30000, // 30 seconds
  RETRY_DELAY: 5000, // 5 seconds
  MAX_RETRIES: 3,
  BATCH_SIZE: 50
} as const

// Theme Names
export const THEME_NAMES = {
  MOCHA: 'mocha',
  LATTE: 'latte'
} as const

// Theme Configuration
export const THEME_CONFIG = {
  DARK: THEME_NAMES.MOCHA,
  LIGHT: THEME_NAMES.LATTE,
  SYSTEM: 'system'
} as const

// UI Constants
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  HEADER_HEIGHT: 56,
  BOTTOM_TAB_HEIGHT: 49,
  MODAL_ANIMATION: {
    DURATION: 300,
    EASING: 'easeInOut'
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32
  },
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
    FULL: 9999
  }
} as const

// Message Configuration
export const MESSAGE_CONFIG = {
  MAX_LENGTH: 2000,
  TYPING_INDICATOR_DELAY: 1500,
  REGENERATION_ATTEMPTS: 3,
  IDLE_TIMEOUT: 300000, // 5 minutes
  BATCH_SIZE: 50,
  LOAD_MORE_THRESHOLD: 20
} as const

// Character Configuration
export const CHARACTER_CONFIG = {
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_PERSONALITY_LENGTH: 500,
  MAX_SCENARIO_LENGTH: 1000,
  MAX_SYSTEM_PROMPT_LENGTH: 2000,
  MAX_FIRST_MESSAGE_LENGTH: 1000,
  MAX_TAGS: 10,
  MAX_TAG_LENGTH: 20,
  AVATAR_SIZE: {
    WIDTH: 512,
    HEIGHT: 512
  }
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: {
    OFFLINE: 'No internet connection available',
    TIMEOUT: 'Request timed out. Please try again',
    SERVER_ERROR: 'Server error occurred. Please try again later'
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid credentials provided',
    SESSION_EXPIRED: 'Session expired. Please log in again',
    UNAUTHORIZED: 'Unauthorized access'
  },
  CHAT: {
    SEND_FAILED: 'Failed to send message. Please try again',
    LOAD_FAILED: 'Failed to load chat history',
    REGENERATE_FAILED: 'Failed to regenerate message'
  },
  CHARACTER: {
    CREATE_FAILED: 'Failed to create character',
    UPDATE_FAILED: 'Failed to update character',
    DELETE_FAILED: 'Failed to delete character',
    INVALID_CARD: 'Invalid character card format'
  },
  SETTINGS: {
    SAVE_FAILED: 'Failed to save settings',
    LOAD_FAILED: 'Failed to load settings',
    SYNC_FAILED: 'Failed to sync settings'
  }
} as const

// Validation Rules
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9\s-_]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
} as const

// Feature Flags
export const FEATURES = {
  VOICE_INPUT: false,
  IMAGE_GENERATION: false,
  CHARACTER_SHARING: false,
  CHAT_EXPORT: false,
  MULTIPLE_AI_PROVIDERS: false,
  END_TO_END_ENCRYPTION: false,
  OFFLINE_MODE: true,
  REAL_TIME_SYNC: true
} as const
