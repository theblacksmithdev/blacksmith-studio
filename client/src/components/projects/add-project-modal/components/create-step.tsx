import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { api } from '@/api'
import { FormField, inputCss, selectCss } from '@/components/forms/form-field'
import { FolderPicker } from '@/pages/projects/add/folder-picker'
import { isElectron, selectFolderNative } from '@/lib/electron'
import { projectHome } from '@/router/paths'
import { Text, Button, Badge, VStack, HStack, spacing } from '@/components/shared/ui'
import { FolderButton } from './folder-button'
import { TerminalView } from './terminal-view'

const THEMES = ['default', 'blue', 'green', 'violet', 'red', 'neutral'] as const

const createSchema = z.object({
  name: z.string().min(1, 'Project name is required').regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, hyphens, and underscores'),
  parentPath: z.string().min(1, 'Select a location'),
  backendPort: z.coerce.number().int().min(1024).max(65535),
  frontendPort: z.coerce.number().int().min(1024).max(65535),
  theme: z.enum(THEMES),
})

type CreateState = 'idle' | 'creating' | 'success' | 'error'

export function CreateStep({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [state, setState] = useState<CreateState>('idle')
  const [serverError, setServerError] = useState('')
  const [outputLines, setOutputLines] = useState<string[]>([])

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', parentPath: '', backendPort: 8000, frontendPort: 5173, theme: 'default' },
  })

  const parentPath = watch('parentPath')
  const name = watch('name')

  useEffect(() => {
    if (state !== 'creating') return
    const unsubs = [
      api.projects.onCreateOutput((data) => setOutputLines((prev) => [...prev, data.line])),
      api.projects.onCreateDone((data) => { setState('success'); setTimeout(() => { onClose(); navigate(projectHome(data.project.id)) }, 1000) }),
      api.projects.onCreateError((data) => { setState('error'); setServerError(data.error) }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [state, onClose, navigate])

  const onSubmit = async (data: z.infer<typeof createSchema>) => {
    setState('creating'); setServerError(''); setOutputLines([])
    try { await api.projects.create({ ...data, ai: true }) }
    catch (err: any) { setState('error'); setServerError(err.message || 'Failed to start') }
  }

  if (state === 'creating' || state === 'success') {
    return <TerminalView lines={outputLines} status={state === 'success' ? 'success' : 'running'} label={state === 'success' ? 'Project created successfully' : `Creating ${name}...`} />
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap="lg">
        <FormField label="Project name" error={errors.name?.message}>
          <input {...register('name')} placeholder="my-project" style={inputCss} />
        </FormField>

        <FormField label="Location" error={errors.parentPath?.message}>
          <FolderButton path={parentPath} label="Select a folder..." onPick={async () => {
            if (isElectron()) { const p = await selectFolderNative(); if (p) setValue('parentPath', p, { shouldValidate: true }) }
            else setPickerOpen(true)
          }} />
          {parentPath && name && (
            <Text variant="code" css={{ marginTop: spacing.xs, display: 'block', fontSize: '11px' }}>{parentPath}/{name}</Text>
          )}
        </FormField>

        <HStack gap="md">
          <FormField label="Backend port" error={errors.backendPort?.message}>
            <input type="number" {...register('backendPort')} style={inputCss} />
          </FormField>
          <FormField label="Frontend port" error={errors.frontendPort?.message}>
            <input type="number" {...register('frontendPort')} style={inputCss} />
          </FormField>
        </HStack>

        <FormField label="Theme" error={errors.theme?.message}>
          <select {...register('theme')} style={selectCss}>
            {THEMES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </FormField>

        {state === 'error' && (
          <Badge variant="error" size="md" css={{ padding: `${spacing.sm} ${spacing.md}`, width: '100%' }}>
            <AlertCircle size={13} /> {serverError}
          </Badge>
        )}

        <Button variant="primary" size="lg" css={{ width: '100%' }} onClick={handleSubmit(onSubmit)}>Create Project</Button>
      </VStack>

      <FolderPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(p) => setValue('parentPath', p, { shouldValidate: true })} />
    </form>
  )
}
