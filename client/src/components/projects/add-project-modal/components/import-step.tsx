import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Folder, Package, GitBranch } from 'lucide-react'
import { api } from '@/api'
import { useProjects } from '@/hooks/use-projects'
import { FormField, inputCss } from '@/components/forms/form-field'
import { FolderPicker } from '@/pages/projects/add/folder-picker'
import { isElectron, selectFolderNative } from '@/lib/electron'
import { projectHome } from '@/router/paths'
import { Button, Badge, Card, VStack, HStack, spacing } from '@/components/shared/ui'
import { FolderButton } from './folder-button'

interface ValidationResult {
  valid: boolean; path: string; name: string
  isBlacksmithProject: boolean; hasPackageJson: boolean; hasGit: boolean
}

const importSchema = z.object({
  projectPath: z.string().min(1, 'Select a project folder'),
  projectName: z.string().min(1, 'Project name is required'),
})

export function ImportStep({ onClose }: { onClose: () => void }) {
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
    } catch { setValidation(null) }
  }

  const onSubmit = async (data: z.infer<typeof importSchema>) => {
    if (!validation?.valid) return
    setRegistering(true)
    try {
      const project = await registerProject(data.projectPath, data.projectName)
      onClose()
      navigate(projectHome(project.id))
    } catch { setRegistering(false) }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap="lg">
        <FormField label="Project folder" error={errors.projectPath?.message}>
          <FolderButton
            path={projectPath}
            onPick={async () => {
              if (isElectron()) { const p = await selectFolderNative(); if (p) handleFolderSelected(p) }
              else setPickerOpen(true)
            }}
          />
        </FormField>

        {validation?.valid && (
          <Card variant="inset" p={spacing.md}>
            <HStack gap="md" css={{ marginBottom: spacing.md }}>
              {validation.isBlacksmithProject
                ? <Badge variant="success" size="sm"><Folder size={10} /> Blacksmith project</Badge>
                : <Badge variant="default" size="sm"><Folder size={10} /> Project folder</Badge>
              }
              {validation.hasPackageJson && <Badge variant="default" size="sm"><Package size={10} /> npm</Badge>}
              {validation.hasGit && <Badge variant="default" size="sm"><GitBranch size={10} /> git</Badge>}
            </HStack>
            <FormField label="Project name" error={errors.projectName?.message}>
              <input {...register('projectName')} placeholder={validation.name} style={inputCss} />
            </FormField>
          </Card>
        )}

        <Button variant="primary" size="lg" css={{ width: '100%' }} disabled={!validation?.valid || registering} onClick={handleSubmit(onSubmit)}>
          {registering ? 'Adding project...' : 'Add to Studio'}
        </Button>
      </VStack>

      <FolderPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleFolderSelected} />
    </form>
  )
}
