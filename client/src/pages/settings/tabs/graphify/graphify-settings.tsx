import { useState, useCallback, useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import { CheckCircle2 } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { SettingToggle } from "@/pages/settings/components/setting-toggle";
import {
  useGraphifyCheck,
  useGraphifyStatus,
  useGraphifyBuild,
  useGraphifyClean,
} from "@/api/hooks/graphify";
import { useSettingsQuery, useUpdateSettings } from "@/api/hooks/settings";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { api } from "@/api";
import { GraphifyEmptyState } from "./components/graphify-empty-state";
import { GraphifySetupFlow } from "./components/graphify-setup-flow";
import { GraphifyStatusSection } from "./components/graphify-status-section";

export function GraphifySettings() {
  const projectId = useActiveProjectId();
  const { data: installStatus, refetch: recheckInstall } = useGraphifyCheck();
  const { data: graphStatus } = useGraphifyStatus();
  const { data: settings } = useSettingsQuery();
  const updateSettings = useUpdateSettings();
  const buildMutation = useGraphifyBuild();
  const cleanMutation = useGraphifyClean();

  const [showConfirm, setShowConfirm] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [installResult, setInstallResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  const installed = installStatus?.installed ?? false;
  const enabled = settings?.["graphify.enabled"] ?? false;
  const autoRebuild = settings?.["graphify.autoRebuild"] ?? true;
  const isBuilding = buildMutation.isPending || graphStatus?.building;

  // Listen for setup progress
  useEffect(() => {
    if (!installing) return;
    const unsub = api.graphify.onBuildProgress((data) => {
      setInstallLogs((prev) => [...prev, data.line]);
    });
    return unsub;
  }, [installing]);

  const runSetup = useCallback(async () => {
    setInstalling(true);
    setInstallLogs([]);
    setInstallResult(null);

    try {
      const result = await api.graphify.setup();
      setInstallResult(result);
      if (result.success) {
        await recheckInstall();
      }
    } catch (err: any) {
      setInstallResult({ success: false, error: err.message });
    } finally {
      setInstalling(false);
    }
  }, [recheckInstall]);

  const showSetupFlow = installing || installResult !== null;

  // ── Not installed: empty state → confirm → auto-install ──
  if (!installed) {
    if (showSetupFlow) {
      return (
        <GraphifySetupFlow
          installing={installing}
          logs={installLogs}
          result={installResult}
          onRetry={runSetup}
        />
      );
    }

    return (
      <GraphifyEmptyState
        showConfirm={showConfirm}
        onRequestSetup={() => setShowConfirm(true)}
        onConfirm={() => {
          setShowConfirm(false);
          runSetup();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    );
  }

  // ── Installed: settings + status ──
  return (
    <Flex direction="column" gap="28px">
      <SettingsSection
        title="Knowledge Graph"
        description="Graphify builds a knowledge graph from your codebase, giving AI agents deep structural understanding with dramatically fewer tokens."
      >
        <SettingRow
          label="Graphify CLI"
          description={
            <Flex align="center" gap="4px">
              <CheckCircle2 size={11} color="var(--studio-green)" />
              Installed
              {installStatus?.version ? ` (v${installStatus.version})` : ""}
            </Flex>
          }
        >
          <span />
        </SettingRow>

        <SettingRow
          label="Enable Graphify"
          description="Inject the knowledge graph into AI context for agents and chat."
        >
          <SettingToggle
            value={!!enabled}
            onChange={(v) => updateSettings.mutate({ "graphify.enabled": v })}
          />
        </SettingRow>

        <SettingRow
          label="Auto-rebuild"
          description="Rebuild the graph automatically when the codebase changes."
        >
          <SettingToggle
            value={!!autoRebuild}
            disabled={!enabled}
            onChange={(v) =>
              updateSettings.mutate({ "graphify.autoRebuild": v })
            }
          />
        </SettingRow>
      </SettingsSection>

      <GraphifyStatusSection
        graphStatus={graphStatus}
        isBuilding={!!isBuilding}
        buildResult={buildMutation.data}
        onBuild={() => buildMutation.mutate()}
        onVisualize={() => {
          if (projectId) api.graphify.openVisualization(projectId);
        }}
        onClean={() => cleanMutation.mutate()}
      />
    </Flex>
  );
}
