import { useCallback } from 'react'
import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Settings } from 'lucide-react'
import { useActiveProjectId } from '@/api/hooks/_shared'
import { Path, settingsPath } from '@/router/paths'
import { Menu } from '@/components/shared/ui'
import type { MenuOption } from '@/components/shared/ui'
import { SidebarTooltip } from './sidebar-tooltip'

const AvatarBtn = styled.button<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ expanded }) => (expanded ? '10px' : '0')};
  width: 100%;
  height: 36px;
  padding: ${({ expanded }) => (expanded ? '0 10px' : '0')};
  justify-content: ${({ expanded }) => (expanded ? 'flex-start' : 'center')};
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--studio-text-tertiary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  overflow: hidden;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-surface);
    color: var(--studio-text-secondary);
  }
`

const Avatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--studio-bg-hover);
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--studio-text-muted);
`

const AvatarLabel = styled.span<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  width: ${({ visible }) => (visible ? 'auto' : '0')};
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.15s ease;
`

interface UserMenuProps {
  expanded: boolean
}

export function UserMenu({ expanded }: UserMenuProps) {
  const navigate = useNavigate()
  const pid = useActiveProjectId()

  const options: MenuOption[] = pid ? [
    { icon: <Settings />, label: 'Settings', onClick: () => navigate(settingsPath(pid)) },
    { icon: <LogOut />, label: 'Exit Project', onClick: () => navigate(Path.Home), danger: true, separator: true },
  ] : []

  return (
    <SidebarTooltip label="Menu" visible={!expanded}>
      <Menu
        trigger={
          <AvatarBtn expanded={expanded}>
            <Avatar>
              <User size={12} />
            </Avatar>
            <AvatarLabel visible={expanded}>Menu</AvatarLabel>
          </AvatarBtn>
        }
        options={options}
        placement="top-start"
      />
    </SidebarTooltip>
  )
}
