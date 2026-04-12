import { useEffect, useRef } from 'react'

/** Clamps a fixed-position menu so it stays within the viewport. */
export function useMenuPosition(deps: unknown[] = []) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = menuRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.right > window.innerWidth) {
      el.style.left = `${window.innerWidth - rect.width - 8}px`
    }
    if (rect.bottom > window.innerHeight) {
      el.style.top = `${window.innerHeight - rect.height - 8}px`
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return menuRef
}
