import { useCallback } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { Monitor, Sun, Moon, Minus, Plus, Type, PanelLeft } from 'lucide-react'
import { SettingsSection } from '@/pages/settings/components/settings-section'
import { SettingRow } from '@/pages/settings/components/setting-row'
import { SettingToggle } from '@/pages/settings/components/setting-toggle'
import { useSettings } from '@/hooks/use-settings'
import { useThemeMode } from '@/hooks/use-theme-mode'
import { useUiStore } from '@/stores/ui-store'

/* ── Theme Cards ── */

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
`

const ThemeCard = styled.button<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 10px;
  border-radius: 10px;
  border: 1.5px solid ${(p) => (p.active ? 'var(--studio-accent)' : 'var(--studio-border)')};
  background: ${(p) => (p.active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)')};
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;

  &:hover {
    border-color: var(--studio-border-hover);
  }
`

const ThemeIcon = styled.div<{ active: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => (p.active ? 'var(--studio-accent)' : 'var(--studio-bg-main)')};
  color: ${(p) => (p.active ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)')};
  border: 1px solid ${(p) => (p.active ? 'var(--studio-accent)' : 'var(--studio-border)')};
  transition: all 0.15s ease;
`

const ThemeLabel = styled.span<{ active: boolean }>`
  font-size: 13px;
  font-weight: ${(p) => (p.active ? 600 : 400)};
  color: ${(p) => (p.active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
`

/* ── Font Size Stepper ── */

const Stepper = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  overflow: hidden;
`

const StepperBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--studio-bg-surface);
  color: var(--studio-text-muted);
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`

const StepperValue = styled.span`
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-primary);
  background: var(--studio-bg-main);
  border-left: 1px solid var(--studio-border);
  border-right: 1px solid var(--studio-border);
  height: 32px;
`

/* ── Theme options ── */

const THEMES = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const

const MIN_FONT = 12
const MAX_FONT = 20

/* ── Component ── */

export function AppearanceSettings() {
  const s = useSettings()
  const { setMode } = useThemeMode()

  const handleThemeChange = useCallback((value: string) => {
    s.set('appearance.theme', value)
    // Apply immediately
    if (value === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setMode(prefersDark ? 'dark' : 'light')
    } else {
      setMode(value as 'light' | 'dark')
    }
  }, [s, setMode])

  const handleFontSizeChange = useCallback((delta: number) => {
    const next = Math.max(MIN_FONT, Math.min(MAX_FONT, (s.fontSize as number) + delta))
    s.set('appearance.fontSize', next)
    // Apply immediately via Electron zoom — 14px is the base (zoom 0)
    const zoomLevel = (next - 14) * 0.5
    window.electronAPI?.setZoomLevel(zoomLevel)
    localStorage.setItem('studio-zoom-level', String(zoomLevel))
  }, [s])

  const handleSidebarChange = useCallback((value: boolean) => {
    s.set('appearance.sidebarCollapsed', value)
    // Apply immediately
    useUiStore.getState().setSidebarExpanded(!value)
  }, [s])

  return (
    <Flex direction="column" gap="28px">
      {/* Theme */}
      <SettingsSection
        title="Theme"
        description="Choose how Blacksmith Studio looks."
      >
        <Box css={{ padding: '14px 16px' }}>
          <ThemeGrid>
            {THEMES.map((t) => {
              const Icon = t.icon
              const active = s.theme === t.value
              return (
                <ThemeCard key={t.value} active={active} onClick={() => handleThemeChange(t.value)}>
                  <ThemeIcon active={active}>
                    <Icon size={18} />
                  </ThemeIcon>
                  <ThemeLabel active={active}>{t.label}</ThemeLabel>
                </ThemeCard>
              )
            })}
          </ThemeGrid>
        </Box>
      </SettingsSection>

      {/* Typography & Layout */}
      <SettingsSection
        title="Interface"
        description="Font size and layout preferences."
      >
        <SettingRow
          label="Font size"
          description={<Flex align="center" gap="4px"><Type size={11} /> Base UI font size ({MIN_FONT}–{MAX_FONT}px).</Flex>}
        >
          <Stepper>
            <StepperBtn onClick={() => handleFontSizeChange(-1)} disabled={s.fontSize <= MIN_FONT}>
              <Minus size={14} />
            </StepperBtn>
            <StepperValue>{s.fontSize}px</StepperValue>
            <StepperBtn onClick={() => handleFontSizeChange(1)} disabled={s.fontSize >= MAX_FONT}>
              <Plus size={14} />
            </StepperBtn>
          </Stepper>
        </SettingRow>
        <SettingRow
          label="Collapse sidebar on launch"
          description={<Flex align="center" gap="4px"><PanelLeft size={11} /> Start with the sidebar minimized.</Flex>}
        >
          <SettingToggle
            value={s.sidebarCollapsed}
            onChange={handleSidebarChange}
          />
        </SettingRow>
      </SettingsSection>
    </Flex>
  )
}
