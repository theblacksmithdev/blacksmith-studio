import { Box } from '@chakra-ui/react'
import { Sparkles } from 'lucide-react'
import { Text, Input, spacing, radii } from '@/components/shared/ui'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onRegenerate: () => void
  isGenerating: boolean
}

export function MessageInput({ value, onChange, onRegenerate, isGenerating }: MessageInputProps) {
  return (
    <Box css={{ marginBottom: spacing.xl }}>
      <Text variant="bodySmall" css={{ fontWeight: 500, marginBottom: spacing.sm, color: 'var(--studio-text-secondary)' }}>
        Commit message
      </Text>
      <Input
        size="md"
        value={isGenerating ? 'Generating...' : value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder="Describe your changes..."
        disabled={isGenerating}
        autoFocus
      />
      <Box
        as="button"
        onClick={isGenerating ? undefined : onRegenerate}
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.xs,
          marginTop: spacing.sm,
          padding: `${spacing.xs} ${spacing.sm}`,
          borderRadius: radii.md,
          border: 'none',
          background: 'transparent',
          color: 'var(--studio-text-muted)',
          fontSize: '12px',
          cursor: isGenerating ? 'default' : 'pointer',
          fontFamily: 'inherit',
          opacity: isGenerating ? 0.5 : 1,
          transition: 'all 0.1s ease',
          '&:hover': isGenerating ? {} : { color: 'var(--studio-text-primary)', background: 'var(--studio-bg-hover)' },
        }}
      >
        <Sparkles size={12} />
        Generate with AI
      </Box>
    </Box>
  )
}
