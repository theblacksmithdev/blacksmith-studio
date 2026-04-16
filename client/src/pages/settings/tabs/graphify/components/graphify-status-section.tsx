import { useState } from "react";
import { Flex, Box } from "@chakra-ui/react";
import {
  CheckCircle2,
  Loader2,
  ExternalLink,
  Trash2,
  AlertCircle,
  Clock,
  Zap,
  BrainCircuit,
  CircleOff,
} from "lucide-react";
import { Text, Drawer, IFrame } from "@/components/shared/ui";
import type {
  GraphifyBuildResult,
  GraphifyStatus,
} from "@/api/modules/graphify";
import {
  StatusCard,
  StatusHeader,
  StatusDot,
  StatusBody,
  ContextBar,
  ResultBar,
  MetaChip,
  CompactBtn,
  spin,
  formatTimeAgo,
  getGraphStatus,
} from "./styles";

interface GraphifyStatusSectionProps {
  graphStatus: GraphifyStatus | undefined;
  isBuilding: boolean;
  buildResult: GraphifyBuildResult | undefined;
  enabled: boolean;
  onBuild: () => void;
  onVisualize: () => Promise<string | null>;
  onClean: () => void;
}

export function GraphifyStatusSection({
  graphStatus,
  isBuilding,
  buildResult,
  enabled,
  onBuild,
  onVisualize,
  onClean,
}: GraphifyStatusSectionProps) {
  const [vizHtml, setVizHtml] = useState<string | null>(null);
  const { label, text } = getGraphStatus(graphStatus, isBuilding);
  const builtAgo = graphStatus?.builtAt
    ? formatTimeAgo(graphStatus.builtAt)
    : null;

  return (
    <>
      <Box>
        <Box css={{ marginBottom: "14px" }}>
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

        <StatusCard>
          {/* Header */}
          <StatusHeader>
            <StatusDot $status={label} />
            <Text
              css={{
                flex: 1,
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--studio-text-primary)",
              }}
            >
              {text}
            </Text>
            {builtAgo && (
              <MetaChip>
                <Clock size={10} />
                {builtAgo}
              </MetaChip>
            )}
          </StatusHeader>

          {/* Context indicator */}
          {graphStatus?.exists && (
            <ContextBar $active={enabled}>
              {enabled ? (
                <>
                  <BrainCircuit size={13} />
                  Context active — agents and chat receive the knowledge graph
                </>
              ) : (
                <>
                  <CircleOff size={13} />
                  Context disabled — enable Graphify above to inject into AI
                  context
                </>
              )}
            </ContextBar>
          )}

          {/* Actions */}
          <StatusBody>
            <Flex gap="6px" flexWrap="wrap">
              <CompactBtn
                $primary={!graphStatus?.exists && !isBuilding}
                disabled={isBuilding}
                onClick={onBuild}
              >
                {isBuilding ? (
                  <Loader2
                    size={12}
                    style={{ animation: `${spin} 1s linear infinite` }}
                  />
                ) : (
                  <Zap size={12} />
                )}
                {isBuilding
                  ? "Building..."
                  : graphStatus?.exists
                    ? "Rebuild"
                    : "Build Now"}
              </CompactBtn>

              {graphStatus?.exists && (
                <>
                  {graphStatus.hasVisualization && (
                    <CompactBtn
                      onClick={async () => {
                        const html = await onVisualize();
                        if (html) setVizHtml(html);
                      }}
                    >
                      <ExternalLink size={12} />
                      Visualize
                    </CompactBtn>
                  )}
                  <CompactBtn $danger disabled={isBuilding} onClick={onClean}>
                    <Trash2 size={12} />
                    Clean
                  </CompactBtn>
                </>
              )}
            </Flex>
          </StatusBody>

          {/* Build result */}
          {buildResult && !buildResult.success && (
            <ResultBar $success={false}>
              <AlertCircle size={13} />
              Build failed: {buildResult.error ?? "Unknown error"}
            </ResultBar>
          )}
          {buildResult?.success && (
            <ResultBar $success>
              <CheckCircle2 size={13} />
              Graph built in {(buildResult.durationMs / 1000).toFixed(1)}s
            </ResultBar>
          )}
        </StatusCard>
      </Box>

      {/* Visualization drawer */}
      {vizHtml && (
        <Drawer
          title="Knowledge Graph"
          subtitle="Interactive visualization of your codebase structure"
          onClose={() => setVizHtml(null)}
          size="full"
          noPadding
        >
          <IFrame srcDoc={vizHtml} title="Knowledge Graph Visualization" />
        </Drawer>
      )}
    </>
  );
}
