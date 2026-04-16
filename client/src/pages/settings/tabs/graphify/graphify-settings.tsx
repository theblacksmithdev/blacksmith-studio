import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import {
  Network,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { SettingToggle } from "@/pages/settings/components/setting-toggle";
import { Text, spacing } from "@/components/shared/ui";
import {
  useGraphifyCheck,
  useGraphifyStatus,
  useGraphifyBuild,
  useGraphifyClean,
} from "@/api/hooks/graphify";
import { useSettingsQuery, useUpdateSettings } from "@/api/hooks/settings";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { api } from "@/api";

const ActionBtn = styled.button<{ $variant?: "danger" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid
    ${(p) =>
      p.$variant === "danger"
        ? "var(--studio-error)"
        : "var(--studio-border)"};
  background: ${(p) =>
    p.$variant === "danger"
      ? "var(--studio-error-subtle)"
      : "var(--studio-bg-surface)"};
  color: ${(p) =>
    p.$variant === "danger"
      ? "var(--studio-error)"
      : "var(--studio-text-secondary)"};
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  &:hover {
    border-color: ${(p) =>
      p.$variant === "danger"
        ? "var(--studio-error)"
        : "var(--studio-border-hover)"};
    color: ${(p) =>
      p.$variant === "danger"
        ? "var(--studio-error)"
        : "var(--studio-text-primary)"};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.div<{ $status: "ok" | "stale" | "missing" | "building" }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  ${(p) => {
    switch (p.$status) {
      case "ok":
        return `
          background: var(--studio-green-subtle);
          color: var(--studio-green);
          border: 1px solid var(--studio-green-border);
        `;
      case "stale":
        return `
          background: var(--studio-warning-subtle, rgba(234, 179, 8, 0.08));
          color: var(--studio-warning, #eab308);
          border: 1px solid var(--studio-warning-border, rgba(234, 179, 8, 0.2));
        `;
      case "building":
        return `
          background: var(--studio-blue-subtle);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        `;
      default:
        return `
          background: var(--studio-bg-surface);
          color: var(--studio-text-muted);
          border: 1px solid var(--studio-border);
        `;
    }
  }}
`;

const CodeBlock = styled.code`
  display: inline;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  font-size: 12px;
  color: var(--studio-text-secondary);
`;

export function GraphifySettings() {
  const projectId = useActiveProjectId();
  const { data: installStatus } = useGraphifyCheck();
  const { data: graphStatus } = useGraphifyStatus();
  const { data: settings } = useSettingsQuery();
  const updateSettings = useUpdateSettings();
  const buildMutation = useGraphifyBuild();
  const cleanMutation = useGraphifyClean();

  const enabled = settings?.["graphify.enabled"] ?? false;
  const autoRebuild = settings?.["graphify.autoRebuild"] ?? true;
  const installed = installStatus?.installed ?? false;
  const isBuilding = buildMutation.isPending || graphStatus?.building;

  const graphStatusLabel = (() => {
    if (isBuilding) return "building";
    if (!graphStatus?.exists) return "missing";
    if (graphStatus.stale) return "stale";
    return "ok";
  })() as "ok" | "stale" | "missing" | "building";

  const graphStatusText = (() => {
    if (isBuilding) return "Building...";
    if (!graphStatus?.exists) return "No graph built";
    if (graphStatus.stale) return "Graph is stale";
    return "Up to date";
  })();

  const builtAgo = graphStatus?.builtAt
    ? formatTimeAgo(graphStatus.builtAt)
    : null;

  return (
    <Flex direction="column" gap="28px">
      <SettingsSection
        title="Knowledge Graph"
        description="Graphify builds a knowledge graph from your codebase, giving AI agents deep structural understanding with dramatically fewer tokens."
      >
        {/* Install status */}
        <SettingRow
          label="Graphify CLI"
          description={
            installed ? (
              <Flex align="center" gap="4px">
                <CheckCircle2 size={11} color="var(--studio-green)" />
                Installed{installStatus?.version ? ` (v${installStatus.version})` : ""}
              </Flex>
            ) : (
              <Flex direction="column" gap="4px">
                <Flex align="center" gap="4px">
                  <XCircle size={11} color="var(--studio-error)" />
                  Not installed
                </Flex>
                <Text css={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>
                  Install with: <CodeBlock>pip install graphifyy && graphify install</CodeBlock>
                </Text>
              </Flex>
            )
          }
        >
          <span />
        </SettingRow>

        {/* Enable toggle */}
        <SettingRow
          label="Enable Graphify"
          description="Inject the knowledge graph into AI context for agents and chat."
        >
          <SettingToggle
            value={!!enabled}
            disabled={!installed}
            onChange={(v) => updateSettings.mutate({ "graphify.enabled": v })}
          />
        </SettingRow>

        {/* Auto-rebuild toggle */}
        <SettingRow
          label="Auto-rebuild"
          description="Rebuild the graph automatically when the codebase changes."
        >
          <SettingToggle
            value={!!autoRebuild}
            disabled={!enabled || !installed}
            onChange={(v) => updateSettings.mutate({ "graphify.autoRebuild": v })}
          />
        </SettingRow>
      </SettingsSection>

      {installed && (
        <SettingsSection
          title="Graph Status"
          description="Build and manage the knowledge graph for this project."
        >
          {/* Status badge */}
          <SettingRow label="Status" description={builtAgo ? `Last built ${builtAgo}` : undefined}>
            <StatusBadge $status={graphStatusLabel}>
              {isBuilding && (
                <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} />
              )}
              {!isBuilding && graphStatusLabel === "ok" && <CheckCircle2 size={11} />}
              {!isBuilding && graphStatusLabel === "stale" && <Network size={11} />}
              {graphStatusText}
            </StatusBadge>
          </SettingRow>

          {/* Actions */}
          <SettingRow label="Actions">
            <Flex gap="8px">
              <ActionBtn
                disabled={isBuilding}
                onClick={() => buildMutation.mutate()}
              >
                {isBuilding ? (
                  <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Network size={13} />
                )}
                {isBuilding ? "Building..." : graphStatus?.exists ? "Rebuild" : "Build Now"}
              </ActionBtn>

              {graphStatus?.exists && (
                <>
                  <ActionBtn
                    onClick={() => {
                      if (projectId) api.graphify.openVisualization(projectId);
                    }}
                  >
                    <ExternalLink size={13} />
                    Visualize
                  </ActionBtn>
                  <ActionBtn
                    $variant="danger"
                    disabled={isBuilding}
                    onClick={() => cleanMutation.mutate()}
                  >
                    <Trash2 size={13} />
                    Clean
                  </ActionBtn>
                </>
              )}
            </Flex>
          </SettingRow>

          {buildMutation.data && !buildMutation.data.success && (
            <Box
              css={{
                padding: `${spacing.sm} ${spacing.md}`,
                borderRadius: "8px",
                background: "var(--studio-error-subtle)",
                border: "1px solid var(--studio-error)",
                fontSize: "12px",
                color: "var(--studio-error)",
              }}
            >
              Build failed: {buildMutation.data.error ?? "Unknown error"}
            </Box>
          )}

          {buildMutation.data?.success && (
            <Box
              css={{
                padding: `${spacing.sm} ${spacing.md}`,
                borderRadius: "8px",
                background: "var(--studio-green-subtle)",
                border: "1px solid var(--studio-green-border)",
                fontSize: "12px",
                color: "var(--studio-green)",
              }}
            >
              Graph built in {(buildMutation.data.durationMs / 1000).toFixed(1)}s
            </Box>
          )}
        </SettingsSection>
      )}
    </Flex>
  );
}

function formatTimeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
