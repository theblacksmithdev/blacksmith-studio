import { useState } from "react";
import { Flex, HStack, VStack } from "@chakra-ui/react";
import {
  AlertCircle,
  CheckCircle2,
  Pencil,
  Play,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import {
  Alert,
  Button,
  ConfirmDialog,
  IconButton,
  Text,
} from "@/components/shared/ui";
import { RunnerConfigDrawer } from "@/components/shared/runner-config";
import type { RunnerConfigData } from "@/api/types";
import { useProjectRunnerSetup } from "../hooks";
import { rootCss, statusRowCss } from "./styles";
import {
  configCommandCss,
  configListCss,
  configRowCss,
} from "./runner-styles";

interface RunnerStepProps {
  projectId: string | null | undefined;
}

type DrawerState =
  | { mode: "closed" }
  | { mode: "new" }
  | { mode: "edit"; config: RunnerConfigData };

/**
 * Inline runner management — list + auto-detect + add + edit + remove.
 * Add/edit open the shared `RunnerConfigDrawer` (same editor the /run
 * page uses), spawned above the wizard overlay via an elevated
 * `zIndex`. Delete routes through `ConfirmDialog` so the user can't
 * wipe a config with a single misclick.
 */
export function RunnerStep({ projectId }: RunnerStepProps) {
  const runner = useProjectRunnerSetup();
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<RunnerConfigData | null>(
    null,
  );
  const [detectHint, setDetectHint] = useState<string | null>(null);

  const onDetect = async () => {
    setDetectHint(null);
    const detected = await runner.autoDetect();
    if (detected.length === 0) {
      setDetectHint(
        "Couldn't auto-detect a dev server — no package.json scripts or common entry files found. Add one manually below.",
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await runner.remove(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleSave = (data: Partial<RunnerConfigData>) => {
    if (drawer.mode === "edit") {
      runner.update(drawer.config.id, data);
    } else if (drawer.mode === "new") {
      runner.add(data);
    }
  };

  return (
    <VStack align="stretch" gap="16px" css={rootCss}>
      <Flex css={statusRowCss(runner.hasConfigs ? "ok" : "idle")}>
        {runner.hasConfigs ? (
          <CheckCircle2 size={18} style={{ color: "var(--studio-accent)" }} />
        ) : (
          <Play size={18} style={{ color: "var(--studio-text-muted)" }} />
        )}
        <VStack align="flex-start" gap="2px" flex="1" minW="0">
          <Text variant="body" css={{ fontWeight: 500 }}>
            {runner.hasConfigs
              ? `${runner.configs.length} runner${runner.configs.length === 1 ? "" : "s"} configured`
              : "No runner configured yet"}
          </Text>
          <Text variant="caption" color="muted">
            {runner.hasConfigs
              ? "You can add more below or continue to the next step."
              : "Auto-detect a dev server from package.json, or add a custom command."}
          </Text>
        </VStack>
      </Flex>

      {runner.hasConfigs && (
        <VStack align="stretch" css={configListCss} gap="0">
          {runner.configs.map((c) => (
            <Flex key={c.id} css={configRowCss}>
              <VStack align="flex-start" gap="2px" flex="1" minW="0">
                <Text variant="bodySmall" css={{ fontWeight: 500 }}>
                  {c.name}
                </Text>
                <Text as="code" css={configCommandCss} title={c.command}>
                  {c.command}
                </Text>
              </VStack>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={`Edit ${c.name}`}
                onClick={() => setDrawer({ mode: "edit", config: c })}
              >
                <Pencil />
              </IconButton>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={`Remove ${c.name}`}
                onClick={() => setDeleteTarget(c)}
              >
                <Trash2 />
              </IconButton>
            </Flex>
          ))}
        </VStack>
      )}

      <HStack gap="8px" wrap="wrap">
        <Button
          variant="secondary"
          size="md"
          onClick={onDetect}
          disabled={runner.detecting || !projectId}
        >
          <Wand2 size={13} />
          {runner.detecting ? "Detecting…" : "Auto-detect"}
        </Button>
        <Button
          variant={runner.hasConfigs ? "ghost" : "primary"}
          size="md"
          onClick={() => setDrawer({ mode: "new" })}
        >
          <Plus size={13} />
          Add manually
        </Button>
      </HStack>

      {detectHint && (
        <Alert variant="info" icon={<AlertCircle size={14} />}>
          {detectHint}
        </Alert>
      )}

      {drawer.mode !== "closed" && (
        <RunnerConfigDrawer
          config={drawer.mode === "edit" ? drawer.config : null}
          onSave={handleSave}
          onClose={() => setDrawer({ mode: "closed" })}
          zIndex={10000}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Remove "${deleteTarget.name}"?`}
          description="This removes the runner configuration from this project. You can always add it back later."
          confirmLabel="Remove"
          variant="danger"
          loading={runner.removing}
          zIndex={10001}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </VStack>
  );
}
