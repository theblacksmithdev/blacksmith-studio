import styled from '@emotion/styled'
import { css, keyframes } from '@emotion/react'

/* ── Animations ── */

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
`

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
`

/* ══════════════════════════════════════════
   Layout
   ══════════════════════════════════════════ */

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--studio-bg-main);
  animation: ${fadeIn} 0.15s ease;
`

/* ── Top bar ── */

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 20px;
  height: 48px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
  background: var(--studio-bg-sidebar);
`

export const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: transparent;
  color: var(--studio-text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
    background: var(--studio-bg-hover);
  }
`

export const TopBarDivider = styled.div`
  width: 1px;
  height: 18px;
  background: var(--studio-border);
  flex-shrink: 0;
`

export const AgentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
`

export const AgentIcon = styled.div<{ $active: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  ${({ $active }) => $active ? `
    background: linear-gradient(135deg, var(--studio-green-border), var(--studio-green-subtle));
    border: 1px solid var(--studio-green-border);
    color: var(--studio-green);
  ` : `
    background: var(--studio-bg-surface);
    border: 1px solid var(--studio-border);
    color: var(--studio-text-tertiary);
  `}
`

export const AgentName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--studio-text-primary);
  letter-spacing: -0.015em;
`

export const AgentStatusText = styled.div<{ $status: string }>`
  font-size: 11px;
  font-weight: 450;
  margin-top: 1px;
  color: ${({ $status }) =>
    $status === 'executing' || $status === 'thinking' ? 'var(--studio-green)'
    : $status === 'error' ? 'var(--studio-error)'
    : $status === 'done' ? 'var(--studio-text-secondary)'
    : 'var(--studio-text-muted)'
  };

  ${({ $status }) => ($status === 'executing' || $status === 'thinking') && css`
    background: linear-gradient(90deg, var(--studio-green) 0%, var(--studio-text-secondary) 50%, var(--studio-green) 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shimmer} 2.5s ease-in-out infinite;
  `}
`

export const TopBarStats = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
`

export const StatPill = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  color: var(--studio-text-muted);

  span {
    font-variant-numeric: tabular-nums;
    color: var(--studio-text-secondary);
  }
`

/* ══════════════════════════════════════════
   Content area
   ══════════════════════════════════════════ */

export const ContentArea = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`

/* ── Stream column ── */

export const StreamColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--studio-bg-main);
`

export const StreamHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`

export const StreamTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
`

export const LiveDot = styled.span<{ $active: boolean }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${({ $active }) => $active ? 'var(--studio-green)' : 'var(--studio-border-hover)'};
  flex-shrink: 0;

  ${({ $active }) => $active && css`
    animation: ${pulse} 1.5s ease-in-out infinite;
    box-shadow: 0 0 4px rgba(16, 163, 127, 0.4);
  `}
`

/* ── Stream body with max-width centering ── */

export const StreamBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--studio-scrollbar); border-radius: 3px; }
`

export const StreamInner = styled.div`
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`

/* ── Empty state ── */

export const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--studio-text-muted);
  font-size: 13px;
  letter-spacing: -0.005em;
  text-align: center;
  max-width: 260px;
  margin: 0 auto;
  line-height: 1.6;
`

export const EmptyIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--studio-green-subtle), var(--studio-green-subtle));
  border: 1px solid var(--studio-green-subtle);
  color: var(--studio-green);
  margin-bottom: 4px;
`

/* ══════════════════════════════════════════
   Chat bubbles
   ══════════════════════════════════════════ */

export const MsgGroup = styled.div`
  animation: ${fadeUp} 0.15s ease;
`

/* ── User ── */

export const UserRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 3px;
`

export const UserBubble = styled.div`
  max-width: 72%;
  padding: 9px 14px;
  border-radius: 16px 16px 4px 16px;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
  white-space: pre-wrap;
  letter-spacing: -0.005em;
`

/* ── Agent ── */

export const AgentRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 3px;
`

export const AgentAvatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-tertiary);
`

export const AgentBubble = styled.div`
  max-width: calc(100% - 36px);
  padding: 9px 14px;
  border-radius: 4px 16px 16px 16px;
  background: var(--studio-bg-surface);
  color: var(--studio-text-primary);
  border: 1px solid var(--studio-border);
  word-break: break-word;
  letter-spacing: -0.005em;
  overflow: hidden;

  .markdown-body {
    font-size: 14px;
    line-height: 1.6;

    > *:first-child { margin-top: 0; }
    > *:last-child { margin-bottom: 0; }

    p { margin-bottom: 6px; }
    pre { margin: 8px 0; }
    ul, ol { margin-bottom: 6px; }
  }
