import { Stack, Text, YStack, styled } from 'tamagui'
import { Button } from '../../../components/Button'
import { Ionicons } from '@expo/vector-icons'
import { XStack } from 'tamagui'

const LogContainer = styled(Stack, {
  backgroundColor: '$surface1',
  padding: '$4',
  borderRadius: '$3',
  minHeight: 200,
  maxHeight: 400,
})

const LogEntry = styled(Text, {
  fontFamily: '$mono',
  color: '$text',
  fontSize: 14,
  opacity: 0.8,
  marginBottom: '$1',
})

export interface SystemLog {
  timestamp: string
  message: string
  type: 'info' | 'warning' | 'error'
}

interface LogViewerProps {
  logs: SystemLog[]
  onExport: () => void
}

export const LogViewer = ({ logs, onExport }: LogViewerProps) => {
  return (
    <YStack space="$2">
      <LogContainer>
        {logs.map((log, index) => (
          <LogEntry key={index}>
            [{log.timestamp}] {log.message}
          </LogEntry>
        ))}
      </LogContainer>
      <Button
        backgroundColor="$surface1"
        pressStyle={{ opacity: 0.8 }}
        onPress={onExport}
        height={44}
      >
        <XStack space="$2" alignItems="center">
          <Ionicons name="download-outline" size={20} color="#cdd6f4" />
          <Button.Text color="$text">Export Logs</Button.Text>
        </XStack>
      </Button>
    </YStack>
  )
}
