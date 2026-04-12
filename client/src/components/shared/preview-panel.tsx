import { Flex, Box } from '@chakra-ui/react'
import { RunnerPreview } from '@/components/runner/preview'

interface PreviewPanelProps {
  onClose: () => void
}

export function PreviewPanel({ onClose }: PreviewPanelProps) {
  return (
    <Flex direction="column" css={{ height: '100%', background: 'var(--studio-bg-sidebar)' }}>
      <Box flex={1} css={{ minHeight: 0, overflow: 'hidden' }}>
        <RunnerPreview onClose={onClose} />
      </Box>
    </Flex>
  )
}
