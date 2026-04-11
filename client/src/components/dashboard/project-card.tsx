import styled from '@emotion/styled'
import { FolderOpen, ArrowRight } from 'lucide-react'
import type { Project } from '@/stores/project-store'

const Card = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${({ active }) => (active ? 'var(--studio-border-hover)' : 'var(--studio-border)')};
  background: ${({ active }) => (active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-sidebar)')};
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-hover);

    .card-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
`

const IconWrap = styled.div<{ active: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: ${({ active }) => (active ? 'var(--studio-bg-hover-strong)' : 'var(--studio-bg-surface)')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  flex-shrink: 0;
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Name = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: var(--studio-text-primary);
`

const PathText = styled.div`
  font-size: 12px;
  color: var(--studio-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
`

const Arrow = styled.div`
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.12s ease;
  color: var(--studio-text-muted);
  flex-shrink: 0;
`

interface ProjectCardProps {
  project: Project
  isActive: boolean
  onSelect: () => void
}

export function ProjectCard({ project, isActive, onSelect }: ProjectCardProps) {
  return (
    <Card active={isActive} onClick={onSelect}>
      <IconWrap active={isActive}>
        <FolderOpen size={17} />
      </IconWrap>
      <Body>
        <Name>{project.name}</Name>
        <PathText>{project.path}</PathText>
      </Body>
      <Arrow className="card-arrow">
        <ArrowRight size={15} />
      </Arrow>
    </Card>
  )
}
