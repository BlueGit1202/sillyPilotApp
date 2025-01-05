import { createTokens } from 'tamagui'

// Catppuccin Mocha theme colors
export const tokens = createTokens({
  color: {
    // Base colors
    background: '#1e1e2e',
    text: '#cdd6f4',
    base: '#ffffff',
    
    // Accent colors
    mauve: '#cba6f7',
    pink: '#f5c2e7',
    blue: '#89b4fa',
    lavender: '#b4befe',
    green: '#a6e3a1',
    red: '#f38ba8',
    yellow: '#f9e2af',
    peach: '#fab387',
    sky: '#89dceb',
    
    // Surface colors
    surface0: '#313244',
    surface1: '#45475a',
    surface2: '#585b70',
    
    // Overlay colors
    overlay0: '#6c7086',
    overlay1: '#7f849c',
    overlay2: '#9399b2',
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 40,
    true: 8,
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 40,
    true: 8,
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    true: 8,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
  fontFamily: {
    heading: 'InterBold',
    body: 'Inter',
    mono: 'JetBrains-Mono',
  }
})

export type AppTokens = typeof tokens
