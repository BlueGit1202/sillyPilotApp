import { createTheme } from 'tamagui'
import { tokens } from './tokens'

const light = createTheme({
  background: '#eff1f5',
  backgroundHover: '#e6e9ef',
  backgroundPress: '#dce0e8',
  backgroundFocus: '#ccd0da',
  color: '#4c4f69',
  colorHover: '#5c5f77',
  colorPress: '#6c6f85',
  colorFocus: '#7c7f93',
  borderColor: '#ccd0da',
  borderColorHover: '#bcc0cc',
  borderColorFocus: '#acb0be',
  borderColorPress: '#9ca0b0',
  shadowColor: 'rgba(76, 79, 105, 0.2)',
  shadowColorHover: 'rgba(76, 79, 105, 0.3)',
})

const dark = createTheme({
  background: tokens.color.background,
  backgroundHover: tokens.color.surface0,
  backgroundPress: tokens.color.surface1,
  backgroundFocus: tokens.color.surface2,
  color: tokens.color.text,
  colorHover: tokens.color.overlay2,
  colorPress: tokens.color.overlay1,
  colorFocus: tokens.color.overlay0,
  borderColor: tokens.color.surface0,
  borderColorHover: tokens.color.surface1,
  borderColorFocus: tokens.color.surface2,
  borderColorPress: tokens.color.overlay0,
  shadowColor: 'rgba(17, 17, 27, 0.2)',
  shadowColorHover: 'rgba(17, 17, 27, 0.3)',
})

// Component-specific themes
const dark_Button = createTheme({
  background: tokens.color.mauve,
  backgroundHover: tokens.color.pink,
  backgroundPress: tokens.color.lavender,
  backgroundFocus: tokens.color.blue,
  color: tokens.color.background,
  colorHover: tokens.color.background,
  colorPress: tokens.color.background,
  colorFocus: tokens.color.background,
})

const light_Button = createTheme({
  background: '#8839ef',
  backgroundHover: '#7287fd',
  backgroundPress: '#209fb5',
  backgroundFocus: '#1e66f5',
  color: '#eff1f5',
  colorHover: '#eff1f5',
  colorPress: '#eff1f5',
  colorFocus: '#eff1f5',
})

export const themes = {
  light,
  dark,
  light_Button,
  dark_Button,
} as const

export type AppThemes = typeof themes
