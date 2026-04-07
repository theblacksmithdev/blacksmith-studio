import styled from '@emotion/styled'
import { Anvil } from 'lucide-react'

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--studio-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
`

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--studio-text-primary);
  text-align: center;
  line-height: 1.3;
  margin-bottom: 8px;
`

const Subtitle = styled.p`
  font-size: 15px;
  color: var(--studio-text-tertiary);
  text-align: center;
  line-height: 1.6;
`

export function HomeHero() {
  return (
    <>
      <IconWrapper>
        <Anvil size={26} color="var(--studio-accent-fg)" />
      </IconWrapper>
      <Title>What are we building today?</Title>
      <Subtitle>Describe your idea or pick a starting point below.</Subtitle>
    </>
  )
}
