import { useState } from "react";
import { FolderPlus, LayoutGrid } from "lucide-react";
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
  from { opacity: 0; transform: translateY(10px); }
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
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: ${spacing["3xl"]};
  animation: ${fadeIn} 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const ProjectsBox = styled.div`
  border: 1px solid var(--studio-border);
  border-radius: ${radii["3xl"]};
  overflow: hidden;
`;

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterRow = styled.button`
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
`;

const SeeAllRow = styled(FooterRow)`
  color: var(--studio-text-secondary);
`;

const EmptyBox = styled.div`
  padding: ${spacing["4xl"]} ${spacing["2xl"]};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.lg};
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
            {hasProjects ? (
              <>
                <ProjectsList>
                  {visible.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </ProjectsList>

                {hasMore && (
                  <SeeAllRow onClick={() => setAllModalOpen(true)}>
                    <LayoutGrid size={13} />
                    See all {projects.length} projects
                  </SeeAllRow>
                )}

                <FooterRow onClick={() => setAddModalOpen(true)}>
                  <FolderPlus size={14} />
                  Add project
                </FooterRow>
              </>
            ) : (
              <EmptyBox>
                <Text variant="title">No projects yet</Text>
                <Text variant="body" color="muted" css={{ maxWidth: "280px" }}>
                  Add your first project to start building with Claude.
                </Text>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setAddModalOpen(true)}
                >
                  <FolderPlus size={14} />
                  Add your first project
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
            {projects.length} project{projects.length !== 1 ? "s" : ""} — sorted by most recently opened
          </Text>
          <Box css={{ maxHeight: "60vh", overflowY: "auto", margin: `0 -${spacing.xl}` }}>
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
