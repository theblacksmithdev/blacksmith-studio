import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GitBranch, AlertCircle } from 'lucide-react'
import { api } from '@/api'
import { FormField, inputCss } from '@/components/forms/form-field'
import { FolderPicker } from '@/pages/projects/add/folder-picker'
import { isElectron, selectFolderNative } from '@/lib/electron'
import { projectHome } from '@/router/paths'
import { Text, Button, Badge, VStack, HStack, spacing, radii } from '@/components/shared/ui'
import { FolderButton } from './folder-button'
import { TerminalView } from './terminal-view'

const cloneSchema = z.object({
  gitUrl: z.string().min(1, 'Repository URL is required'),
  parentPath: z.string().min(1, 'Select a destination folder'),
  name: z.string().optional(),
})

type CloneState = 'idle' | 'cloning' | 'success' | 'error'

export function CloneStep({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [state, setState] = useState<CloneState>('idle')
  const [serverError, setServerError] = useState('')
  const [outputLines, setOutputLines] = useState<string[]>([])

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<z.infer<typeof cloneSchema>>({
    resolver: zodResolver(cloneSchema),
    defaultValues: { gitUrl: '', parentPath: '', name: '' },
  })

  const gitUrl = watch('gitUrl')
  const parentPath = watch('parentPath')
  const name = watch('name')
  const derivedName = name || gitUrl.replace(/\.git$/, '').split('/').pop()?.replace(/[^a-zA-Z0-9_-]/g, '') || ''

  useEffect(() => {
    if (state !== 'cloning') return
    const unsubs = [
      api.projects.onCreateOutput((data) => setOutputLines((prev) => [...prev, data.line])),
      api.projects.onCreateDone((data) => { setState('success'); setTimeout(() => { onClose(); navigate(projectHome(data.project.id)) }, 1000) }),
      api.projects.onCreateError((data) => { setState('error'); setServerError(data.error) }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [state, onClose, navigate])

  const onSubmit = async (data: z.infer<typeof cloneSchema>) => {
    setState('cloning'); setServerError(''); setOutputLines([])
    try { await api.projects.clone({ gitUrl: data.gitUrl.trim(), parentPath: data.parentPath, name: data.name?.trim() || undefined }) }
    catch (err: any) { setState('error'); setServerError(err.message || 'Failed to start clone') }
  }

  if (state === 'cloning' || state === 'success') {
    return <TerminalView lines={outputLines} status={state === 'success' ? 'success' : 'running'} label={state === 'success' ? 'Repository cloned successfully' : `Cloning ${derivedName}...`} />
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap="lg">
        <FormField label="Repository URL" error={errors.gitUrl?.message}>
          <input {...register('gitUrl')} placeholder="https://github.com/user/repo.git" style={inputCss} />
        </FormField>

        <FormField label="Clone to" error={errors.parentPath?.message}>
          <FolderButton path={parentPath} label="Select a folder..." onPick={async () => {
            if (isElectron()) { const p = await selectFolderNative(); if (p) setValue('parentPath', p, { shouldValidate: true }) }
            else setPickerOpen(true)
          }} />
        </FormField>

        <FormField label="Project name (optional)" error={errors.name?.message}>
          <input {...register('name')} placeholder={derivedName || 'Auto-detected from URL'} style={inputCss} />
        </FormField>

        {parentPath && derivedName && (
          <HStack gap="sm" css={{ padding: `${spacing.sm} ${spacing.md}`, borderRadius: radii.md, background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)' }}>
            <GitBranch size={13} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
            <Text variant="code" truncate css={{ fontSize: '12px' }}>{parentPath}/{derivedName}</Text>
          </HStack>
        )}

        {state === 'error' && (
          <Badge variant="error" size="md" css={{ padding: `${spacing.sm} ${spacing.md}`, width: '100%' }}>
            <AlertCircle size={13} /> {serverError}
          </Badge>
        )}

        <Button variant="primary" size="lg" css={{ width: '100%' }} disabled={!gitUrl || !parentPath} onClick={handleSubmit(onSubmit)}>
          Clone & Add to Studio
        </Button>
      </VStack>

      <FolderPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(p) => setValue('parentPath', p, { shouldValidate: true })} />
    </form>
  )
}
