import type { ReactNode } from 'react'
import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUiStore } from '@/stores/ui-store'
import { useThemeMode } from '@/hooks/use-theme-mode'
import { useWindowState } from '@/hooks/use-window'
import { Tooltip } from '@/components/shared/tooltip'

const Bar = styled.div<{ fullscreen: boolean }>`
  display: flex;
  align-items: center;
  height: 46px;
  flex-shrink: 0;
  background: var(--studio-bg-sidebar);
  border-bottom: 1px solid var(--studio-border);
  -webkit-app-region: drag;
  user-select: none;
  padding-left: ${({ fullscreen }) => (fullscreen ? '14px' : '78px')};
  padding-right: 14px;
  transition: padding-left 0.2s ease;
`

export const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  -webkit-app-region: no-drag;
`

export const NavBtn = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
    &:hover {
      background: transparent;
      color: var(--studio-text-muted);
    }
  }
`

export const Center = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
`

export const TitleText = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const TitleTextBold = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const TitleSeparator = styled.span`
  color: var(--studio-text-muted);
  font-size: 13px;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  -webkit-app-region: no-drag;
`

const ActionBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

const StatusDot = styled.div<{ connected: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ connected }) => (connected ? 'var(--studio-green)' : 'var(--studio-error)')};
  margin-left: 4px;
`

interface TitleBarShellProps {
  /** Extra buttons rendered before back/forward nav */
  leading?: ReactNode
  /** Center content (title / breadcrumb) */
  center: ReactNode
}

export function TitleBarShell({ leading, center }: TitleBarShellProps) {
  const navigate = useNavigate()
  const { isFullscreen: fullscreen } = useWindowState()
  const connectionStatus = useUiStore((s) => s.connectionStatus)
  const { mode, toggle: toggleTheme } = useThemeMode()

  return (
    <Bar fullscreen={fullscreen}>
      <NavActions>
        {leading}
        <Tooltip content="Back">
          <NavBtn onClick={() => navigate(-1)}>
            <ChevronLeft size={15} />
          </NavBtn>
        </Tooltip>
        <Tooltip content="Forward">
          <NavBtn onClick={() => navigate(1)}>
            <ChevronRight size={15} />
          </NavBtn>
        </Tooltip>
      </NavActions>

      <Center>{center}</Center>

      <Actions>
        <Tooltip content={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <ActionBtn onClick={toggleTheme}>
            {mode === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </ActionBtn>
        </Tooltip>

        <Tooltip content={connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}>
          <StatusDot connected={connectionStatus === 'connected'} />
        </Tooltip>
      </Actions>
    </Bar>
  )
}
