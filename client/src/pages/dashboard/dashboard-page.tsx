import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderPlus, Sparkles } from 'lucide-react'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { Text, Button, VStack, EmptyState, spacing } from '@/components/shared/ui'
import { AddProjectModal } from '@/components/projects/add-project-modal'
import { useProjects } from '@/hooks/use-projects'
import { useProjectStore } from '@/stores/project-store'
import { projectHome } from '@/router/paths'
import { HeroSection } from './components/hero-section'
import { ProjectCard } from './components/project-card'

/* ── Animations ── */

const fadeInLeft = keyframes`
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
`

const fadeInRight = keyframes`
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
`

/* ── Layout ── */

const Page = styled.div`
  height: 100%;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`

const SplitContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 900px;
  min-width: 600px;
  gap: ${spacing['4xl']};
  padding: ${spacing['5xl']} ${spacing['3xl']};
  margin: 0 auto;
`

const LeftPanel = styled.div`
  flex: 0 0 42%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: ${fadeInLeft} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
`

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  justify-content: center;
  animation: ${fadeInRight} 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing.md};
`

/* ── Page ── */

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
      <SplitContainer>
        {/* ── Left: Brand Hero ── */}
        <LeftPanel>
          <HeroSection />
        </LeftPanel>

        {/* ── Right: Projects ── */}
        <RightPanel>
          <SectionHeader>
            <Text variant="tiny" color="muted">Your projects</Text>
            <Button variant="secondary" size="sm" onClick={() => setAddModalOpen(true)}>
              <FolderPlus size={13} />
              Add project
            </Button>
          </SectionHeader>

          {projects.length === 0 ? (
            <EmptyState
              icon={<Sparkles />}
              title="No projects yet"
              description="Add your first project to start building with Claude."
            >
              <Button variant="primary" size="md" onClick={() => setAddModalOpen(true)} css={{ marginTop: spacing.md }}>
                <FolderPlus size={14} />
                Add your first project
              </Button>
            </EmptyState>
          ) : (
            <VStack gap="sm">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isActive={project.id === activeProject?.id}
                  onSelect={() => handleSelect(project.id)}
                />
              ))}
            </VStack>
          )}
        </RightPanel>
      </SplitContainer>

      <AddProjectModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </Page>
  )
}
