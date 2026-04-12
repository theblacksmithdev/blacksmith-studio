import { useRef, useEffect, useState, useCallback } from 'react'

export function useAutoScroll(deps: unknown[]) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 40)
  }, [])

  const scrollToBottom = useCallback(() => {
    setAutoScroll(true)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return { bottomRef, containerRef, autoScroll, handleScroll, scrollToBottom }
}
