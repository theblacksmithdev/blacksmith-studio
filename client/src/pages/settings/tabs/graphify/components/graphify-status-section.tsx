import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { keyframes, css } from "@emotion/react";
import {
  Network,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Trash2,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react";
import { Text } from "@/components/shared/ui";
import type {
  GraphifyBuildResult,
  GraphifyStatus,
} from "@/api/modules/graphify";
import { formatTimeAgo } from "./styles";

/* ── Animations ── */

const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.4; }`;
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;

/* ── Styled ── */

const Card = styled.div`
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  overflow: hidden;
  background: var(--studio-bg-sidebar);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--studio-border);
`;

const StatusDot = styled.div<{ $status: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  ${(p) => {
    switch (p.$status) {
      case "ok":
        return `background: var(--studio-green); box-shadow: 0 0 6px var(--studio-green-border);`;
      case "stale":
        return `background: var(--studio-warning, #eab308); box-shadow: 0 0 6px rgba(234, 179, 8, 0.3);`;
      case "building":
        return css`
          background: #3b82f6;
          box-shadow: 0 0 6px rgba(59, 130, 246, 0.3);
          animation: ${pulse} 1.5s ease-in-out infinite;
        `;
      default:
        return `background: var(--studio-text-muted); opacity: 0.4;`;
    }
  }}
`;

const Body = styled.div`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Btn = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  border: 1px solid
    ${(p) =>
      p.$primary
        ? "var(--studio-accent)"
        : p.$danger
          ? "var(--studio-error)"
          : "var(--studio-border)"};
  background: ${(p) =>
    p.$primary
      ? "var(--studio-accent)"
      : p.$danger
        ? "transparent"
        : "var(--studio-bg-surface)"};
  color: ${(p) =>
    p.$primary
      ? "var(--studio-accent-fg)"
      : p.$danger
        ? "var(--studio-error)"
        : "var(--studio-text-secondary)"};
  &:hover {
    opacity: ${(p) => (p.$primary ? 0.85 : 1)};
    border-color: ${(p) =>
      p.$danger ? "var(--studio-error)" : "var(--studio-border-hover)"};
    color: ${(p) =>
      p.$primary
        ? "var(--studio-accent-fg)"
        : p.$danger
          ? "var(--studio-error)"
          : "var(--studio-text-primary)"};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  svg {
    flex-shrink: 0;
  }
`;

const ResultBar = styled.div<{ $success: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid
    ${(p) =>
      p.$success ? "var(--studio-green-border)" : "var(--studio-error)"};
  background: ${(p) =>
    p.$success ? "var(--studio-green-subtle)" : "var(--studio-error-subtle)"};
  color: ${(p) =>
    p.$success ? "var(--studio-green)" : "var(--studio-error)"};
  font-size: 12px;
  font-weight: 450;
`;

const MetaChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--studio-text-muted);
  svg {
    flex-shrink: 0;
  }
`;

/* ── Component ── */

interface GraphifyStatusSectionProps {
  graphStatus: GraphifyStatus | undefined;
  isBuilding: boolean;
  buildResult: GraphifyBuildResult | undefined;
  onBuild: () => void;
  onVisualize: () => void;
  onClean: () => void;
}

export function GraphifyStatusSection({
  graphStatus,
  isBuilding,
  buildResult,
  onBuild,
  onVisualize,
  onClean,
}: GraphifyStatusSectionProps) {
  const status = (() => {
    if (isBuilding) return "building";
    if (!graphStatus?.exists) return "missing";
    if (graphStatus.stale) return "stale";
    return "ok";
  })();

  const statusText = (() => {
    if (isBuilding) return "Building graph...";
    if (!graphStatus?.exists) return "No graph built yet";
    if (graphStatus.stale) return "Graph is stale";
    return "Graph up to date";
  })();

  const builtAgo = graphStatus?.builtAt
    ? formatTimeAgo(graphStatus.builtAt)
    : null;

  return (
    <Box>
      <Flex
        justify="space-between"
        align="flex-start"
        css={{ marginBottom: "14px" }}
      >
        <Box>
          <Text
            css={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--studio-text-primary)",
              letterSpacing: "-0.01em",
              marginBottom: "4px",
            }}
          >
            Graph Status
          </Text>
          <Text
            css={{
              fontSize: "13px",
              color: "var(--studio-text-tertiary)",
              lineHeight: 1.5,
            }}
          >
            Build and manage the knowledge graph for this project.
          </Text>
        </Box>
      </Flex>

      <Card>
        <Header>
          <StatusDot $status={status} />
          <Box css={{ flex: 1, minWidth: 0 }}>
            <Text
              css={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--studio-text-primary)",
              }}
            >
              {statusText}
            </Text>
          </Box>
          {builtAgo && (
            <MetaChip>
              <Clock size={10} />
              {builtAgo}
            </MetaChip>
          )}
        </Header>

        <Body>
          <ActionRow>
            <Btn
              $primary={!graphStatus?.exists && !isBuilding}
              disabled={isBuilding}
              onClick={onBuild}
            >
              {isBuilding ? (
                <Loader2 size={12} style={{ animation: `${spin} 1s linear infinite` }} />
              ) : (
                <Zap size={12} />
              )}
              {isBuilding
                ? "Building..."
                : graphStatus?.exists
                  ? "Rebuild"
                  : "Build Now"}
            </Btn>

            {graphStatus?.exists && (
              <>
                <Btn onClick={onVisualize}>
                  <ExternalLink size={12} />
                  Visualize
                </Btn>
                <Btn $danger disabled={isBuilding} onClick={onClean}>
                  <Trash2 size={12} />
                  Clean
                </Btn>
              </>
            )}
          </ActionRow>
        </Body>

        {buildResult && !buildResult.success && (
          <ResultBar $success={false}>
            <AlertCircle size={13} style={{ flexShrink: 0 }} />
            Build failed: {buildResult.error ?? "Unknown error"}
          </ResultBar>
        )}

        {buildResult?.success && (
          <ResultBar $success>
            <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
            Graph built in {(buildResult.durationMs / 1000).toFixed(1)}s
          </ResultBar>
        )}
      </Card>
    </Box>
  );
}
