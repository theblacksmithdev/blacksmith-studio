import { Flex, Box, Text, IconButton } from '@chakra-ui/react'
import { X, PanelRightClose } from 'lucide-react'
import { RunnerPreview } from '@/components/runner/preview'

interface PreviewPanelProps {
  onClose: () => void
}

export function PreviewPanel({ onClose }: PreviewPanelProps) {
  return (
    <Flex
      direction="column"
      h="full"
      css={{
        background: 'var(--studio-bg-sidebar)',
        borderLeft: '1px solid var(--studio-border)',
      }}
    >
      <Flex
        align="center"
        gap={2}
        css={{
          padding: '10px 12px',
          borderBottom: '1px solid var(--studio-border)',
          flexShrink: 0,
        }}
      >
        <PanelRightClose size={13} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
        <Text
          css={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--studio-text-secondary)',
            flex: 1,
          }}
        >
          Preview
        </Text>
        <IconButton
          aria-label="Close preview"
          size="xs"
          variant="ghost"
          onClick={onClose}
          title="Close preview"
          css={{
            width: '24px',
            height: '24px',
            borderRadius: '5px',
            color: 'var(--studio-text-muted)',
            '&:hover': {
              background: 'var(--studio-bg-hover)',
              color: 'var(--studio-text-primary)',
            },
          }}
        >
          <X size={14} />
        </IconButton>
      </Flex>

      <Box flex={1} minH={0} overflow="hidden">
        <RunnerPreview />
      </Box>
    </Flex>
  )
}
