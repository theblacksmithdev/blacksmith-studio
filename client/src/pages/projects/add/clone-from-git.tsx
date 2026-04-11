import { useState, useEffect, useRef } from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FolderOpen, GitBranch, Terminal } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { FormField, inputCss } from '@/components/forms/form-field'
import { FolderPicker } from './folder-picker'
import { isElectron, selectFolderNative } from '@/lib/electron'

const schema = z.object({
  gitUrl: z.string().min(1, 'Repository URL is required'),
  parentPath: z.string().min(1, 'Select a destination folder'),
  name: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function deriveRepoName(url: string): string {
  return url.replace(/\.git$/, '').split('/').pop()?.replace(/[^a-zA-Z0-9_-]/g, '') || ''
}

export function CloneFromGit() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [cloning, setCloning] = useState(false)
  const [output, setOutput] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const termRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gitUrl: '', parentPath: '', name: '' },
  })

  const gitUrl = watch('gitUrl')
  const parentPath = watch('parentPath')
  const name = watch('name')
  const derivedName = name || deriveRepoName(gitUrl)

  const handleBrowseClick = async () => {
    if (isElectron()) {
      const path = await selectFolderNative()
      if (path) setValue('parentPath', path, { shouldValidate: true })
    } else {
      setPickerOpen(true)
    }
  }

  // Auto-scroll terminal
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight
    }
  }, [output])

  const onSubmit = async (data: FormData) => {
    setCloning(true)
    setOutput([])
    setError(null)

    try {
      await api.projects.clone({
        gitUrl: data.gitUrl.trim(),
        parentPath: data.parentPath,
        name: data.name?.trim() || undefined,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to start clone')
      setCloning(false)
    }
  }

  // Listen for streaming events
  useEffect(() => {
    const unsubs = [
      api.projects.onCreateOutput((data) => {
        setOutput((prev) => [...prev, data.line])
      }),
      api.projects.onCreateDone((data) => {
        setCloning(false)
        qc.invalidateQueries({ queryKey: queryKeys.projects })
        qc.invalidateQueries({ queryKey: queryKeys.activeProject })
        if (data.project?.id) {
          navigate(`/${data.project.id}`)
        }
      }),
      api.projects.onCreateError((data) => {
        setCloning(false)
        setError(data.error)
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [navigate, qc])

  return (
    <VStack gap={6} css={{ maxWidth: '480px', width: '100%', padding: '0 24px' }}>
      <VStack gap={2}>
        <Text css={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--studio-text-primary)', textAlign: 'center' }}>
          Clone from Git
        </Text>
        <Text css={{ fontSize: '15px', color: 'var(--studio-text-tertiary)', textAlign: 'center' }}>
          Enter a repository URL and choose where to clone it.
        </Text>
      </VStack>

      <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
        <VStack gap={4} align="stretch">
          {/* Git URL */}
          <FormField label="Repository URL" error={errors.gitUrl?.message}>
            <input
              {...register('gitUrl')}
              placeholder="https://github.com/user/repo.git"
              style={inputCss}
              disabled={cloning}
            />
          </FormField>

          {/* Destination folder */}
          <FormField label="Clone to" error={errors.parentPath?.message}>
            <Box
              as="button"
              type="button"
              onClick={handleBrowseClick}
              disabled={cloning}
              css={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid var(--studio-border)',
                background: 'var(--studio-bg-surface)',
                cursor: cloning ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.12s ease',
                '&:hover': cloning ? {} : { borderColor: 'var(--studio-border-hover)' },
              }}
            >
              <FolderOpen size={16} style={{ color: parentPath ? 'var(--studio-green)' : 'var(--studio-text-muted)', flexShrink: 0 }} />
              <Text css={{
                flex: 1, fontSize: '14px',
                color: parentPath ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontFamily: parentPath ? "'SF Mono', 'Fira Code', Menlo, monospace" : 'inherit',
              }}>
                {parentPath || 'Choose a folder...'}
              </Text>
              <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', flexShrink: 0 }}>Browse</Text>
            </Box>
          </FormField>

          {/* Project name (optional) */}
          <FormField label="Project name (optional)" error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder={deriveRepoName(gitUrl) || 'Auto-detected from URL'}
              style={inputCss}
              disabled={cloning}
            />
          </FormField>

          {/* Preview */}
          {parentPath && derivedName && (
            <HStack gap={2} css={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'var(--studio-bg-sidebar)',
              border: '1px solid var(--studio-border)',
            }}>
              <GitBranch size={14} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
              <Text css={{
                fontSize: '13px',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                color: 'var(--studio-text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {parentPath}/{derivedName}
              </Text>
            </HStack>
          )}

          {/* Terminal output */}
          {(cloning || output.length > 0) && (
            <Box
              ref={termRef}
              css={{
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'var(--studio-bg-inset)',
                border: '1px solid var(--studio-border)',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: '12px',
                lineHeight: '18px',
                color: 'var(--studio-text-tertiary)',
              }}
            >
              {output.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              {cloning && (
                <Text css={{ color: 'var(--studio-text-muted)', animation: 'dotPulse 1.5s ease infinite' }}>
                  Cloning...
                </Text>
              )}
            </Box>
          )}

          {/* Error */}
          {error && (
            <Text css={{ fontSize: '14px', color: 'var(--studio-error)', padding: '8px 0' }}>
              {error}
            </Text>
          )}

          {/* Submit */}
          <Box
            as="button"
            type="submit"
            disabled={cloning || !gitUrl || !parentPath}
            css={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
              background: (gitUrl && parentPath && !cloning) ? 'var(--studio-accent)' : 'var(--studio-bg-surface)',
              color: (gitUrl && parentPath && !cloning) ? 'var(--studio-accent-fg)' : 'var(--studio-text-muted)',
              fontSize: '15px', fontWeight: 500,
              cursor: (gitUrl && parentPath && !cloning) ? 'pointer' : 'default',
              transition: 'all 0.15s ease',
              '&:hover': (gitUrl && parentPath && !cloning) ? { opacity: 0.9 } : {},
            }}
          >
            {cloning ? 'Cloning repository...' : 'Clone & Add to Studio'}
          </Box>
        </VStack>
      </form>

      <FolderPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(path) => setValue('parentPath', path, { shouldValidate: true })}
      />
    </VStack>
  )
}
