import styled from '@emotion/styled'

type InputSize = 'sm' | 'md' | 'lg'

const sizeMap: Record<InputSize, string> = {
  sm: '80px',
  md: '160px',
  lg: '100%',
}

const StyledInput = styled.input<{ inputSize: InputSize; disabled?: boolean }>`
  padding: 7px 10px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-primary);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  width: ${(p) => sizeMap[p.inputSize]};
  transition: border-color 0.12s ease;
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};

  &::placeholder {
    color: var(--studio-text-muted);
  }

  &:hover:not(:disabled) {
    border-color: var(--studio-border-hover);
  }

  &:focus {
    border-color: var(--studio-border-hover);
    box-shadow: var(--studio-ring-focus);
  }
`

interface SettingInputProps {
  value: string | number
  type?: 'text' | 'number'
  placeholder?: string
  size?: InputSize
  disabled?: boolean
  prefix?: string
  suffix?: string
  onChange: (value: string | number) => void
}

export function SettingInput({ value, type = 'text', placeholder, size, disabled, prefix, suffix, onChange }: SettingInputProps) {
  const inputSize = size ?? (type === 'number' ? 'sm' : 'md')

  const input = (
    <StyledInput
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      inputSize={inputSize}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
    />
  )

  if (!prefix && !suffix) return input

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {prefix && <span style={{ fontSize: '13px', color: 'var(--studio-text-muted)' }}>{prefix}</span>}
      {input}
      {suffix && <span style={{ fontSize: '13px', color: 'var(--studio-text-muted)' }}>{suffix}</span>}
    </span>
  )
}
