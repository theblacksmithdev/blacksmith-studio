import styled from '@emotion/styled'
import { ArrowRight } from 'lucide-react'
import { Text, Avatar, spacing, radii, shadows } from '@/components/shared/ui'
import type { ReactNode } from 'react'

const Root = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  border-radius: ${radii['3xl']};
  border: 1px solid var(--studio-glass-border);
  background: var(--studio-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: ${shadows.sm};
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: var(--studio-border-hover);
    transform: translateY(-3px);
    box-shadow: ${shadows.lg};

    .mode-arrow { opacity: 1; transform: translateX(0); }
    .mode-glow { opacity: 1; }
    .mode-illustration { opacity: 0.4; }
  }

  &:active {
    transform: translateY(-1px);
    transition-duration: 0.1s;
  }
`

const Glow = styled.div<{ $accent: boolean }>`
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 2px;
  opacity: 0;
  transition: opacity 0.25s ease;
  background: ${({ $accent }) =>
    $accent
      ? 'linear-gradient(90deg, transparent, var(--studio-green), transparent)'
      : 'linear-gradient(90deg, transparent, var(--studio-accent), transparent)'};
`

const IllustrationWrap = styled.div`
  position: absolute;
  top: ${spacing.lg};
  right: ${spacing.lg};
  width: 100px;
  height: 80px;
  opacity: 0.15;
  pointer-events: none;
  transition: opacity 0.3s ease;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing['2xl']} ${spacing['2xl']} 0;
  width: 100%;
`

const Body = styled.div`
  padding: ${spacing.lg} ${spacing['2xl']} 0;
  width: 100%;
  max-width: 85%;
`

const Features = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${spacing.lg} ${spacing['2xl']} 0;
`

const FeatureRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: 6px 0;
  border-bottom: 1px solid var(--studio-border);

  &:last-child { border-bottom: none; }
`

const Dot = styled.div<{ $accent: boolean }>`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ $accent }) => $accent ? 'var(--studio-green)' : 'var(--studio-text-muted)'};
  flex-shrink: 0;
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${spacing.xl} ${spacing['2xl']};
  margin-top: auto;
`

const Arrow = styled.span`
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
`

interface ModeCardProps {
  icon: ReactNode
  title: string
  badge: string
  description: string
  features: string[]
  action: string
  accent?: boolean
  illustration?: ReactNode
  onClick: () => void
}

export function ModeCard({
  icon,
  title,
  badge,
  description,
  features,
  action,
  accent = false,
  illustration,
  onClick,
}: ModeCardProps) {
  return (
    <Root onClick={onClick}>
      <Glow className="mode-glow" $accent={accent} />

      {illustration && (
        <IllustrationWrap className="mode-illustration">
          {illustration}
        </IllustrationWrap>
      )}

      <Header>
        <Avatar size="md" variant={accent ? 'active' : 'default'} icon={icon} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text variant="subtitle">{title}</Text>
          <Text variant="caption" color={accent ? 'success' : 'muted'}>{badge}</Text>
        </div>
      </Header>

      <Body>
        <Text variant="bodySmall" color="secondary">{description}</Text>
      </Body>

      <Features>
        {features.map((f) => (
          <FeatureRow key={f}>
            <Dot $accent={accent} />
            <Text variant="bodySmall" color="secondary">{f}</Text>
          </FeatureRow>
        ))}
      </Features>

      <Footer>
        <Text variant="label" color="tertiary" css={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
          {action}
          <Arrow className="mode-arrow"><ArrowRight size={14} /></Arrow>
        </Text>
      </Footer>
    </Root>
  )
}
