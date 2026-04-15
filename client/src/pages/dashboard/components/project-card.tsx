import styled from "@emotion/styled";
import { FolderOpen, ArrowRight } from "lucide-react";
import { Text, Avatar, StatusDot, spacing } from "@/components/shared/ui";
import type { Project } from "@/api/types";
import { Link } from "react-router-dom";
import { projectHome } from "@/router/paths";
import { useProjectRunnerStatus } from "@/api/hooks/runner";
import { useTouchProject } from "@/api/hooks/projects";

const Root = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md} ${spacing.xl};
  border: none;
  border-bottom: 1px solid var(--studio-border);
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: inherit;
  transition: all 0.12s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--studio-bg-surface);

    .project-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
`;

const RunnerBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 100px;
  background: var(--studio-bg-surface);
  color: var(--studio-text-tertiary);
  font-size: 11px;
  font-weight: 500;
  flex-shrink: 0;
  white-space: nowrap;
`;

const Arrow = styled.div`
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.12s ease;
  color: var(--studio-text-muted);
  flex-shrink: 0;
  display: flex;
`;

interface ProjectCardProps {
  project: Project;
  onNavigate?: () => void;
}

export function ProjectCard({ project, onNavigate }: ProjectCardProps) {
  const { data: services } = useProjectRunnerStatus(project.id);
  const touch = useTouchProject();

  const runningCount =
    services?.filter((s) => s.status === "running" || s.status === "starting")
      .length ?? 0;

  const handleClick = () => {
    touch.mutate(project.id);
    onNavigate?.();
  };

  return (
    <Root to={projectHome(project.id)} onClick={handleClick}>
      <Avatar size="sm" variant="default" icon={<FolderOpen />} />
      <Body>
        <Text
          variant="label"
          css={{
            display: "block",
            color: "var(--studio-text-primary)",
            fontWeight: 500,
          }}
        >
          {project.name}
        </Text>
        <Text
          variant="caption"
          color="muted"
          truncate
          css={{ display: "block", marginTop: "1px" }}
        >
          {project.path}
        </Text>
      </Body>
      {runningCount > 0 && (
        <RunnerBadge>
          <StatusDot status="active" size="xs" />
          {runningCount} running
        </RunnerBadge>
      )}
      <Arrow className="project-arrow">
        <ArrowRight size={14} />
      </Arrow>
    </Root>
  );
}
