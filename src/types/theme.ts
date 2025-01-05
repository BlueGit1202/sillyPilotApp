// Theme Names
export type ThemeName = 'mocha' | 'latte'
export type SystemTheme = 'system'
export type ThemeMode = ThemeName | SystemTheme

// Theme Tokens
export interface ThemeTokens {
  colors: {
    background: string
    surface0: string
    surface1: string
    surface2: string
    base: string
    text: string
    subtext0: string
    subtext1: string
    overlay0: string
    overlay1: string
    overlay2: string
    blue: string
    lavender: string
    red: string
    peach: string
    yellow: string
    green: string
    teal: string
    sky: string
    sapphire: string
    mauve: string
    pink: string
    flamingo: string
    rosewater: string
    maroon: string
  }
  space: {
    0: number
    1: number
    2: number
    3: number
    4: number
    5: number
    6: number
    7: number
    8: number
    true: number
  }
  size: {
    0: number
    1: number
    2: number
    3: number
    4: number
    5: number
    6: number
    7: number
    8: number
    true: number
  }
  radius: {
    0: number
    1: number
    2: number
    3: number
    4: number
    5: number
    6: number
    7: number
    8: number
    true: number
  }
  zIndex: {
    0: number
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

// Theme Settings
export interface ThemeSettings {
  theme: ThemeMode
  useSystemTheme: boolean
  darkMode: boolean
}

// Component Theme Types
export interface ButtonTheme {
  backgroundColor: string
  color: string
  hoverColor: string
}

export interface InputTheme {
  backgroundColor: string
  color: string
  borderColor: string
  placeholderColor: string
  focusBorderColor: string
}

export interface CardTheme {
  backgroundColor: string
  borderColor: string
  shadowColor: string
  headerColor: string
  contentColor: string
}

export interface AnimationTheme {
  from: {
    opacity: number
    transform?: string
  }
  to: {
    opacity: number
    transform?: string
  }
}

// Theme Constants
export const THEME_NAMES = {
  MOCHA: 'mocha' as ThemeName,
  LATTE: 'latte' as ThemeName,
  SYSTEM: 'system' as SystemTheme
} as const
