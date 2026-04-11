import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

/* ── Animations ── */

/* ── Animations ── */

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

/* ── Layout ── */

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
`

export const Content = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  min-height: 0;
`

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  width: 100%;
  max-width: 720px;
  padding: 48px 32px;
  margin: 0 auto;
  animation: ${fadeUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`

/* ── Hero ── */

export const HeroWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

export const Greeting = styled.h1`
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.035em;
  color: var(--studio-text-primary);
  text-align: center;
  line-height: 1.15;
`

export const ProjectName = styled.span`
  color: var(--studio-text-tertiary);
`

export const Subtitle = styled.p`
  font-size: 14px;
  color: var(--studio-text-muted);
  text-align: center;
  line-height: 1.6;
  max-width: 380px;
  letter-spacing: -0.005em;
`

/* ── Mode Selector Label ── */

export const ModeLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--studio-text-muted);
`

/* ── Cards ── */

export const CardsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  width: 100%;
`

export const Card = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  padding: 0;
  border-radius: 16px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
  }

  &:hover {
    border-color: var(--studio-border-hover);
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);

    &::before { opacity: 1; }

    .card-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    .card-icon { transform: scale(1.05); }

    .card-glow { opacity: 1; }
  }

  &:active {
    transform: translateY(-1px);
    transition-duration: 0.1s;
  }
`

export const CardGlow = styled.div<{ variant: 'chat' | 'team' }>`
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 2px;
  opacity: 0;
  transition: opacity 0.25s ease;
  background: ${({ variant }) =>
    variant === 'chat'
      ? 'linear-gradient(90deg, transparent, var(--studio-accent), transparent)'
      : 'linear-gradient(90deg, transparent, var(--studio-green), transparent)'};
`

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px 24px 0;
  width: 100%;
`

export const CardIcon = styled.div<{ variant: 'chat' | 'team' }>`
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  background: ${({ variant }) =>
    variant === 'chat'
      ? 'var(--studio-bg-surface)'
      : 'linear-gradient(135deg, var(--studio-green-border), var(--studio-green-subtle))'};
  border: 1px solid ${({ variant }) =>
    variant === 'chat'
      ? 'var(--studio-border)'
      : 'var(--studio-green-border)'};
  color: ${({ variant }) =>
    variant === 'chat'
      ? 'var(--studio-text-primary)'
      : 'var(--studio-green)'};
`

export const CardTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`

export const CardTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--studio-text-primary);
  line-height: 1.2;
`

export const CardBadge = styled.span<{ variant: 'chat' | 'team' }>`
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: ${({ variant }) =>
    variant === 'chat' ? 'var(--studio-text-muted)' : 'var(--studio-green)'};
`

export const CardBody = styled.div`
  padding: 16px 24px 0;
  width: 100%;
`

export const CardDesc = styled.p`
  font-size: 13px;
  color: var(--studio-text-secondary);
  line-height: 1.55;
  margin: 0;
  letter-spacing: -0.005em;
`

export const CardFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  padding: 16px 24px 0;
`

export const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  font-size: 12px;
  font-weight: 450;
  color: var(--studio-text-secondary);
  letter-spacing: -0.005em;
  border-bottom: 1px solid var(--studio-border);

  &:last-child { border-bottom: none; }

  svg { flex-shrink: 0; }
`

export const FeatureDot = styled.div<{ variant: 'chat' | 'team' }>`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ variant }) =>
    variant === 'chat' ? 'var(--studio-text-muted)' : 'var(--studio-green)'};
  flex-shrink: 0;
`

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 18px 24px;
  margin-top: auto;
`

export const CardAction = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-tertiary);
  transition: color 0.2s ease;

  .card-arrow {
    opacity: 0;
    transform: translateX(-4px);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
  }
`

/* ── Divider ── */

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--studio-border) 30%,
    var(--studio-border) 70%,
    transparent
  );
`

/* ── Recent Section ── */

export const RecentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
`

export const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--studio-text-muted);
`

export const RecentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const RecentItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;

  &:hover {
    background: var(--studio-bg-surface);

    .recent-arrow { opacity: 1; transform: translateX(0); }
  }
`

export const RecentIcon = styled.div<{ variant: 'chat' | 'team' }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ variant }) =>
    variant === 'team'
      ? 'linear-gradient(135deg, var(--studio-green-subtle), var(--studio-green-subtle))'
      : 'var(--studio-bg-surface)'};
  color: ${({ variant }) =>
    variant === 'team' ? 'var(--studio-green)' : 'var(--studio-text-tertiary)'};
  flex-shrink: 0;
`

export const RecentBody = styled.div`
  flex: 1;
  min-width: 0;
`

export const RecentTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-primary);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const RecentMeta = styled.div`
  font-size: 11px;
  color: var(--studio-text-muted);
  margin-top: 1px;
  display: flex;
  align-items: center;
  gap: 5px;
`

export const RecentArrow = styled.div`
  color: var(--studio-text-muted);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.15s ease;
  display: flex;
  flex-shrink: 0;
`

export const Sep = styled.span`
  font-size: 9px;
  color: var(--studio-border-hover);
`

export const TypeBadge = styled.span<{ variant: 'chat' | 'team' }>`
  font-size: 10px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 4px;
  background: ${({ variant }) =>
    variant === 'team' ? 'var(--studio-green-subtle)' : 'var(--studio-bg-surface)'};
  color: ${({ variant }) =>
    variant === 'team' ? 'var(--studio-green)' : 'var(--studio-text-tertiary)'};
`