`

export const AgentLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: var(--studio-green);
  letter-spacing: 0.03em;
  text-transform: capitalize;
  margin-bottom: 2px;
  display: block;
`

/* ── Thinking ── */

export const ThinkingLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #8b5cf6;
  letter-spacing: 0.03em;
  margin-bottom: 2px;
  display: block;
`

export const ThinkingBubble = styled.div`
  max-width: calc(100% - 36px);
  padding: 9px 14px;
  border-radius: 4px 16px 16px 16px;
  background: var(--studio-purple-subtle);
  color: var(--studio-text-secondary);
  border: 1px solid var(--studio-purple-subtle);
  word-break: break-word;
  font-style: italic;
  letter-spacing: -0.005em;
  overflow: hidden;

  .markdown-body {
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--studio-text-secondary);

    > *:first-child { margin-top: 0; }
    > *:last-child { margin-bottom: 0; }

    p { margin-bottom: 6px; }
    pre { margin: 8px 0; }
  }
`

/* ── System ── */

export const SystemRow = styled.div`
  display: flex;
  justify-content: flex-start;
  padding: 4px 0 4px 36px;
`

export const SystemBubble = styled.div<{ $error?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 10px;
  background: ${({ $error }) => $error ? 'var(--studio-error-subtle))' : 'var(--studio-bg-surface)'};
  border: 1px solid ${({ $error }) => $error ? 'var(--studio-error-subtle))' : 'var(--studio-border)'};
  color: ${({ $error }) => $error ? 'var(--studio-error)' : 'var(--studio-text-muted)'};
  font-size: 11px;
  font-weight: 450;
  max-width: 85%;
  text-align: center;
  line-height: 1.4;

  svg { flex-shrink: 0; }
`

/* ══════════════════════════════════════════
   Tool call cards
   ══════════════════════════════════════════ */

export const ToolRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin: 1px 0;
  padding-left: 36px;
`

export const ToolIcon = styled.div<{ $result?: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
  background: ${({ $result }) => $result ? 'rgba(34, 197, 94, 0.05)' : 'var(--studio-blue-subtle)'};
  color: ${({ $result }) => $result ? '#22c55e' : '#3b82f6'};
  border: 1px solid ${({ $result }) => $result ? 'rgba(34, 197, 94, 0.1)' : 'var(--studio-blue-subtle)'};
`

export const ToolCard = styled.div`
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  transition: border-color 0.12s ease;

  &:hover { border-color: var(--studio-border-hover); }
`

export const ToolHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
`

export const ToolName = styled.span`
  font-size: 11px;
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', Menlo, monospace;
  color: #3b82f6;
  letter-spacing: 0.01em;
`

export const ToolTime = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
`

export const ToolCodeWrap = styled.div`
  margin-top: 4px;
  max-height: 240px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--studio-scrollbar); border-radius: 2px; }

  .markdown-body {
    font-size: 13px;
    line-height: 1.5;

    > *:first-child { margin-top: 0; }
    > *:last-child { margin-bottom: 0; }

    pre { margin: 0; }
  }
`

/* ── Collapsible ── */

export const CollapsibleContent = styled.div<{ $open: boolean }>`
  max-height: ${({ $open }) => $open ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  margin-top: ${({ $open }) => $open ? '4px' : '0'};
`

export const ToggleBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: none;
  background: none;
  padding: 3px 0;
  font-size: 11px;
  font-weight: 500;
  color: var(--studio-text-muted);
  cursor: pointer;
  font-family: inherit;
  transition: color 0.12s ease;

  &:hover { color: var(--studio-text-secondary); }
`

/* ══════════════════════════════════════════
   Chat input
   ══════════════════════════════════════════ */

export const InputArea = styled.div`
  border-top: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  flex-shrink: 0;
`

export const InputWrap = styled.div`
  max-width: 680px;
  margin: 0 auto;
  padding: 10px 24px 14px;
`

export const InputCard = styled.div`
  position: relative;
  background: var(--studio-bg-main);
  border-radius: 14px;
  border: 1px solid var(--studio-border);
  transition: all 0.15s ease;

  &:focus-within {
    border-color: var(--studio-border-hover);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.03);
  }
`

export const InputFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 8px 14px;
`

export const InputHint = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  user-select: none;
  opacity: 0.5;
  display: flex;
  align-items: center;
  gap: 3px;
