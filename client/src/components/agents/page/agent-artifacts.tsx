import { Flex } from '@chakra-ui/react'
import { FileCode } from 'lucide-react'
import { Text } from '@/components/shared/ui'

export function AgentArtifacts() {
  return (
    <Flex direction="column" align="center" justify="center" gap="14px" css={{ flex: 1, padding: '40px 24px', textAlign: 'center' }}>
      <Flex css={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
        alignItems: 'center', justifyContent: 'center', color: 'var(--studio-text-muted)',
      }}>
        <FileCode size={22} />
      </Flex>
      <Flex direction="column" gap="4px" align="center">
        <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)' }}>
          Artifacts
        </Text>
        <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', maxWidth: '300px', lineHeight: 1.6 }}>
          Files created and modified by agents will appear here as they work on your project.
        </Text>
      </Flex>
    </Flex>
  )
}
