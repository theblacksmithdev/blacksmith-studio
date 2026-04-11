import { useSyncExternalStore, useCallback } from 'react'

type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'studio-theme-mode'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyMode(mode: ThemeMode) {
  const root = document.documentElement
  if (mode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// ── Shared singleton store ──────────────────────────────────
let currentMode: ThemeMode = getInitialMode()
const listeners = new Set<() => void>()

function getSnapshot(): ThemeMode {
  return currentMode
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function setMode(next: ThemeMode) {
  if (next === currentMode) return
  currentMode = next
  applyMode(next)
  localStorage.setItem(STORAGE_KEY, next)
  listeners.forEach((cb) => cb())
}

// Apply on module load so the class is set before first paint
applyMode(currentMode)

// ── Hook ────────────────────────────────────────────────────
export function useThemeMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot)

  const toggle = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }, [mode])

  return { mode, toggle, setMode }
}
