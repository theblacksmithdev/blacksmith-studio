import { Flex } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { Type, PanelLeft, Minus, Plus } from 'lucide-react'
import { SettingsSection } from '@/pages/settings/components/settings-section'
import { SettingRow } from '@/pages/settings/components/setting-row'
import { SettingToggle } from '@/pages/settings/components/setting-toggle'
import { MIN_FONT, MAX_FONT } from '../hooks/use-appearance-settings'

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
  &:hover { background: var(--studio-bg-hover); color: var(--studio-text-primary); }
  &:disabled { opacity: 0.3; cursor: default; }
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

interface InterfaceSectionProps {
  fontSize: number
  sidebarCollapsed: boolean
  onFontSizeChange: (delta: number) => void
  onSidebarChange: (collapsed: boolean) => void
}

export function InterfaceSection({
  fontSize,
  sidebarCollapsed,
  onFontSizeChange,
  onSidebarChange,
}: InterfaceSectionProps) {
  return (
    <SettingsSection title="Interface" description="Font size and layout preferences.">
      <SettingRow
        label="Font size"
        description={<Flex align="center" gap="4px"><Type size={11} /> Base UI font size ({MIN_FONT}–{MAX_FONT}px).</Flex>}
      >
        <Stepper>
          <StepperBtn onClick={() => onFontSizeChange(-1)} disabled={fontSize <= MIN_FONT}>
            <Minus size={14} />
          </StepperBtn>
          <StepperValue>{fontSize}px</StepperValue>
          <StepperBtn onClick={() => onFontSizeChange(1)} disabled={fontSize >= MAX_FONT}>
            <Plus size={14} />
          </StepperBtn>
        </Stepper>
      </SettingRow>
      <SettingRow
        label="Collapse sidebar on launch"
        description={<Flex align="center" gap="4px"><PanelLeft size={11} /> Start with the sidebar minimized.</Flex>}
      >
        <SettingToggle value={sidebarCollapsed} onChange={onSidebarChange} />
      </SettingRow>
    </SettingsSection>
  )
}