`

export const SendBtn = styled.button<{ $on: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: inherit;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  background: ${({ $on }) => $on ? 'var(--studio-accent)' : 'var(--studio-bg-hover)'};
  color: ${({ $on }) => $on ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)'};
  cursor: ${({ $on }) => $on ? 'pointer' : 'default'};

  &:hover {
    ${({ $on }) => $on && 'transform: scale(1.06);'}
  }
  &:active {
    ${({ $on }) => $on && 'transform: scale(0.96);'}
  }
`

/* ══════════════════════════════════════════
   Info panel (right sidebar)
   ══════════════════════════════════════════ */

export const InfoPanel = styled.div`
  width: 280px;
  flex-shrink: 0;
  border-left: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--studio-scrollbar); border-radius: 3px; }
`

export const InfoHero = styled.div`
  padding: 28px 20px 24px;
  border-bottom: 1px solid var(--studio-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
`

export const HeroIconWrap = styled.div<{ $active: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  ${({ $active }) => $active ? `
    background: linear-gradient(135deg, var(--studio-green-border), var(--studio-green-subtle));
    border: 1px solid var(--studio-green-border);
    color: var(--studio-green);
  ` : `
    background: var(--studio-bg-surface);
    border: 1px solid var(--studio-border);
    color: var(--studio-text-tertiary);
  `}
`

export const HeroTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--studio-text-primary);
  letter-spacing: -0.02em;
`

export const HeroDesc = styled.div`
  font-size: 12.5px;
  color: var(--studio-text-muted);
  line-height: 1.6;
  max-width: 230px;
`

export const HeroBadge = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;

  ${({ $status }) => {
    switch ($status) {
      case 'executing':
      case 'thinking':
        return `background: var(--studio-green-subtle); color: var(--studio-green); border: 1px solid var(--studio-green-border);`
      case 'done':
        return `background: var(--studio-bg-hover); color: var(--studio-text-primary); border: 1px solid var(--studio-border);`
      case 'error':
        return `background: var(--studio-error-subtle)); color: var(--studio-error); border: 1px solid var(--studio-error-subtle);`
      default:
        return `background: var(--studio-bg-surface); color: var(--studio-text-muted); border: 1px solid var(--studio-border);`
    }
  }}
`

export const HeroDot = styled.span<{ $status: string }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${({ $status }) =>
    $status === 'executing' || $status === 'thinking' ? 'var(--studio-green)'
    : $status === 'done' ? 'var(--studio-accent)'
    : $status === 'error' ? 'var(--studio-error)'
    : 'var(--studio-text-muted)'
  };
`

export const InfoSection = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--studio-border);
  &:last-child { border-bottom: none; }
`

export const InfoSectionLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  margin-bottom: 12px;
`

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`

export const InfoMetric = styled.div`
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--studio-bg-main);
  border: 1px solid var(--studio-border);
`

export const MetricValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--studio-text-primary);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`

export const MetricLabel = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: var(--studio-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
`

/* ── Team card ── */

export const TeamCard = styled.div`
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
`

export const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
`

export const TeamIconWrap = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--studio-green-subtle);
  color: var(--studio-green);
  flex-shrink: 0;
`

export const TeamTitle = styled.div`
  font-size: 12.5px;
  font-weight: 600;
  color: var(--studio-text-primary);
  letter-spacing: -0.01em;
`

export const TeamDesc = styled.div`
  font-size: 11.5px;
  color: var(--studio-text-muted);
  line-height: 1.5;
  margin-bottom: 10px;
`

export const TeamMemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`

export const TeamMember = styled.div<{ $isSelf: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 7px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: ${({ $isSelf }) => $isSelf ? 600 : 450};
  color: ${({ $isSelf }) => $isSelf ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)'};
  background: ${({ $isSelf }) => $isSelf ? 'var(--studio-bg-surface)' : 'transparent'};
  transition: background 0.1s ease;

  ${({ $isSelf }) => !$isSelf && `&:hover { background: var(--studio-bg-surface); }`}
  svg { flex-shrink: 0; color: var(--studio-text-muted); }
`

export const SelfTag = styled.span`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--studio-green);
  margin-left: 2px;
`

export const MemberStatusDot = styled.span<{ $status: string }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-left: auto;
  flex-shrink: 0;
  background: ${({ $status }) =>
    $status === 'executing' || $status === 'thinking' ? 'var(--studio-green)'
    : $status === 'done' ? 'var(--studio-accent)'
    : $status === 'error' ? 'var(--studio-error)'
    : 'transparent'
  };

  ${({ $status }) => ($status === 'executing' || $status === 'thinking') && css`
    box-shadow: 0 0 4px var(--studio-green-border);
  `}
`
