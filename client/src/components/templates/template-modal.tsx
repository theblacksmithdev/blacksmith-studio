import { useState } from 'react'
import { VStack, Input, Textarea, NativeSelect, Field } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import type { PromptTemplate } from '@/types'
import { Modal, PrimaryButton, GhostButton, FooterSpacer } from '@/components/shared/modal'

const inputCss = {
  background: 'var(--studio-bg-inset)',
  border: '1px solid var(--studio-border)',
  borderRadius: '8px',
  color: 'var(--studio-text-primary)',
  fontSize: '15px',
  '&:focus': { borderColor: 'var(--studio-border-hover)', boxShadow: 'none', outline: 'none' },
  '&::placeholder': { color: 'var(--studio-text-tertiary)' },
}

interface TemplateModalProps {
  template: PromptTemplate
  isOpen: boolean
  onClose: () => void
  onSubmit: (prompt: string) => void
}

export function TemplateModal({ template, isOpen, onClose, onSubmit }: TemplateModalProps) {
  const [values, setValues] = useState<Record<string, string>>({})

  const interpolateMutation = useMutation({
    mutationFn: (vals: Record<string, string>) =>
      api.templates.interpolate({ templateId: template.id, values: vals }),
    onSuccess: (data) => {
      onSubmit(data.prompt)
      onClose()
      setValues({})
    },
  })

  const handleSubmit = () => interpolateMutation.mutate(values)

  const allRequiredFilled = template.fields
    .filter((f) => f.required)
    .every((f) => values[f.name]?.trim())

  if (!isOpen) return null

  return (
    <Modal
      title={template.name}
      onClose={onClose}
      width="520px"
      footer={
        <>
          <FooterSpacer />
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton disabled={!allRequiredFilled} onClick={handleSubmit}>
            Send to Claude
          </PrimaryButton>
        </>
      }
    >
      <VStack gap={4} align="stretch">
        {template.fields.map((field) => (
          <Field.Root key={field.name} required={field.required}>
            <Field.Label
              css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-secondary)', marginBottom: '4px' }}
            >
              {field.label}
            </Field.Label>
            {field.type === 'textarea' ? (
              <Textarea
                value={values[field.name] || ''}
                onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                placeholder={field.placeholder}
                size="sm"
                css={inputCss}
              />
            ) : field.type === 'select' ? (
              <NativeSelect.Root size="sm">
                <NativeSelect.Field
                  value={values[field.name] || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setValues({ ...values, [field.name]: e.target.value })}
                  css={inputCss}
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            ) : (
              <Input
                value={values[field.name] || ''}
                onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                placeholder={field.placeholder}
                size="sm"
                css={inputCss}
              />
            )}
          </Field.Root>
        ))}
      </VStack>
    </Modal>
  )
}
