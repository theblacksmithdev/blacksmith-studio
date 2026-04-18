import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Loader2, ArrowRight, Zap } from "lucide-react";
import { Text, spacing, radii } from "@/components/shared/ui";
import { SettingToggle } from "@/pages/settings/components/setting-toggle";
import { useGraphifyStatus, useGraphifyBuild } from "@/api/hooks/graphify";
import { useSettingsQuery, useUpdateSettings } from "@/api/hooks/settings";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { getGraphStatus, type GraphStatusLabel } from "@/lib/graphify";
import { formatTimeAgo } from "@/lib/format";
import { settingsGraphifyPath } from "@/router/paths";

const Dot = styled.span<{ $status: GraphStatusLabel }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  ${(p) => {
    switch (p.$status) {
      case "ok":
        return `background: var(--studio-green); box-shadow: 0 0 4px var(--studio-green-border);`;
      case "stale":
        return `background: var(--studio-warning, #eab308);`;
      case "building":
        return `background: #3b82f6;`;
      default:
        return `background: var(--studio-text-muted); opacity: 0.5;`;
    }
  }}
`;

const Popover = styled.div`
  position: fixed;
  width: 240px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border-hover);
  border-radius: ${radii.lg};
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  z-index: 100;
  overflow: hidden;
  animation: fadeIn 0.1s ease;
`;

const PopoverRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--studio-border);
  &:last-child {
    border-bottom: none;
  }
`;

const RebuildBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-secondary);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const SettingsLink = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 8px 14px;
  border: none;
  background: var(--studio-bg-inset);
  color: var(--studio-text-muted);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  &:hover {
    color: var(--studio-text-secondary);
  }
`;

export function GraphifyChip() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const projectId = useActiveProjectId();

  const { data: graphStatus } = useGraphifyStatus();
  const { data: settings } = useSettingsQuery();
  const updateSettings = useUpdateSettings();
  const buildMutation = useGraphifyBuild();

  const enabled = !!settings?.["graphify.enabled"];
  const isBuilding = buildMutation.isPending || !!graphStatus?.building;
  const { label } = getGraphStatus(graphStatus, isBuilding);

  // Hide chip if no graph exists and not building
  if (!graphStatus?.exists && !isBuilding) return null;

  const builtAgo = graphStatus?.builtAt
    ? formatTimeAgo(graphStatus.builtAt)
    : null;

  const statusText = (() => {
    if (isBuilding) return "Building...";
    if (!enabled) return "Context disabled";
    if (graphStatus?.stale) return "Graph is stale";
    return "Context active";
  })();

  const statusColor = (() => {
    if (isBuilding) return "#3b82f6";
    if (!enabled) return "var(--studio-text-muted)";
    if (graphStatus?.stale) return "var(--studio-warning, #eab308)";
    return "var(--studio-green)";
  })();

  return (
    <Box css={{ position: "relative" }}>
      <Flex
        as="button"
        ref={triggerRef}
        align="center"
        gap={spacing.xs}
        onClick={() => setOpen(!open)}
        css={{
          padding: `${spacing.xs} ${spacing.sm}`,
          borderRadius: radii.md,
          border: "none",
          background: "transparent",
          color: "var(--studio-text-muted)",
          fontSize: "12px",
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.12s ease",
          "&:hover": {
            background: "var(--studio-bg-hover)",
            color: "var(--studio-text-secondary)",
          },
        }}
      >
        {isBuilding ? (
          <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <Dot $status={enabled ? label : "missing"} />
        )}
        Graph
      </Flex>

      {open &&
        createPortal(
          <>
            <Box
              onClick={() => setOpen(false)}
              css={{ position: "fixed", inset: 0, zIndex: 99 }}
            />
            <Popover
              style={{
                bottom: triggerRef.current
                  ? window.innerHeight -
                    triggerRef.current.getBoundingClientRect().top +
                    6
                  : 0,
                left: triggerRef.current?.getBoundingClientRect().left ?? 0,
              }}
            >
              {/* Status */}
              <PopoverRow>
                <Flex direction="column" gap="2px">
                  <Text
                    css={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: statusColor,
                    }}
                  >
                    {statusText}
                  </Text>
                  {builtAgo && (
                    <Text
                      css={{
                        fontSize: "11px",
                        color: "var(--studio-text-muted)",
                      }}
                    >
                      Built {builtAgo}
                    </Text>
                  )}
                </Flex>
              </PopoverRow>

              {/* Enable toggle */}
              {!isBuilding && (
                <PopoverRow>
                  <Text
                    css={{
                      fontSize: "12px",
                      color: "var(--studio-text-secondary)",
                    }}
                  >
                    Inject into context
                  </Text>
                  <SettingToggle
                    value={enabled}
                    onChange={(v) => {
                      updateSettings.mutate({ "graphify.enabled": v });
                    }}
                  />
                </PopoverRow>
              )}

              {/* Rebuild action */}
              {graphStatus?.stale && !isBuilding && (
                <PopoverRow>
                  <Text
                    css={{
                      fontSize: "11px",
                      color: "var(--studio-text-muted)",
                    }}
                  >
                    Graph is outdated
                  </Text>
                  <RebuildBtn
                    disabled={isBuilding}
                    onClick={() => {
                      buildMutation.mutate();
                      setOpen(false);
                    }}
                  >
                    <Zap size={10} />
                    Rebuild
                  </RebuildBtn>
                </PopoverRow>
              )}

              {/* Settings link */}
              <SettingsLink
                onClick={() => {
                  setOpen(false);
                  if (projectId) navigate(settingsGraphifyPath(projectId));
                }}
              >
                Knowledge Graph Settings
                <ArrowRight size={10} />
              </SettingsLink>
            </Popover>
          </>,
          document.body,
        )}
    </Box>
  );
}
