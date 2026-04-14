import styled from '@emotion/styled'
import { FolderOpen, ArrowRight } from 'lucide-react'
import { Text, Avatar, spacing } from '@/components/shared/ui'
import type { Project } from '@/stores/project-store'

const Root = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md} ${spacing.xl};
  border: none;
  border-bottom: 1px solid var(--studio-border);
  background: ${({ $active }) => $active ? 'var(--studio-bg-surface)' : 'transparent'};
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: inherit;
  transition: all 0.12s ease;

  &:last-child { border-bottom: none; }

  &:hover {
    background: var(--studio-bg-surface);

    .project-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Arrow = styled.div`
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.12s ease;
  color: var(--studio-text-muted);
  flex-shrink: 0;
  display: flex;
`

interface ProjectCardProps {
  project: Project
  isActive?: boolean
  onSelect: () => void
}

export function ProjectCard({ project, isActive = false, onSelect }: ProjectCardProps) {
  return (
    <Root $active={isActive} onClick={onSelect}>
      <Avatar size="sm" variant={isActive ? 'active' : 'default'} icon={<FolderOpen />} />
      <Body>
        <Text variant="label" css={{ display: 'block', color: 'var(--studio-text-primary)', fontWeight: 500 }}>
          {project.name}
        </Text>
        <Text variant="caption" color="muted" truncate css={{ display: 'block', marginTop: '1px' }}>
          {project.path}
        </Text>
      </Body>
      <Arrow className="project-arrow">
        <ArrowRight size={14} />
      </Arrow>
    </Root>
  )
}
