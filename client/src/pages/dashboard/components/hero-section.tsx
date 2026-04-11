import { Text, Logo, VStack } from '@/components/shared/ui'

export function HeroSection() {
  return (
    <VStack gap="lg" css={{ alignItems: 'center', textAlign: 'center' }}>
      <Logo size={130} variant="brand" />

      <VStack gap="sm" css={{ alignItems: 'center' }}>
        <Text variant="display" css={{ fontSize: '38px' }}>
          Blacksmith Studio
        </Text>
        <Text variant="body" color="tertiary" css={{ maxWidth: '360px', lineHeight: 1.6 }}>
          The AI-native IDE. Build any project with your favourite models — solo or with a coordinated team of AI agents.
        </Text>
      </VStack>
    </VStack>
  )
}
