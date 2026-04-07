import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, HelpCircle, Keyboard } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { Path } from '@/router/paths'

const Wrap = styled.div`
  position: relative;
`

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
  font-size: 13px;
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
  width: 22px;
  height: 22px;
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

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
`

const Popover = styled.div`
  position: fixed;
  width: 200px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border-hover);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  padding: 4px;
  animation: fadeIn 0.12s ease;
`

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--studio-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: inherit;
  text-align: left;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

const MenuDivider = styled.div`
  height: 1px;
  background: var(--studio-border);
  margin: 4px 6px;
`

const DangerItem = styled(MenuItem)`
  color: var(--studio-error);

  &:hover {
    background: rgba(239, 68, 68, 0.08);
    color: var(--studio-error);
  }
`

interface UserMenuProps {
  expanded: boolean
}

export function UserMenu({ expanded }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ left: 0, bottom: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const activeProject = useProjectStore((s) => s.activeProject)
  const pid = activeProject?.id

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({
        left: rect.left,
        bottom: window.innerHeight - rect.top + 6,
      })
    }
  }, [open])

  const handleAction = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <Wrap>
      <AvatarBtn ref={btnRef} expanded={expanded} onClick={() => setOpen(!open)}>
        <Avatar>
          <User size={12} />
        </Avatar>
        <AvatarLabel visible={expanded}>Menu</AvatarLabel>
      </AvatarBtn>

      {open && createPortal(
        <>
          <Backdrop onClick={() => setOpen(false)} />
          <Popover style={{ left: pos.left, bottom: pos.bottom }}>
            <MenuItem onClick={() => handleAction(() => window.open('https://github.com/anthropics/claude-code/issues', '_blank'))}>
              <HelpCircle size={14} />
              Help & Feedback
            </MenuItem>

            <MenuItem onClick={() => handleAction(() => {})}>
              <Keyboard size={14} />
              Keyboard Shortcuts
            </MenuItem>

            {pid && (
              <>
                <MenuDivider />
                <DangerItem onClick={() => handleAction(() => {
                  useProjectStore.getState().setActiveProject(null)
                  navigate(Path.Home)
                })}>
                  <LogOut size={14} />
                  Exit Project
                </DangerItem>
              </>
            )}
          </Popover>
        </>,
        document.body,
      )}
    </Wrap>
  )
}
