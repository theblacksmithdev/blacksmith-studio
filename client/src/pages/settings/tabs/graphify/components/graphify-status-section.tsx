import { Flex } from "@chakra-ui/react";
import {
  Network,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import type { GraphifyBuildResult, GraphifyStatus } from "@/api/modules/graphify";
import {
  ActionBtn,
  StatusBadge,
  ResultBanner,
  formatTimeAgo,
  type GraphStatusLabel,
} from "./styles";

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
  const statusLabel: GraphStatusLabel = (() => {
    if (isBuilding) return "building";
    if (!graphStatus?.exists) return "missing";
    if (graphStatus.stale) return "stale";
    return "ok";
  })();

  const statusText = (() => {
    if (isBuilding) return "Building...";
    if (!graphStatus?.exists) return "No graph built";
    if (graphStatus.stale) return "Graph is stale";
    return "Up to date";
  })();

  const builtAgo = graphStatus?.builtAt
    ? formatTimeAgo(graphStatus.builtAt)
    : null;

  return (
    <SettingsSection
      title="Graph Status"
      description="Build and manage the knowledge graph for this project."
    >
      {/* Status badge */}
      <SettingRow
        label="Status"
        description={builtAgo ? `Last built ${builtAgo}` : undefined}
      >
        <StatusBadge $status={statusLabel}>
          {isBuilding && (
            <Loader2
              size={11}
              style={{ animation: "spin 1s linear infinite" }}
            />
          )}
          {!isBuilding && statusLabel === "ok" && <CheckCircle2 size={11} />}
          {!isBuilding && statusLabel === "stale" && <Network size={11} />}
          {statusText}
        </StatusBadge>
      </SettingRow>

      {/* Actions */}
      <SettingRow label="Actions">
        <Flex gap="8px" flexWrap="wrap">
          <ActionBtn disabled={isBuilding} onClick={onBuild}>
            {isBuilding ? (
              <Loader2
                size={13}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Network size={13} />
            )}
            {isBuilding
              ? "Building..."
              : graphStatus?.exists
                ? "Rebuild"
                : "Build Now"}
          </ActionBtn>

          {graphStatus?.exists && (
            <>
              <ActionBtn onClick={onVisualize}>
                <ExternalLink size={13} />
                Visualize
              </ActionBtn>
              <ActionBtn
                $variant="danger"
                disabled={isBuilding}
                onClick={onClean}
              >
                <Trash2 size={13} />
                Clean
              </ActionBtn>
            </>
          )}
        </Flex>
      </SettingRow>

      {buildResult && !buildResult.success && (
        <ResultBanner $success={false}>
          Build failed: {buildResult.error ?? "Unknown error"}
        </ResultBanner>
      )}

      {buildResult?.success && (
        <ResultBanner $success>
          Graph built in {(buildResult.durationMs / 1000).toFixed(1)}s
        </ResultBanner>
      )}
    </SettingsSection>
  );
}
