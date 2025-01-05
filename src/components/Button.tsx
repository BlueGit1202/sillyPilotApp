import { GetProps, Stack, Text, createStyledContext, styled, useTheme, withStaticProperties } from 'tamagui'
import { cloneElement, isValidElement, useContext } from 'react'

export const ButtonContext = createStyledContext({
  size: 4,
})

export const ButtonFrame = styled(Stack, {
  name: 'Button',
  context: ButtonContext,
  backgroundColor: '$background',
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  pressStyle: {
    opacity: 0.8,
  },

  variants: {
    size: {
      1: {
        height: 36,
        borderRadius: 18,
        paddingHorizontal: '$3',
        gap: '$2',
      },
      2: {
        height: 44,
        borderRadius: 22,
        paddingHorizontal: '$4',
        gap: '$2',
      },
      3: {
        height: 52,
        borderRadius: 26,
        paddingHorizontal: '$5',
        gap: '$2',
      },
      4: {
        height: 56,
        borderRadius: 28,
        paddingHorizontal: '$6',
        gap: '$2',
      },
    },
  } as const,

  defaultVariants: {
    size: 4,
  },
})

export const ButtonText = styled(Text, {
  name: 'ButtonText',
  context: ButtonContext,
  color: '$color',
  userSelect: 'none',
  fontFamily: '$body',
  fontSize: 16,
  fontWeight: '600',
  
  variants: {
    size: {
      1: { fontSize: 14 },
      2: { fontSize: 15 },
      3: { fontSize: 16 },
      4: { fontSize: 16 },
    },
  } as const,
})

interface IconProps {
  size?: number
  color?: string
}

interface ButtonIconProps {
  children: React.ReactElement<IconProps>
}

const ButtonIcon = ({ children }: ButtonIconProps) => {
  const { size } = useContext(ButtonContext.context)
  const theme = useTheme()
  
  if (!isValidElement(children)) return null

  const iconSizeMap = {
    1: 16,
    2: 18,
    3: 20,
    4: 22,
  }

  return cloneElement(children, {
    size: iconSizeMap[size as keyof typeof iconSizeMap] || 20,
    color: theme.color.get(),
  })
}

export type ButtonProps = GetProps<typeof ButtonFrame>

export const Button = withStaticProperties(ButtonFrame, {
  Text: ButtonText,
  Icon: ButtonIcon,
  Props: ButtonContext.Provider,
})
