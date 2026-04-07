import { useState, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-4px); }
  to   { opacity: 1; transform: translateX(0); }
`

const Tip = styled.div`
  position: fixed;
  z-index: 1000;
  padding: 5px 10px;
  border-radius: 8px;
  background: var(--studio-bg-hover-strong);
  color: var(--studio-text-primary);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  border: 1px solid var(--studio-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  animation: ${fadeIn} 0.15s ease;
`

interface SidebarTooltipProps {
  label: string
  visible: boolean
  children: ReactNode
}

export function SidebarTooltip({ label, visible, children }: SidebarTooltipProps) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  if (!visible) return <>{children}</>

  const handleEnter = () => {
    timerRef.current = setTimeout(() => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        setPos({
          top: rect.top + rect.height / 2,
          left: rect.right + 10,
        })
        setShow(true)
      }
    }, 400)
  }

  const handleLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setShow(false)
  }

  return (
    <div
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {show && createPortal(
        <Tip style={{ top: pos.top, left: pos.left, transform: 'translateY(-50%)' }}>
          {label}
        </Tip>,
        document.body,
      )}
    </div>
  )
}
