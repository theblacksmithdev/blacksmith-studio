import styled from '@emotion/styled'
import { Anvil } from 'lucide-react'
import { Text, VStack, spacing, radii } from '@/components/shared/ui'
import { ForgeIllustration } from './illustrations/forge-illustration'

const LogoWrap = styled.div`
  width: 52px;
  height: 52px;
  border-radius: ${radii['2xl']};
  background: var(--studio-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing.xs};
  box-shadow: var(--studio-shadow);
`

const IllustrationWrap = styled.div`
  width: 200px;
  height: 200px;
  opacity: 0.18;
  margin-top: ${spacing.xl};
  align-self: center;
`

export function HeroSection() {
  return (
    <VStack gap="md" css={{ alignItems: 'flex-start' }}>
      <LogoWrap>
        <Anvil size={22} color="var(--studio-accent-fg)" />
      </LogoWrap>

      <Text variant="display">
        Blacksmith<br />
        <Text as="span" variant="display" color="tertiary">Studio</Text>
      </Text>

      <Text variant="body" color="muted" css={{ maxWidth: '280px' }}>
        Build full-stack Django + React apps with Claude AI — solo or with a team of specialists.
      </Text>

      <IllustrationWrap>
        <ForgeIllustration width="100%" height="100%" />
      </IllustrationWrap>
    </VStack>
  )
}
