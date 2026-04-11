import styled from '@emotion/styled'
import { FolderOpen, ArrowRight } from 'lucide-react'
import { Text, Avatar, spacing, radii } from '@/components/shared/ui'
import type { Project } from '@/stores/project-store'

const Root = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${radii.xl};
  border: 1px solid ${({ $active }) => $active ? 'var(--studio-border-hover)' : 'var(--studio-border)'};
  background: ${({ $active }) => $active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-main)'};
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: inherit;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-surface);
    box-shadow: var(--studio-shadow);
    transform: translateY(-1px);

    .project-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &:active {
    transform: translateY(0);
  }
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Arrow = styled.div`
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.15s ease;
  color: var(--studio-text-muted);
  flex-shrink: 0;
  display: flex;
`

interface ProjectCardProps {
  project: Project
  isActive: boolean
  onSelect: () => void
}

export function ProjectCard({ project, isActive, onSelect }: ProjectCardProps) {
  return (
    <Root $active={isActive} onClick={onSelect}>
      <Avatar size="md" variant={isActive ? 'active' : 'default'} icon={<FolderOpen />} />
      <Body>
        <Text variant="label" css={{ display: 'block', color: 'var(--studio-text-primary)', fontWeight: 500 }}>
          {project.name}
        </Text>
        <Text variant="caption" color="muted" truncate css={{ display: 'block', marginTop: '2px' }}>
          {project.path}
        </Text>
      </Body>
      <Arrow className="project-arrow">
        <ArrowRight size={15} />
      </Arrow>
    </Root>
  )
}
