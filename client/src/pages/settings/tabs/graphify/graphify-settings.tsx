import { useState } from "react";
import { Flex } from "@chakra-ui/react";
import { CheckCircle2 } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { SettingToggle } from "@/pages/settings/components/setting-toggle";
import { useGraphifySettings } from "./hooks/use-graphify-settings";
import { GraphifyEmptyState } from "./components/graphify-empty-state";
import { GraphifySetupFlow } from "./components/graphify-setup-flow";
import { GraphifyStatusSection } from "./components/graphify-status-section";

export function GraphifySettings() {
  const gs = useGraphifySettings();
  const [showConfirm, setShowConfirm] = useState(false);

  const showSetupFlow = gs.setup.isPending || gs.setup.result !== null;

  // ── Not installed: empty state or setup flow ──
  if (!gs.installed) {
    if (showSetupFlow) {
      return (
        <GraphifySetupFlow
          installing={gs.setup.isPending}
          logs={gs.setup.logs}
          result={gs.setup.result}
          onRetry={() => gs.setup.setup()}
        />
      );
    }

    return (
      <GraphifyEmptyState
        showConfirm={showConfirm}
        onRequestSetup={() => setShowConfirm(true)}
        onConfirm={() => {
          setShowConfirm(false);
          gs.setup.setup();
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
              Installed{gs.version ? ` (v${gs.version})` : ""}
            </Flex>
          }
        >
          <span />
        </SettingRow>

        <SettingRow
          label="Enable Graphify"
          description="Inject the knowledge graph into AI context for agents and chat."
        >
          <SettingToggle value={gs.enabled} onChange={gs.setEnabled} />
        </SettingRow>

        <SettingRow
          label="Auto-rebuild"
          description="Rebuild the graph automatically when the codebase changes."
        >
          <SettingToggle
            value={gs.autoRebuild}
            disabled={!gs.enabled}
            onChange={gs.setAutoRebuild}
          />
        </SettingRow>
      </SettingsSection>

      <GraphifyStatusSection
        graphStatus={gs.graphStatus}
        isBuilding={gs.isBuilding}
        buildResult={gs.buildResult}
        enabled={gs.enabled}
        onBuild={gs.build}
        onVisualize={gs.openVisualization}
        onClean={gs.clean}
      />
    </Flex>
  );
}
