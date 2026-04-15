import styled from "@emotion/styled";
import { ArrowRight } from "lucide-react";
import { Text, StatusDot, spacing, radii } from "@/components/shared/ui";
import type { Project } from "@/api/types";
import { Link } from "react-router-dom";
import { projectHome } from "@/router/paths";
import { useProjectRunnerStatus } from "@/api/hooks/runner";
import { useTouchProject } from "@/api/hooks/projects";

function getInitials(name: string): string {
  const words = name.replace(/[-_.]/g, " ").trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function formatRelative(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const Root = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: 11px ${spacing.lg};
  text-decoration: none;
  border-bottom: 1px solid var(--studio-border);
  transition: background 0.1s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--studio-bg-surface);

    .project-arrow {
      opacity: 1;
      transform: translateX(0);
    }
    .project-time {
      opacity: 0;
    }
  }
`;

const Initial = styled.div`
  width: 34px;
  height: 34px;
  border-radius: ${radii.md};
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--studio-text-secondary);
  flex-shrink: 0;
  letter-spacing: 0.04em;
  user-select: none;
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
`;

const Name = styled.span`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Path = styled.span`
  display: block;
  font-size: 11px;
  color: var(--studio-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
`;

const Side = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  flex-shrink: 0;
  position: relative;
`;

const TimeLabel = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
  transition: opacity 0.1s ease;
`;

const RunnerPill = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--studio-text-muted);
  flex-shrink: 0;
`;

const Arrow = styled.div`
  position: absolute;
  right: 0;
  opacity: 0;
  transform: translateX(-3px);
  transition: all 0.12s ease;
  color: var(--studio-text-muted);
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
      <Initial>{getInitials(project.name)}</Initial>
      <Body>
        <Name>{project.name}</Name>
        <Path>{project.path}</Path>
      </Body>
      <Side>
        {runningCount > 0 && (
          <RunnerPill>
            <StatusDot status="active" size="xs" />
            {runningCount}
          </RunnerPill>
        )}
        <TimeLabel className="project-time">
          {formatRelative(project.lastOpenedAt)}
        </TimeLabel>
        <Arrow className="project-arrow">
          <ArrowRight size={13} />
        </Arrow>
      </Side>
    </Root>
  );
}
