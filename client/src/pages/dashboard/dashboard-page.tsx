import { useState } from "react";
import { FolderPlus, LayoutGrid, Plus } from "lucide-react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { Box, Flex } from "@chakra-ui/react";
import { Text, Button, Modal, spacing, radii } from "@/components/shared/ui";
import { AddProjectModal } from "@/components/projects/add-project-modal";
import { useProjectsQuery } from "@/api/hooks/projects";
import { HeroSection } from "./components/hero-section";
import { ProjectCard } from "./components/project-card";

const VISIBLE_LIMIT = 5;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--studio-bg-main);
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  padding: ${spacing["6xl"]} ${spacing["2xl"]} ${spacing["4xl"]};
`;

const Inner = styled.div`
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: ${spacing["3xl"]};
  animation: ${fadeIn} 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const ProjectsBox = styled.div`
  border: 1px solid var(--studio-border);
  border-radius: ${radii["3xl"]};
  overflow: hidden;
  background: var(--studio-bg-sidebar);
`;

const BoxHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px ${spacing.lg};
  border-bottom: 1px solid var(--studio-border);
`;

const BoxLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: ${radii.sm};
  border: 1px solid var(--studio-border);
  background: transparent;
  color: var(--studio-text-secondary);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
    background: var(--studio-bg-hover);
  }
`;

const NewBtn = styled(ActionBtn)`
  background: var(--studio-accent);
  border-color: var(--studio-accent);
  color: var(--studio-accent-fg);

  &:hover {
    opacity: 0.88;
    background: var(--studio-accent);
    border-color: var(--studio-accent);
    color: var(--studio-accent-fg);
  }
`;

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const EmptyBox = styled.div`
  padding: ${spacing["4xl"]} ${spacing["2xl"]};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.md};
  text-align: center;
`;

const AllProjectsList = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--studio-border);
`;

export default function DashboardPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [allModalOpen, setAllModalOpen] = useState(false);
  const { data: projects = [] } = useProjectsQuery();

  const hasProjects = projects.length > 0;
  const hasMore = projects.length > VISIBLE_LIMIT;
  const visible = hasMore ? projects.slice(0, VISIBLE_LIMIT) : projects;

  return (
    <Page>
      <Content>
        <Inner>
          <HeroSection />

          <ProjectsBox>
            <BoxHeader>
              <BoxLabel>Recent</BoxLabel>
              <HeaderActions>
                {hasMore && (
                  <ActionBtn onClick={() => setAllModalOpen(true)}>
                    <LayoutGrid size={11} />
                    All {projects.length}
                  </ActionBtn>
                )}
                <NewBtn onClick={() => setAddModalOpen(true)}>
                  <Plus size={11} />
                  New project
                </NewBtn>
              </HeaderActions>
            </BoxHeader>

            {hasProjects ? (
              <ProjectsList>
                {visible.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </ProjectsList>
            ) : (
              <EmptyBox>
                <Text variant="body" color="muted" css={{ maxWidth: "260px" }}>
                  No projects yet. Add your first project to start building.
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setAddModalOpen(true)}
                >
                  <FolderPlus size={13} />
                  Add first project
                </Button>
              </EmptyBox>
            )}
          </ProjectsBox>
        </Inner>
      </Content>

      <AddProjectModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      {allModalOpen && (
        <Modal
          title="All Projects"
          onClose={() => setAllModalOpen(false)}
          width="520px"
          footer={
            <Flex css={{ width: "100%" }} justify="flex-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAllModalOpen(false);
                  setAddModalOpen(true);
                }}
              >
                <FolderPlus size={13} />
                Add project
              </Button>
            </Flex>
          }
        >
          <Text
            variant="caption"
            color="muted"
            css={{ display: "block", marginBottom: spacing.lg }}
          >
            {projects.length} project{projects.length !== 1 ? "s" : ""} — sorted
            by most recently opened
          </Text>
          <Box
            css={{
              maxHeight: "60vh",
              overflowY: "auto",
              margin: `0 -${spacing.xl}`,
            }}
          >
            <AllProjectsList>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onNavigate={() => setAllModalOpen(false)}
                />
              ))}
            </AllProjectsList>
          </Box>
        </Modal>
      )}
    </Page>
  );
}
