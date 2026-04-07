import { useState } from 'react'
import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'
import { FolderPlus, Anvil } from 'lucide-react'
import { ProjectCard } from '@/components/dashboard/project-card'
import { AddProjectModal } from '@/components/projects/add-project-modal'
import { useProjects } from '@/hooks/use-projects'
import { useProjectStore } from '@/stores/project-store'
import { projectHome } from '@/router/paths'

const Page = styled.div`
  height: 100%;
  overflow-y: auto;
  display: flex;
  justify-content: center;
`

const Container = styled.div`
  width: 100%;
  max-width: 560px;
  padding: 60px 24px;
`

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 48px;
`

const Logo = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: var(--studio-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
`

const Title = styled.h1`
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--studio-text-primary);
`

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--studio-text-tertiary);
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const SectionLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--studio-text-muted);
`

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const EmptyCard = styled.button`
  width: 100%;
  padding: 48px 20px;
  border-radius: 12px;
  border: 1px dashed var(--studio-border);
  background: transparent;
  cursor: pointer;
  text-align: center;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-sidebar);
  }
`

const EmptyIcon = styled.div`
  color: var(--studio-text-muted);
  margin: 0 auto 8px;
  display: flex;
  justify-content: center;
`

const EmptyTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--studio-text-secondary);
  margin-bottom: 4px;
`

const EmptyDesc = styled.div`
  font-size: 12px;
  color: var(--studio-text-muted);
`

export default function DashboardPage() {
  const navigate = useNavigate()
  const { projects, activate } = useProjects()
  const activeProject = useProjectStore((s) => s.activeProject)
  const [addModalOpen, setAddModalOpen] = useState(false)

  const handleSelect = async (projectId: string) => {
    await activate(projectId)
    navigate(projectHome(projectId))
  }

  return (
    <Page>
      <Container>
        <Hero>
          <Logo>
            <Anvil size={20} color="var(--studio-accent-fg)" />
          </Logo>
          <Title>Blacksmith Studio</Title>
          <Subtitle>Select a project to get started.</Subtitle>
        </Hero>

        <SectionHeader>
          <SectionLabel>Projects</SectionLabel>
          <AddBtn onClick={() => setAddModalOpen(true)}>
            <FolderPlus size={12} />
            Add project
          </AddBtn>
        </SectionHeader>

        {projects.length === 0 ? (
          <EmptyCard onClick={() => setAddModalOpen(true)}>
            <EmptyIcon><FolderPlus size={24} /></EmptyIcon>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDesc>Add your first project to start building with Claude.</EmptyDesc>
          </EmptyCard>
        ) : (
          <ProjectList>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isActive={project.id === activeProject?.id}
                onSelect={() => handleSelect(project.id)}
              />
            ))}
          </ProjectList>
        )}
      </Container>

      <AddProjectModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </Page>
  )
}
