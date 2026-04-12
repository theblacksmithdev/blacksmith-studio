import styled from '@emotion/styled'

const Track = styled.button<{ on: boolean }>`
  width: 40px;
  height: 22px;
  border-radius: 11px;
  border: none;
  background: ${(p) => (p.on ? 'var(--studio-accent)' : 'var(--studio-bg-hover-strong)')};
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
  padding: 0;
`

const Thumb = styled.span<{ on: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${(p) => (p.on ? 'var(--studio-accent-fg)' : '#fff')};
  position: absolute;
  top: 3px;
  left: ${(p) => (p.on ? '21px' : '3px')};
  transition: left 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`

interface SettingToggleProps {
  value: boolean
  disabled?: boolean
  onChange: (value: boolean) => void
}

export function SettingToggle({ value, disabled, onChange }: SettingToggleProps) {
  return (
    <Track
      on={value}
      disabled={disabled}
      onClick={() => !disabled && onChange(!value)}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Thumb on={value} />
    </Track>
  )
}
