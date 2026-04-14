import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderPlus } from 'lucide-react'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { Text, Button, spacing, radii } from '@/components/shared/ui'
import { AddProjectModal } from '@/components/projects/add-project-modal'
import { useProjectsQuery } from '@/api/hooks/projects'
import { projectHome } from '@/router/paths'
import { HeroSection } from './components/hero-section'
import { ProjectCard } from './components/project-card'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Page = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--studio-bg-main);
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  padding: ${spacing['6xl']} ${spacing['2xl']} ${spacing['4xl']};
`

const Inner = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: ${spacing['3xl']};
  animation: ${fadeIn} 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
`

const ProjectsBox = styled.div`
  border: 1px solid var(--studio-border);
  border-radius: ${radii['3xl']};
  overflow: hidden;
`

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
`

const AddRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  width: 100%;
  padding: ${spacing.md};
  border: none;
  border-top: 1px solid var(--studio-border);
  background: transparent;
  color: var(--studio-text-tertiary);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-surface);
    color: var(--studio-text-primary);
  }
`

const EmptyBox = styled.div`
  padding: ${spacing['4xl']} ${spacing['2xl']};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.lg};
  text-align: center;
`

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: projects = [] } = useProjectsQuery()
  const [addModalOpen, setAddModalOpen] = useState(false)

  const handleSelect = (projectId: string) => {
    navigate(projectHome(projectId))
  }

  const hasProjects = projects.length > 0

  return (
    <Page>
      <Content>
        <Inner>
          <HeroSection />

          <ProjectsBox>
            {hasProjects ? (
              <>
                <ProjectsList>
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onSelect={() => handleSelect(project.id)}
                    />
                  ))}
                </ProjectsList>
                <AddRow onClick={() => setAddModalOpen(true)}>
                  <FolderPlus size={14} />
                  Add project
                </AddRow>
              </>
            ) : (
              <EmptyBox>
                <Text variant="title">No projects yet</Text>
                <Text variant="body" color="muted" css={{ maxWidth: '280px' }}>
                  Add your first project to start building with Claude.
                </Text>
                <Button variant="primary" size="md" onClick={() => setAddModalOpen(true)}>
                  <FolderPlus size={14} />
                  Add your first project
                </Button>
              </EmptyBox>
            )}
          </ProjectsBox>
        </Inner>
      </Content>

      <AddProjectModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </Page>
  )
}
