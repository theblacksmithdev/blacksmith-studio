import { useState, useEffect, useRef } from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  X, FolderOpen, Plus, ArrowLeft, Anvil, Loader2, Check,
  AlertCircle, Package, GitBranch, Folder, HardDrive, Globe,
} from 'lucide-react'
import { api } from '@/api'
import { useProjects } from '@/hooks/use-projects'
import { FormField, inputCss, selectCss } from '@/components/forms/form-field'
import { FolderPicker } from '@/pages/projects/add/folder-picker'
import { isElectron, selectFolderNative } from '@/lib/electron'
import { projectHome } from '@/router/paths'

interface AddProjectModalProps {
  open: boolean
  onClose: () => void
}

type Step = 'choose' | 'import' | 'create' | 'clone'

export function AddProjectModal({ open, onClose }: AddProjectModalProps) {
  const [step, setStep] = useState<Step>('choose')

  useEffect(() => {
    if (open) setStep('choose')
  }, [open])

  // Close on escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const title = step === 'choose' ? 'Add Project' : step === 'import' ? 'Import Existing' : step === 'clone' ? 'Clone from Git' : 'Create New'

  return (
    <>
      {/* Backdrop */}
      <Box
        css={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 400,
          animation: 'modalFadeIn 0.15s ease',
        }}
      />

      {/* Modal */}
      <Box
        css={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: step === 'choose' ? '480px' : step === 'clone' ? '500px' : '520px',
          maxHeight: '85vh',
          borderRadius: '16px',
          border: '1px solid var(--studio-border-hover)',
          background: 'var(--studio-bg-main)',
          boxShadow: '0 32px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
          zIndex: 401,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <HStack
          gap={3}
          css={{
            padding: '18px 20px 16px',
            borderBottom: '1px solid var(--studio-border)',
            flexShrink: 0,
          }}
        >
          {step !== 'choose' && (
            <Box
              as="button"
              onClick={() => setStep('choose')}
              css={{
                width: '30px', height: '30px', borderRadius: '8px',
                border: 'none', background: 'transparent',
                color: 'var(--studio-text-muted)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.1s ease', flexShrink: 0,
                '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-primary)' },
              }}
            >
              <ArrowLeft size={16} />
            </Box>
          )}
          <Box css={{ flex: 1 }}>
            <Text css={{ fontSize: '16px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
              {title}
            </Text>
            <Text css={{ fontSize: '13px', color: 'var(--studio-text-muted)', marginTop: '1px' }}>
              {step === 'choose' && 'Import, clone, or create a new project'}
              {step === 'import' && 'Select your project folder'}
              {step === 'clone' && 'Clone a repository from a Git URL'}
              {step === 'create' && 'Scaffold a fullstack Django + React project'}
            </Text>
          </Box>
          <Box
            as="button"
            onClick={onClose}
            css={{
              width: '30px', height: '30px', borderRadius: '8px',
              border: 'none', background: 'transparent',
              color: 'var(--studio-text-muted)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.1s ease', flexShrink: 0,
              '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-primary)' },
            }}
          >
            <X size={16} />
          </Box>
        </HStack>

        {/* Content */}
        <Box css={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {step === 'choose' && (
            <ChooseStep
              onImport={() => setStep('import')}
              onCreate={() => setStep('create')}
              onClone={() => setStep('clone')}
            />
          )}
          {step === 'import' && (
            <ImportStep onClose={onClose} />
          )}
          {step === 'create' && (
            <CreateStep onClose={onClose} />
          )}
          {step === 'clone' && (
            <CloneStep onClose={onClose} />
          )}
        </Box>
      </Box>

      {/* Keyframe animations */}
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translate(-50%, -48%) scale(0.97) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } }
      `}</style>
    </>
  )
}

// ─── Choose Step ───

function ChooseStep({ onImport, onCreate, onClone }: { onImport: () => void; onCreate: () => void; onClone: () => void }) {
  return (
    <VStack gap={5} align="stretch">
      {/* Local */}
      <Box>
        <HStack gap={2} css={{ paddingLeft: '4px', marginBottom: '8px' }}>
          <Box css={{ color: 'var(--studio-text-muted)', display: 'flex' }}><HardDrive size={11} /></Box>
          <Text css={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--studio-text-muted)' }}>From your machine</Text>
        </HStack>
        <OptionCard
          icon={<FolderOpen size={20} />}
          title="Open existing project"
          description="Select a project folder on your machine."
          onClick={onImport}
        />
      </Box>

      {/* Remote */}
      <Box>
        <HStack gap={2} css={{ paddingLeft: '4px', marginBottom: '8px' }}>
          <Box css={{ color: 'var(--studio-text-muted)', display: 'flex' }}><Globe size={11} /></Box>
          <Text css={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--studio-text-muted)' }}>From the internet</Text>
        </HStack>
        <OptionCard
          icon={<GitBranch size={20} />}
          title="Clone a Git repository"
          description="Clone from GitHub, GitLab, or any Git URL."
          onClick={onClone}
        />
      </Box>

      {/* Separator */}
      <HStack gap={3} css={{ padding: '0 4px' }}>
        <Box css={{ flex: 1, height: '1px', background: 'var(--studio-border)' }} />
        <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)', flexShrink: 0 }}>or</Text>
        <Box css={{ flex: 1, height: '1px', background: 'var(--studio-border)' }} />
      </HStack>

      {/* New */}
      <OptionCard
        icon={<Plus size={20} />}
        title="Create new project"
        description="Scaffold a new Django + React project."
        onClick={onCreate}
      />
    </VStack>
  )
}

function OptionCard({ icon, title, description, onClick }: {
  icon: React.ReactNode; title: string; description: string; onClick: () => void
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      css={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '16px', borderRadius: '12px',
        border: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-sidebar)',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: 'var(--studio-border-hover)',
          background: 'var(--studio-bg-hover)',
        },
      }}
    >
      <Box
        css={{
          width: '42px', height: '42px', borderRadius: '10px',
          background: 'var(--studio-bg-surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--studio-text-tertiary)', flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box css={{ flex: 1 }}>
        <Text css={{ fontSize: '15px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '2px' }}>
          {title}
        </Text>
        <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', lineHeight: 1.4 }}>
          {description}
        </Text>
      </Box>
    </Box>
  )
}

// ─── Import Step ───

interface ValidationResult {
  valid: boolean; path: string; name: string
  isBlacksmithProject: boolean; hasPackageJson: boolean; hasGit: boolean
}

const importSchema = z.object({
  projectPath: z.string().min(1, 'Select a project folder'),
  projectName: z.string().min(1, 'Project name is required'),
})

function ImportStep({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const { register: registerProject } = useProjects()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [registering, setRegistering] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<z.infer<typeof importSchema>>({
    resolver: zodResolver(importSchema),
    defaultValues: { projectPath: '', projectName: '' },
  })

  const projectPath = watch('projectPath')

  const handleFolderSelected = async (path: string) => {
    setValue('projectPath', path, { shouldValidate: true })
    try {
      const result = await api.projects.validate({ path })
      setValidation(result)
      if (result.name) setValue('projectName', result.name, { shouldValidate: true })
    } catch {
      setValidation(null)
    }
  }

  const onSubmit = async (data: z.infer<typeof importSchema>) => {
    if (!validation?.valid) return
    setRegistering(true)
    try {
      const project = await registerProject(data.projectPath, data.projectName)
      onClose()
      navigate(projectHome(project.id))
    } catch {
      setRegistering(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap={4} align="stretch">
        <FormField label="Project folder" error={errors.projectPath?.message}>
          <Box
            as="button"
            type="button"
            onClick={async () => {
              if (isElectron()) {
                const p = await selectFolderNative()
                if (p) handleFolderSelected(p)
              } else {
                setPickerOpen(true)
              }
            }}
            css={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '8px',
              border: '1px solid var(--studio-border)',
              background: 'var(--studio-bg-surface)',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.12s ease',
              '&:hover': { borderColor: 'var(--studio-border-hover)' },
            }}
          >
            <FolderOpen size={15} style={{ color: projectPath ? 'var(--studio-green)' : 'var(--studio-text-muted)', flexShrink: 0 }} />
            <Text css={{
              flex: 1, fontSize: '14px',
              color: projectPath ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              fontFamily: projectPath ? "'SF Mono', Menlo, monospace" : 'inherit',
            }}>
              {projectPath || 'Choose a folder...'}
            </Text>
            <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', flexShrink: 0 }}>Browse</Text>
          </Box>
        </FormField>

        {validation?.valid && (
          <Box css={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--studio-border)', background: 'var(--studio-bg-sidebar)' }}>
            <HStack gap={3} css={{ marginBottom: '12px' }}>
              {validation.isBlacksmithProject ? (
                <HStack gap={2} css={{ fontSize: '13px', color: 'var(--studio-green)' }}>
                  <Anvil size={13} /> <Text>Blacksmith project</Text>
                </HStack>
              ) : (
                <HStack gap={2} css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)' }}>
                  <Folder size={13} /> <Text>Project folder</Text>
                </HStack>
              )}
              {validation.hasPackageJson && (
                <HStack gap={1} css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)' }}>
                  <Package size={12} /> <Text>npm</Text>
                </HStack>
              )}
              {validation.hasGit && (
                <HStack gap={1} css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)' }}>
                  <GitBranch size={12} /> <Text>git</Text>
                </HStack>
              )}
            </HStack>

            <FormField label="Project name" error={errors.projectName?.message}>
              <input {...register('projectName')} placeholder={validation.name} style={inputCss} />
            </FormField>
          </Box>
        )}

        <Box
          as="button"
          type="submit"
          disabled={!validation?.valid || registering}
          css={{
            width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
            background: validation?.valid ? 'var(--studio-accent)' : 'var(--studio-bg-surface)',
            color: validation?.valid ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)',
            fontSize: '15px', fontWeight: 500,
            cursor: validation?.valid ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
            '&:hover': validation?.valid ? { opacity: 0.9 } : {},
          }}
        >
          {registering ? 'Adding project...' : 'Add to Studio'}
        </Box>
      </VStack>

      <FolderPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleFolderSelected}
      />
    </form>
  )
}

// ─── Create Step ───

const THEMES = ['default', 'blue', 'green', 'violet', 'red', 'neutral'] as const

const createSchema = z.object({
  name: z.string().min(1, 'Project name is required')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, hyphens, and underscores'),
  parentPath: z.string().min(1, 'Select a location'),
  backendPort: z.coerce.number().int().min(1024).max(65535),
  frontendPort: z.coerce.number().int().min(1024).max(65535),
  theme: z.enum(THEMES),
})

type CreateState = 'idle' | 'creating' | 'success' | 'error'

function CreateStep({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [state, setState] = useState<CreateState>('idle')
  const [serverError, setServerError] = useState('')
  const [outputLines, setOutputLines] = useState<string[]>([])
  const logEndRef = useRef<HTMLDivElement>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', parentPath: '', backendPort: 8000, frontendPort: 5173, theme: 'default' },
  })

  const parentPath = watch('parentPath')
  const name = watch('name')
  const isSubmitting = state === 'creating'

  // Subscribe to streaming events
  useEffect(() => {
    if (state !== 'creating') return

    const unsubs = [
      api.projects.onCreateOutput((data) => {
        setOutputLines((prev) => [...prev, data.line])
      }),
      api.projects.onCreateDone((data) => {
        setState('success')
        setTimeout(() => {
          onClose()
          navigate(projectHome(data.project.id))
        }, 1000)
      }),
      api.projects.onCreateError((data) => {
        setState('error')
        setServerError(data.error)
      }),
    ]

    return () => unsubs.forEach((unsub) => unsub())
  }, [state, onClose, navigate])

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [outputLines])

  const onSubmit = async (data: z.infer<typeof createSchema>) => {
    setState('creating')
    setServerError('')
    setOutputLines([])
    try {
      await api.projects.create({ ...data, ai: true })
    } catch (err: any) {
      setState('error')
      setServerError(err.message || 'Failed to start project creation')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap={4} align="stretch">
        {state === 'creating' || state === 'success' ? (
          <>
            {/* Terminal output view */}
            <Box css={{
              background: 'var(--studio-code-bg)', borderRadius: '10px',
              border: '1px solid var(--studio-border)', overflow: 'hidden',
            }}>
              <HStack gap={2} css={{
                padding: '8px 12px', borderBottom: '1px solid var(--studio-border)',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <Loader2 size={13} style={{
                  color: state === 'success' ? 'var(--studio-green)' : 'var(--studio-text-tertiary)',
                  animation: state === 'creating' ? 'spin 1s linear infinite' : 'none',
                }} />
                <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-secondary)' }}>
                  {state === 'success' ? 'Project created successfully' : `Creating ${name}...`}
                </Text>
              </HStack>
              <Box css={{
                padding: '12px', maxHeight: '240px', overflowY: 'auto',
                fontFamily: "'SF Mono', 'Fira Code', Menlo, monospace", fontSize: '13px',
                lineHeight: '20px', color: 'var(--studio-text-secondary)',
              }}>
                {outputLines.map((line, i) => (
                  <Box key={i} css={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line}</Box>
                ))}
                {state === 'creating' && outputLines.length === 0 && (
                  <Text css={{ color: 'var(--studio-text-muted)', fontStyle: 'italic' }}>Waiting for output...</Text>
                )}
                <div ref={logEndRef} />
              </Box>
            </Box>

            {state === 'success' && (
              <HStack gap={2} css={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--studio-green-subtle)', border: '1px solid var(--studio-green-border)' }}>
                <Check size={14} style={{ color: 'var(--studio-green)', flexShrink: 0 }} />
                <Text css={{ fontSize: '14px', color: 'var(--studio-green)', fontWeight: 500 }}>Project created! Redirecting...</Text>
              </HStack>
            )}
          </>
        ) : (
          <>
            <FormField label="Project name" error={errors.name?.message}>
              <input {...register('name')} placeholder="my-project" style={inputCss} />
            </FormField>

            <FormField label="Location" error={errors.parentPath?.message}>
              <Box
                as="button"
                type="button"
                onClick={async () => {
                  if (isElectron()) {
                    const p = await selectFolderNative()
                    if (p) setValue('parentPath', p, { shouldValidate: true })
                  } else {
                    setPickerOpen(true)
                  }
                }}
                css={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '8px',
                  border: '1px solid var(--studio-border)',
                  background: 'var(--studio-bg-surface)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.12s ease',
                  '&:hover': { borderColor: 'var(--studio-border-hover)' },
                }}
              >
                <FolderOpen size={15} style={{ color: parentPath ? 'var(--studio-green)' : 'var(--studio-text-muted)', flexShrink: 0 }} />
                <Text css={{
                  flex: 1, fontSize: '14px',
                  color: parentPath ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontFamily: parentPath ? "'SF Mono', Menlo, monospace" : 'inherit',
                }}>
                  {parentPath || 'Select a folder...'}
                </Text>
                <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', flexShrink: 0 }}>Browse</Text>
              </Box>
              {parentPath && name && (
                <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)', marginTop: '4px', fontFamily: "'SF Mono', Menlo, monospace" }}>
                  {parentPath}/{name}
                </Text>
              )}
            </FormField>

            <HStack gap={3}>
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

            <HStack gap={3} css={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--studio-border)', background: 'var(--studio-bg-sidebar)' }}>
              <Anvil size={15} style={{ color: 'var(--studio-green)', flexShrink: 0 }} />
              <Box css={{ flex: 1 }}>
                <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>AI coding support</Text>
                <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)' }}>CLAUDE.md generated automatically</Text>
              </Box>
              <Check size={14} style={{ color: 'var(--studio-green)', flexShrink: 0 }} />
            </HStack>

            {state === 'error' && (
              <HStack gap={2} css={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--studio-error-subtle)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle size={14} style={{ color: 'var(--studio-error)', flexShrink: 0 }} />
                <Text css={{ fontSize: '13px', color: 'var(--studio-error)' }}>{serverError}</Text>
              </HStack>
            )}

            <Box
              as="button"
              type="submit"
              css={{
                width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
                background: 'var(--studio-accent)',
                color: 'var(--studio-accent-fg)',
                fontSize: '15px', fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { opacity: 0.9 },
              }}
            >
              Create Project
            </Box>
          </>
        )}
      </VStack>

      <FolderPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(p) => setValue('parentPath', p, { shouldValidate: true })}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </form>
  )
}

// ─── Clone Step ───

const cloneSchema = z.object({
  gitUrl: z.string().min(1, 'Repository URL is required'),
  parentPath: z.string().min(1, 'Select a destination folder'),
  name: z.string().optional(),
})

type CloneState = 'idle' | 'cloning' | 'success' | 'error'

function CloneStep({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [state, setState] = useState<CloneState>('idle')
  const [serverError, setServerError] = useState('')
  const [outputLines, setOutputLines] = useState<string[]>([])
  const logEndRef = useRef<HTMLDivElement>(null)

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
      api.projects.onCreateOutput((data) => {
        setOutputLines((prev) => [...prev, data.line])
      }),
      api.projects.onCreateDone((data) => {
        setState('success')
        setTimeout(() => {
          onClose()
          navigate(projectHome(data.project.id))
        }, 1000)
      }),
      api.projects.onCreateError((data) => {
        setState('error')
        setServerError(data.error)
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [state, onClose, navigate])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [outputLines])

  const onSubmit = async (data: z.infer<typeof cloneSchema>) => {
    setState('cloning')
    setServerError('')
    setOutputLines([])
    try {
      await api.projects.clone({
        gitUrl: data.gitUrl.trim(),
        parentPath: data.parentPath,
        name: data.name?.trim() || undefined,
      })
    } catch (err: any) {
      setState('error')
      setServerError(err.message || 'Failed to start clone')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap={4} align="stretch">
        {state === 'cloning' || state === 'success' ? (
          <>
            <Box css={{
              background: 'var(--studio-code-bg)', borderRadius: '10px',
              border: '1px solid var(--studio-border)', overflow: 'hidden',
            }}>
              <HStack gap={2} css={{
                padding: '8px 12px', borderBottom: '1px solid var(--studio-border)',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <Loader2 size={13} style={{
                  color: state === 'success' ? 'var(--studio-green)' : 'var(--studio-text-tertiary)',
                  animation: state === 'cloning' ? 'spin 1s linear infinite' : 'none',
                }} />
                <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-secondary)' }}>
                  {state === 'success' ? 'Repository cloned successfully' : `Cloning ${derivedName}...`}
                </Text>
              </HStack>
              <Box css={{
                padding: '12px', maxHeight: '240px', overflowY: 'auto',
                fontFamily: "'SF Mono', 'Fira Code', Menlo, monospace", fontSize: '13px',
                lineHeight: '20px', color: 'var(--studio-text-secondary)',
              }}>
                {outputLines.map((line, i) => (
                  <Box key={i} css={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line}</Box>
                ))}
                {state === 'cloning' && outputLines.length === 0 && (
                  <Text css={{ color: 'var(--studio-text-muted)', fontStyle: 'italic' }}>Connecting to remote...</Text>
                )}
                <div ref={logEndRef} />
              </Box>
            </Box>

            {state === 'success' && (
              <HStack gap={2} css={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--studio-green-subtle)', border: '1px solid var(--studio-green-border)' }}>
                <Check size={14} style={{ color: 'var(--studio-green)', flexShrink: 0 }} />
                <Text css={{ fontSize: '14px', color: 'var(--studio-green)', fontWeight: 500 }}>Cloned! Redirecting...</Text>
              </HStack>
            )}
          </>
        ) : (
          <>
            <FormField label="Repository URL" error={errors.gitUrl?.message}>
              <input {...register('gitUrl')} placeholder="https://github.com/user/repo.git" style={inputCss} />
            </FormField>

            <FormField label="Clone to" error={errors.parentPath?.message}>
              <Box
                as="button"
                type="button"
                onClick={async () => {
                  if (isElectron()) {
                    const p = await selectFolderNative()
                    if (p) setValue('parentPath', p, { shouldValidate: true })
                  } else {
                    setPickerOpen(true)
                  }
                }}
                css={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '8px',
                  border: '1px solid var(--studio-border)',
                  background: 'var(--studio-bg-surface)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.12s ease',
                  '&:hover': { borderColor: 'var(--studio-border-hover)' },
                }}
              >
                <FolderOpen size={15} style={{ color: parentPath ? 'var(--studio-green)' : 'var(--studio-text-muted)', flexShrink: 0 }} />
                <Text css={{
                  flex: 1, fontSize: '14px',
                  color: parentPath ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontFamily: parentPath ? "'SF Mono', Menlo, monospace" : 'inherit',
                }}>
                  {parentPath || 'Select a folder...'}
                </Text>
                <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', flexShrink: 0 }}>Browse</Text>
              </Box>
            </FormField>

            <FormField label="Project name (optional)" error={errors.name?.message}>
              <input {...register('name')} placeholder={derivedName || 'Auto-detected from URL'} style={inputCss} />
            </FormField>

            {parentPath && derivedName && (
              <HStack gap={2} css={{
                padding: '10px 12px', borderRadius: '8px',
                background: 'var(--studio-bg-sidebar)', border: '1px solid var(--studio-border)',
              }}>
                <GitBranch size={14} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
                <Text css={{
                  fontSize: '13px', fontFamily: "'SF Mono', Menlo, monospace",
                  color: 'var(--studio-text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {parentPath}/{derivedName}
                </Text>
              </HStack>
            )}

            {state === 'error' && (
              <HStack gap={2} css={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--studio-error-subtle)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle size={14} style={{ color: 'var(--studio-error)', flexShrink: 0 }} />
                <Text css={{ fontSize: '13px', color: 'var(--studio-error)' }}>{serverError}</Text>
              </HStack>
            )}

            <Box
              as="button"
              type="submit"
              disabled={!gitUrl || !parentPath}
              css={{
                width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
                background: (gitUrl && parentPath) ? 'var(--studio-accent)' : 'var(--studio-bg-surface)',
                color: (gitUrl && parentPath) ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)',
                fontSize: '15px', fontWeight: 500,
                cursor: (gitUrl && parentPath) ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                '&:hover': (gitUrl && parentPath) ? { opacity: 0.9 } : {},
              }}
            >
              Clone & Add to Studio
            </Box>
          </>
        )}
      </VStack>

      <FolderPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(p) => setValue('parentPath', p, { shouldValidate: true })}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </form>
  )
}
