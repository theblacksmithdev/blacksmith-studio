import styled from '@emotion/styled'
import {
  ArrowRight,
  Code,
  Layers,
  Database,
  Shield,
  FileCode2,
  Bug,
  Sparkles,
} from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { templatesPath } from '@/router/paths'
import { RunServersCard } from '@/components/runner/runner-servers-card'

const quickActions = [
  {
    icon: Layers,
    label: 'Create a resource',
    desc: 'Full-stack model, API & pages',
    prompt: 'Help me create a new full-stack resource with Django model, serializer, API viewset, and React pages.',
  },
  {
    icon: FileCode2,
    label: 'Add a page',
    desc: 'New route with components',
    prompt: 'Help me create a new page with proper routing, layout, and components.',
  },
  {
    icon: Database,
    label: 'Build an API',
    desc: 'Django REST endpoint',
    prompt: 'Help me create a new Django REST API endpoint with serializer and views.',
  },
  {
    icon: Shield,
    label: 'Add auth',
    desc: 'Login, register & guards',
    prompt: 'Help me add authentication with login, registration, and route protection.',
  },
  {
    icon: Bug,
    label: 'Fix a bug',
    desc: 'Debug and resolve issues',
    prompt: 'Help me investigate and fix a bug in my project.',
  },
  {
    icon: Code,
    label: 'Write tests',
    desc: 'Unit & integration tests',
    prompt: 'Help me write tests for my existing code using the project testing patterns.',
  },
]

const Container = styled.div`
  width: 100%;
`

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-tertiary);
  margin-bottom: 14px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--studio-border);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--studio-border);
`

const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 18px;
  background: var(--studio-bg-sidebar);
  color: var(--studio-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  border: none;

  &:hover {
    background: var(--studio-bg-surface);
    color: var(--studio-text-primary);

    .action-icon {
      color: var(--studio-text-primary);
      border-color: var(--studio-border-hover);
    }

    .action-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
`

const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const IconBox = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--studio-text-tertiary);
  transition: all 0.15s ease;
  flex-shrink: 0;
`

const ActionArrow = styled.div`
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.15s ease;
  color: var(--studio-text-tertiary);
`

const ActionLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: inherit;
  margin-bottom: 2px;
`

const ActionDesc = styled.div`
  font-size: 12px;
  color: var(--studio-text-tertiary);
`

const TemplatesLink = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  padding: 8px 14px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--studio-text-tertiary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: var(--studio-text-primary);
    background: var(--studio-border);
  }
`

interface QuickActionsProps {
  onSend: (prompt: string) => void
  onNavigate: (path: string) => void
}

export function QuickActions({ onSend, onNavigate }: QuickActionsProps) {
  const activeProject = useProjectStore((s) => s.activeProject)

  return (
    <Container>
      <RunServersCard />

      <SectionLabel style={{ marginTop: '28px' }}>Quick start</SectionLabel>

      <Grid>
        {quickActions.map(({ icon: Icon, label, desc, prompt }) => (
          <ActionButton key={label} onClick={() => onSend(prompt)}>
            <ActionHeader>
              <IconBox className="action-icon">
                <Icon size={15} />
              </IconBox>
              <ActionArrow className="action-arrow">
                <ArrowRight size={13} />
              </ActionArrow>
            </ActionHeader>
            <div>
              <ActionLabel>{label}</ActionLabel>
              <ActionDesc>{desc}</ActionDesc>
            </div>
          </ActionButton>
        ))}
      </Grid>

      <TemplatesLink onClick={() => activeProject && onNavigate(templatesPath(activeProject.id))}>
        <Sparkles size={14} />
        Browse all templates
        <ArrowRight size={12} />
      </TemplatesLink>
    </Container>
  )
}
