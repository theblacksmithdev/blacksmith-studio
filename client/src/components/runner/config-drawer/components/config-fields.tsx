import { Box, Flex } from '@chakra-ui/react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Text, Input, spacing } from '@/components/shared/ui'
import type { RunnerConfigFormData } from '../schema'

interface FieldDef {
  name: keyof RunnerConfigFormData
  label: string
  placeholder: string
  hint?: string
  mono?: boolean
}

const FIELDS: FieldDef[] = [
  { name: 'name', label: 'Name', placeholder: 'Frontend' },
  { name: 'command', label: 'Command', placeholder: 'npm run dev -- --port {port}', hint: 'Use {port} as a placeholder for the resolved port', mono: true },
  { name: 'cwd', label: 'Working directory', placeholder: '.', hint: 'Relative to project root' },
  { name: 'port', label: 'Default port', placeholder: '3000' },
  { name: 'readyPattern', label: 'Ready pattern', placeholder: 'Local:|ready|listening', hint: 'Regex matched against stdout to detect running state', mono: true },
  { name: 'previewUrl', label: 'Preview URL', placeholder: 'http://localhost:{port}/', hint: '{port} is replaced at runtime', mono: true },
]

interface ConfigFieldsProps {
  register: UseFormRegister<RunnerConfigFormData>
  errors: FieldErrors<RunnerConfigFormData>
}

export function ConfigFields({ register, errors }: ConfigFieldsProps) {
  return (
    <Flex direction="column" gap={spacing.lg}>
      {FIELDS.map((field) => (
        <Box key={field.name}>
          <Text variant="bodySmall" css={{ fontWeight: 500, marginBottom: spacing.xs, color: 'var(--studio-text-secondary)' }}>
            {field.label}
          </Text>
          <Input
            size="sm"
            placeholder={field.placeholder}
            autoFocus={field.name === 'name'}
            css={field.mono ? { fontFamily: "'SF Mono', monospace" } : {}}
            {...register(field.name as any)}
          />
          {errors[field.name as keyof typeof errors] && (
            <Text variant="tiny" css={{ color: 'var(--studio-error)', marginTop: spacing.xs }}>
              {(errors[field.name as keyof typeof errors] as any)?.message}
            </Text>
          )}
          {field.hint && !errors[field.name as keyof typeof errors] && (
            <Text variant="tiny" color="muted" css={{ marginTop: spacing.xs }}>{field.hint}</Text>
          )}
        </Box>
      ))}
    </Flex>
  )
}
