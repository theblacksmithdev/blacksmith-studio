import type { ReactNode } from 'react'
import {
  Field as ChakraField,
  Input,
  Textarea,
  Switch,
  Badge as ChakraBadge,
  Box,
  HStack,
  Button,
  IconButton,
  Code,
} from '@chakra-ui/react'
import { Trash2, Plus } from 'lucide-react'

/* ── Field ── */

const fieldCss = {
  '& label': {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--studio-text-secondary)',
  },
}

const inputCss = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid var(--studio-border)',
  background: 'var(--studio-bg-inset)',
  color: 'var(--studio-text-primary)',
  fontSize: '13px',
  '&:focus': {
    borderColor: 'var(--studio-border-hover)',
    boxShadow: 'none',
  },
  '&::placeholder': {
    color: 'var(--studio-text-muted)',
  },
  '&:disabled': {
    opacity: 0.5,
  },
}

interface FormFieldProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
  /** Fill remaining height of parent flex container */
  fill?: boolean
  children: ReactNode
}

export function FormField({ label, hint, error, required, fill, children }: FormFieldProps) {
  return (
    <ChakraField.Root required={required} invalid={!!error} css={{ ...fieldCss, ...(fill ? { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } : {}) }}>
      <ChakraField.Label>{label}</ChakraField.Label>
      {children}
      {hint && !error && (
        <ChakraField.HelperText css={{ fontSize: '11px', color: 'var(--studio-text-muted)' }}>
          {hint}
        </ChakraField.HelperText>
      )}
      {error && (
        <ChakraField.ErrorText css={{ fontSize: '11px', color: 'var(--studio-error)' }}>
          {error}
        </ChakraField.ErrorText>
      )}
    </ChakraField.Root>
  )
}

/* ── Input ── */

interface FormInputProps {
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'number'
  disabled?: boolean
}

export function FormInput({ value, onChange, placeholder, type = 'text', disabled }: FormInputProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      css={inputCss}
    />
  )
}

/* ── Textarea ── */

interface FormTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export function FormTextarea({ value, onChange, placeholder, rows = 4 }: FormTextareaProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      css={{
        ...inputCss,
        resize: 'vertical',
        minHeight: '80px',
      }}
    />
  )
}

/* ── Toggle ── */

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={(e) => onChange(e.checked)}
      css={{
        '& [data-part="control"]': {
          width: '36px',
          height: '20px',
          borderRadius: '10px',
          background: checked ? 'var(--studio-accent)' : 'var(--studio-bg-hover)',
          transition: 'background 0.2s ease',
        },
        '& [data-part="thumb"]': {
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: checked ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)',
          transition: 'transform 0.2s ease',
        },
      }}
    >
      <Switch.HiddenInput />
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      {label && (
        <Switch.Label css={{ fontSize: '13px', color: 'var(--studio-text-primary)' }}>
          {label}
        </Switch.Label>
      )}
    </Switch.Root>
  )
}

/* ── Segmented Control ── */

interface SegmentedControlProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <HStack
      gap={0}
      css={{
        borderRadius: '8px',
        border: '1px solid var(--studio-border)',
        overflow: 'hidden',
      }}
    >
      {options.map((opt) => (
        <Button
          key={opt.value}
          size="sm"
          onClick={() => onChange(opt.value)}
          css={{
            flex: 1,
            padding: '7px 14px',
            borderRadius: 0,
            border: 'none',
            background: value === opt.value ? 'var(--studio-accent)' : 'var(--studio-bg-surface)',
            color: value === opt.value ? 'var(--studio-accent-fg)' : 'var(--studio-text-secondary)',
            fontSize: '12px',
            fontWeight: 500,
            transition: 'all 0.1s ease',
          }}
        >
          {opt.label}
        </Button>
      ))}
    </HStack>
  )
}

/* ── Key-Value Pair Editor ── */

interface KvPair {
  key: string
  value: string
}

interface KvEditorProps {
  pairs: KvPair[]
  onChange: (pairs: KvPair[]) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
  addLabel?: string
}

export function KvEditor({ pairs, onChange, keyPlaceholder = 'KEY', valuePlaceholder = 'Value', addLabel = 'Add' }: KvEditorProps) {
  const update = (index: number, field: 'key' | 'value', val: string) => {
    const next = [...pairs]
    next[index] = { ...next[index], [field]: val }
    onChange(next)
  }

  const remove = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index))
  }

  const add = () => {
    onChange([...pairs, { key: '', value: '' }])
  }

  return (
    <Box css={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {pairs.map((pair, i) => (
        <HStack key={i} gap={2}>
          <Input
            size="sm"
            value={pair.key}
            onChange={(e) => update(i, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            css={{ ...inputCss, flex: 1, padding: '6px 10px', fontSize: '12px' }}
          />
          <Input
            size="sm"
            value={pair.value}
            onChange={(e) => update(i, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            css={{ ...inputCss, flex: 1, padding: '6px 10px', fontSize: '12px' }}
          />
          <IconButton
            aria-label="Remove"
            size="xs"
            variant="ghost"
            onClick={() => remove(i)}
            css={{
              color: 'var(--studio-text-muted)',
              borderRadius: '4px',
              '&:hover': { color: 'var(--studio-error)', background: 'var(--studio-error-subtle)' },
            }}
          >
            <Trash2 size={12} />
          </IconButton>
        </HStack>
      ))}
      <Button
        variant="ghost"
        size="xs"
        onClick={add}
        css={{
          alignSelf: 'flex-start',
          color: 'var(--studio-text-muted)',
          fontSize: '12px',
          padding: '4px 0',
          '&:hover': { color: 'var(--studio-text-primary)' },
        }}
      >
        <Plus size={12} />
        {addLabel}
      </Button>
    </Box>
  )
}

/* ── Code Block ── */

export function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <Code
      display="block"
      css={{
        padding: '10px 14px',
        borderRadius: '8px',
        background: 'var(--studio-bg-surface)',
        border: '1px solid var(--studio-border)',
        fontSize: '12px',
        color: 'var(--studio-text-primary)',
        userSelect: 'all',
        whiteSpace: 'pre-wrap',
      }}
    >
      {children}
    </Code>
  )
}

/* ── Badge ── */

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'error' | 'warning'
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const colors = {
    default: { bg: 'var(--studio-bg-surface)', color: 'var(--studio-text-muted)', border: 'var(--studio-border)' },
    error: { bg: 'var(--studio-error-subtle)', color: 'var(--studio-error)', border: 'var(--studio-error-subtle)' },
    warning: { bg: 'rgba(245,158,11,0.08)', color: 'var(--studio-warning)', border: 'rgba(245,158,11,0.12)' },
  }
  const c = colors[variant]

  return (
    <ChakraBadge
      css={{
        fontSize: '10px',
        fontWeight: 500,
        padding: '1px 6px',
        borderRadius: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
      }}
    >
      {children}
    </ChakraBadge>
  )
}
