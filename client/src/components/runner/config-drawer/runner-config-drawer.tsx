import { useState } from 'react'
import { Flex } from '@chakra-ui/react'
import { Terminal, Pencil } from 'lucide-react'
import { Drawer, Button, IconButton, spacing } from '@/components/shared/ui'
import type { RunnerConfigData } from '@/api/types'
import { useConfigForm, toPayload } from './hooks'
import { ConfigDetail, ConfigFields, EnvEditor, DrawerTabs, type ConfigTab } from './components'

interface RunnerConfigDrawerProps {
  config?: RunnerConfigData | null
  onSave: (data: Partial<RunnerConfigData>) => void
  onClose: () => void
}

export function RunnerConfigDrawer({ config, onSave, onClose }: RunnerConfigDrawerProps) {
  const isNew = !config
  const [editing, setEditing] = useState(isNew)
  const [tab, setTab] = useState<ConfigTab>('config')
  const { form, envArray } = useConfigForm(config)

  const handleSave = form.handleSubmit((data) => {
    onSave(toPayload(data))
    onClose()
  })

  const isDetail = !editing && !!config

  return (
    <Drawer
      title={isDetail ? config.name : isNew ? 'Add Service' : 'Edit Service'}
      onClose={onClose}
      size="sm"
      headerExtra={!isDetail ? <Terminal size={16} style={{ color: 'var(--studio-text-muted)' }} /> : undefined}
      headerTrailing={isDetail ? (
        <IconButton variant="ghost" size="sm" onClick={() => setEditing(true)} aria-label="Edit">
          <Pencil />
        </IconButton>
      ) : undefined}
      footer={!isDetail ? (
        <Flex gap={spacing.sm} justify="flex-end" css={{ width: '100%' }}>
          <Button variant="ghost" size="md" onClick={isNew ? onClose : () => setEditing(false)}>
            {isNew ? 'Cancel' : 'Back'}
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={!form.formState.isValid}>
            {isNew ? 'Add Service' : 'Save'}
          </Button>
        </Flex>
      ) : undefined}
    >
      {isDetail ? (
        <ConfigDetail config={config} />
      ) : (
        <>
          <DrawerTabs active={tab} onChange={setTab} envCount={envArray.fields.length} />
          {tab === 'config' ? (
            <ConfigFields register={form.register} errors={form.formState.errors} />
          ) : (
            <EnvEditor register={form.register} envArray={envArray} />
          )}
        </>
      )}
    </Drawer>
  )
}
