import { Flex } from '@chakra-ui/react'
import { Sparkles } from 'lucide-react'
import { Text, Textarea, Button, Skeleton, spacing } from '@/components/shared/ui'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onRegenerate: () => void
  isGenerating: boolean
}

export function MessageInput({ value, onChange, onRegenerate, isGenerating }: MessageInputProps) {
  return (
    <Flex direction="column" gap={spacing.sm} css={{ marginBottom: spacing.xl }}>
      <Flex align="center" justify="space-between">
        <Text variant="bodySmall" css={{ fontWeight: 500, color: 'var(--studio-text-secondary)' }}>
          Commit message
        </Text>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          disabled={isGenerating}
        >
          <Sparkles size={12} />
          {isGenerating ? 'Generating...' : 'Generate with AI'}
        </Button>
      </Flex>

      {isGenerating ? (
        <Skeleton variant="rectangular" height="80px" />
      ) : (
        <Textarea
          size="md"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your changes..."
          autoFocus
          css={{ resize: 'none', minHeight: '80px' }}
        />
      )}
    </Flex>
  )
}
