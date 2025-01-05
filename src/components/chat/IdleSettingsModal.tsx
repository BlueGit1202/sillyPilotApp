import React from 'react'
import { Sheet, YStack, Text, XStack, Switch, Button, Slider } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'

interface IdleSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idleMode: boolean
  onIdleModeChange: (enabled: boolean) => void
  idleInterval: number
  onIdleIntervalChange: (value: number) => void
}

export const IdleSettingsModal = ({
  open,
  onOpenChange,
  idleMode,
  onIdleModeChange,
  idleInterval,
  onIdleIntervalChange
}: IdleSettingsModalProps) => {
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[45]}
      position={0}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame>
        <Sheet.Handle />
        <YStack space="$4" padding="$4">
          <Text
            color="$lavender"
            fontSize={20}
            fontWeight="600"
            textAlign="center"
          >
            Idle Mode Settings
          </Text>

          <XStack
            space="$4"
            alignItems="center"
            justifyContent="space-between"
            backgroundColor="$surface0"
            padding="$4"
            borderRadius="$4"
          >
            <XStack space="$2" alignItems="center">
              <Ionicons 
                name={idleMode ? "timer" : "timer-outline"} 
                size={24} 
                color="#cdd6f4" 
              />
              <YStack>
                <Text color="$text" fontSize={16}>Idle Mode</Text>
                <Text color="$overlay0" fontSize={14}>
                  Automatically generate responses
                </Text>
              </YStack>
            </XStack>
            <Switch
              checked={idleMode}
              onCheckedChange={onIdleModeChange}
              backgroundColor={idleMode ? '$blue' : '$surface1'}
            >
              <Switch.Thumb animation="bouncy" />
            </Switch>
          </XStack>

          <YStack space="$2">
            <Text color="$text" fontSize={16}>
              Response Interval: {idleInterval} seconds
            </Text>
            <Slider
              defaultValue={[idleInterval]}
              min={5}
              max={120}
              step={5}
              onValueChange={([value]) => onIdleIntervalChange(value)}
              disabled={!idleMode}
            >
              <Slider.Track backgroundColor="$surface1">
                <Slider.TrackActive backgroundColor="$blue" />
              </Slider.Track>
              <Slider.Thumb
                circular
                index={0}
                backgroundColor="$blue"
                borderColor="$background"
                borderWidth={2}
                elevation={4}
              />
            </Slider>
          </YStack>

          <Button
            backgroundColor="$surface0"
            onPress={() => onOpenChange(false)}
          >
            <Button.Text>Done</Button.Text>
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
