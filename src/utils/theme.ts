import { THEME_NAMES } from '../constants'
import type { ThemeTokens } from '../types'

// Catppuccin Mocha Theme
const mochaTheme: ThemeTokens = {
  colors: {
    background: '#1e1e2e',
    surface0: '#313244',
    surface1: '#45475a',
    surface2: '#585b70',
    base: '#cdd6f4',
    text: '#cdd6f4',
    subtext0: '#a6adc8',
    subtext1: '#bac2de',
    overlay0: '#6c7086',
    overlay1: '#7f849c',
    overlay2: '#9399b2',
    blue: '#89b4fa',
    lavender: '#b4befe',
    red: '#f38ba8',
    peach: '#fab387',
    yellow: '#f9e2af',
    green: '#a6e3a1',
    teal: '#94e2d5',
    sky: '#89dceb',
    sapphire: '#74c7ec',
    mauve: '#cba6f7',
    pink: '#f5c2e7',
    flamingo: '#f2cdcd',
    rosewater: '#f5e0dc',
    maroon: '#eba0ac'
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 24,
    6: 32,
    7: 48,
    8: 64,
    true: 8
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 24,
    6: 32,
    7: 48,
    8: 64,
    true: 8
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 24,
    6: 32,
    7: 48,
    8: 64,
    true: 8
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500
  }
}

// Catppuccin Latte Theme
const latteTheme: ThemeTokens = {
  colors: {
    background: '#eff1f5',
    surface0: '#ccd0da',
    surface1: '#bcc0cc',
    surface2: '#acb0be',
    base: '#4c4f69',
    text: '#4c4f69',
    subtext0: '#6c6f85',
    subtext1: '#5c5f77',
    overlay0: '#9ca0b0',
    overlay1: '#8c8fa1',
    overlay2: '#7c7f93',
    blue: '#1e66f5',
    lavender: '#7287fd',
    red: '#d20f39',
    peach: '#fe640b',
    yellow: '#df8e1d',
    green: '#40a02b',
    teal: '#179299',
    sky: '#04a5e5',
    sapphire: '#209fb5',
    mauve: '#8839ef',
    pink: '#ea76cb',
    flamingo: '#dd7878',
    rosewater: '#dc8a78',
    maroon: '#e64553'
  },
  space: mochaTheme.space,
  size: mochaTheme.size,
  radius: mochaTheme.radius,
  zIndex: mochaTheme.zIndex
}

// Theme Utilities
export const getTheme = (themeName: typeof THEME_NAMES[keyof typeof THEME_NAMES]): ThemeTokens => {
  switch (themeName) {
    case THEME_NAMES.MOCHA:
      return mochaTheme
    case THEME_NAMES.LATTE:
      return latteTheme
    default:
      return mochaTheme
  }
}

export const getThemeColor = (theme: ThemeTokens, color: keyof ThemeTokens['colors']): string => {
  return theme.colors[color]
}

export const getThemeSpace = (theme: ThemeTokens, space: keyof ThemeTokens['space']): number => {
  return theme.space[space]
}

export const getThemeRadius = (theme: ThemeTokens, radius: keyof ThemeTokens['radius']): number => {
  return theme.radius[radius]
}

// Theme Modifiers
export const createAlphaColor = (color: string, alpha: number): string => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const createGradient = (color1: string, color2: string, angle = 45): string => {
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`
}

export const createShadow = (
  color: string,
  offsetX = 0,
  offsetY = 4,
  blur = 8,
  spread = 0
): string => {
  return `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${createAlphaColor(color, 0.2)}`
}

// Theme Helpers
export const isDarkTheme = (themeName: typeof THEME_NAMES[keyof typeof THEME_NAMES]): boolean => {
  return themeName === THEME_NAMES.MOCHA
}

export const getContrastColor = (backgroundColor: string): string => {
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? '#000000' : '#ffffff'
}

// Component Theme Helpers
export const getButtonTheme = (theme: ThemeTokens, variant: 'default' | 'primary' | 'secondary' | 'danger') => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: theme.colors.blue,
        color: theme.colors.base,
        hoverColor: createAlphaColor(theme.colors.blue, 0.8)
      }
    case 'secondary':
      return {
        backgroundColor: theme.colors.surface1,
        color: theme.colors.text,
        hoverColor: theme.colors.surface2
      }
    case 'danger':
      return {
        backgroundColor: theme.colors.red,
        color: theme.colors.base,
        hoverColor: createAlphaColor(theme.colors.red, 0.8)
      }
    default:
      return {
        backgroundColor: theme.colors.surface0,
        color: theme.colors.text,
        hoverColor: theme.colors.surface1
      }
  }
}

export const getInputTheme = (theme: ThemeTokens, error?: boolean) => {
  return {
    backgroundColor: theme.colors.surface0,
    color: theme.colors.text,
    borderColor: error ? theme.colors.red : theme.colors.overlay0,
    placeholderColor: theme.colors.overlay0,
    focusBorderColor: error ? theme.colors.red : theme.colors.blue
  }
}

export const getCardTheme = (theme: ThemeTokens) => {
  return {
    backgroundColor: theme.colors.surface0,
    borderColor: theme.colors.overlay0,
    shadowColor: createShadow(theme.colors.background),
    headerColor: theme.colors.lavender,
    contentColor: theme.colors.text
  }
}

// Animation Helpers
export const getFadeAnimation = () => ({
  from: { opacity: 0 },
  to: { opacity: 1 }
})

export const getSlideAnimation = (theme: ThemeTokens, direction: 'up' | 'down' | 'left' | 'right') => {
  const offset = 20
  const getTransform = () => {
    switch (direction) {
      case 'up':
        return `translateY(${offset}px)`
      case 'down':
        return `translateY(-${offset}px)`
      case 'left':
        return `translateX(${offset}px)`
      case 'right':
        return `translateX(-${offset}px)`
    }
  }

  return {
    from: {
      opacity: 0,
      transform: getTransform()
    },
    to: {
      opacity: 1,
      transform: 'translate(0)'
    }
  }
}
