import styled from '@emotion/styled'

const StyledTextarea = styled.textarea<{ mono?: boolean }>`
  width: 100%;
  padding: 10px 12px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-primary);
  font-size: 13px;
  font-family: ${(p) => (p.mono ? "'SF Mono', 'Fira Code', monospace" : 'inherit')};
  line-height: 1.5;
  outline: none;
  resize: vertical;
  transition: border-color 0.12s ease;

  &::placeholder {
    color: var(--studio-text-muted);
  }

  &:hover {
    border-color: var(--studio-border-hover);
  }

  &:focus {
    border-color: var(--studio-border-hover);
    box-shadow: var(--studio-ring-focus);
  }
`

interface SettingTextareaProps {
  value: string
  placeholder?: string
  rows?: number
  mono?: boolean
  onChange: (value: string) => void
}

export function SettingTextarea({ value, placeholder, rows = 4, mono, onChange }: SettingTextareaProps) {
  return (
    <StyledTextarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      mono={mono}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onChange(e.target.value)}
    />
  )
}
