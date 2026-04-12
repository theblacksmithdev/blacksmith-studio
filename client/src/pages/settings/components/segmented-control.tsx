import { type ReactNode } from 'react'
import styled from '@emotion/styled'

const Track = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: 8px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
`

const Segment = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 6px;
  border: none;
  background: ${(p) => (p.active ? 'var(--studio-bg-main)' : 'transparent')};
  color: ${(p) => (p.active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  font-size: 13px;
  font-weight: ${(p) => (p.active ? 500 : 400)};
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;
  box-shadow: ${(p) => (p.active ? 'var(--studio-shadow)' : 'none')};

  &:hover {
    color: ${(p) => (p.active ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)')};
  }

  & svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`

export interface SegmentOption<T extends string = string> {
  value: T
  label: string
  icon?: ReactNode
}

interface SegmentedControlProps<T extends string = string> {
  value: T
  options: SegmentOption<T>[]
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string = string>({ value, options, onChange }: SegmentedControlProps<T>) {
  return (
    <Track>
      {options.map((opt) => (
        <Segment
          key={opt.value}
          active={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon}
          {opt.label}
        </Segment>
      ))}
    </Track>
  )
}
