import { Box, VStack } from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MessageSquare,
  FolderTree,
  Play,
  Sparkles,
  History,
  Settings,
  Anvil,
  LogOut,
} from 'lucide-react'
import { Tooltip } from '@/components/shared/tooltip'
import { useProjectStore } from '@/stores/project-store'
import { useRunnerStore, selectIsAnyRunning, selectIsAnyStarting } from '@/stores/runner-store'
import { useProjects } from '@/hooks/use-projects'
import {
  Path,
  newChatPath,
  codePath,
  runPath,
  templatesPath,
  activityPath,
  settingsPath,
} from '@/router/paths'

function RunnerBadge() {
  const anyRunning = useRunnerStore(selectIsAnyRunning)
  const anyStarting = useRunnerStore(selectIsAnyStarting)

  if (!anyRunning && !anyStarting) return null

  return (
    <Box
      css={{
        position: 'absolute',
        top: '4px',
        right: '4px',
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: 'var(--studio-accent)',
        boxShadow: '0 0 4px var(--studio-border-hover)',
        animation: anyStarting ? 'pulse-badge 1.5s ease-in-out infinite' : 'none',
        '@keyframes pulse-badge': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
      }}
    />
  )
}

const railBtn = (active = false) => ({
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  border: 'none',
  background: active ? 'var(--studio-bg-hover)' : 'transparent',
  color: active ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.12s ease',
  '&:hover': {
    background: active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
    color: active ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)',
  },
})

export function NavRail() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeProject = useProjectStore((s) => s.activeProject)

  useProjects()

  const pid = activeProject?.id
  const pathname = location.pathname
  const isInsideProject = pid && pathname.startsWith(`/${pid}`)

  return (
    <Box
      as="nav"
      css={{
        width: '56px',
        background: 'var(--studio-bg-sidebar)',
        borderRight: '1px solid var(--studio-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        flexShrink: 0,
        paddingTop: '10px',
        paddingBottom: '10px',
      }}
    >
      {/* Logo — always goes to dashboard */}
      <Tooltip content="Dashboard">
        <Box
          as="button"
          onClick={() => navigate(Path.Home)}
          css={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--studio-accent)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'opacity 0.15s ease',
            '&:hover': { opacity: 0.85 },
          }}
        >
          <Anvil size={15} color="var(--studio-accent-fg)" />
        </Box>
      </Tooltip>

      {/* Project tools — only inside a project */}
      {isInsideProject && pid ? (
        <VStack gap={1} flex={1}>
          <Tooltip content="Chat">
            <Box as="button" onClick={() => navigate(newChatPath(pid))} css={railBtn(pathname.includes('/chat'))}>
              <MessageSquare size={18} />
            </Box>
          </Tooltip>
          <Tooltip content="Code">
            <Box as="button" onClick={() => navigate(codePath(pid))} css={railBtn(pathname.endsWith('/code'))}>
              <FolderTree size={18} />
            </Box>
          </Tooltip>
          <Tooltip content="Run">
            <Box as="button" onClick={() => navigate(runPath(pid))} css={{ ...railBtn(pathname.endsWith('/run')), position: 'relative' }}>
              <Play size={18} />
              <RunnerBadge />
            </Box>
          </Tooltip>
          <Tooltip content="Templates">
            <Box as="button" onClick={() => navigate(templatesPath(pid))} css={railBtn(pathname.endsWith('/templates'))}>
              <Sparkles size={18} />
            </Box>
          </Tooltip>
          <Box css={{ flex: 1 }} />
          <Tooltip content="History">
            <Box as="button" onClick={() => navigate(activityPath(pid))} css={railBtn(pathname.endsWith('/activity'))}>
              <History size={18} />
            </Box>
          </Tooltip>
        </VStack>
      ) : (
        <Box css={{ flex: 1 }} />
      )}

      {/* Bottom — always visible */}
      <VStack
        gap={1}
        css={{
          borderTop: '1px solid var(--studio-border)',
          paddingTop: '8px',
          marginTop: '4px',
          flexShrink: 0,
        }}
      >
        {isInsideProject && (
          <Tooltip content="Exit project">
            <Box
              as="button"
              onClick={() => {
                useProjectStore.getState().setActiveProject(null)
                navigate(Path.Home)
              }}
              css={railBtn(false)}
            >
              <LogOut size={16} />
            </Box>
          </Tooltip>
        )}

        {isInsideProject && pid && (
          <Tooltip content="Settings">
            <Box as="button" onClick={() => navigate(settingsPath(pid))} css={railBtn(pathname.endsWith('/settings'))}>
              <Settings size={17} />
            </Box>
          </Tooltip>
        )}
      </VStack>
    </Box>
  )
}
