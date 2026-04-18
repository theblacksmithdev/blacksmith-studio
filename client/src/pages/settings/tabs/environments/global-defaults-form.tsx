import { useState } from "react";
import styled from "@emotion/styled";
import {
  AlertTriangle,
  Code2,
  Loader2,
  Package,
  RotateCcw,
  Server,
  Terminal,
  Trash2,
} from "lucide-react";
import {
  useCreateProjectEnv,
  useDeleteProjectEnv,
  useResolvedEnvQuery,
} from "@/api/hooks/commands";
import { useGlobalSettings } from "@/hooks/use-global-settings";
import { useUpdateGlobalSettings } from "@/api/hooks/settings";
import { InterpreterPicker } from "@/components/commands/interpreter-picker";
import { ConfirmDialog } from "@/components/shared/ui";
import {
  HeroActionRow,
  HeroBadge,
  HeroHeader,
  HeroRoot,
  HeroStatusDot,
  HeroSubline,
  HeroTitle,
  HeroTitleRow,
  InfoNote,
  PillButton,
  SectionLabel,
} from "@/components/commands/styles";

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

/**
 * Global-scope environment controls.
 *
 * Two concerns:
 *   1. Default interpreter pins for Python + Node that every project
 *      inherits unless it sets its own override.
 *   2. The shared studio venv at `~/.blacksmith-studio/venv/` — used
 *      by Blacksmith's internal tooling (Graphify, pip ops). Lives
 *      here because it's truly user-scoped, not project-scoped.
 */
export function GlobalDefaultsForm() {
  return (
    <Stack>
      <GlobalInterpreterRow
        toolchainId="python"
        displayName="Python"
        icon={<Terminal size={14} />}
        settingKey="python.pythonPath"
      />
      <GlobalInterpreterRow
        toolchainId="node"
        displayName="Node.js"
        icon={<Server size={14} />}
        settingKey="runner.nodePath"
      />
      <StudioVenvRow />
    </Stack>
  );
}

interface GlobalInterpreterRowProps {
  toolchainId: string;
  displayName: string;
  icon: React.ReactNode;
  settingKey: string;
}

function GlobalInterpreterRow({
  toolchainId,
  displayName,
  icon,
  settingKey,
}: GlobalInterpreterRowProps) {
  const gs = useGlobalSettings();
  const update = useUpdateGlobalSettings();
  const pinned = (gs.get(settingKey) as string | null) ?? "";

  const handlePick = (path: string) => update.mutate({ [settingKey]: path });
  const handleClear = () => update.mutate({ [settingKey]: "" });

  return (
    <div>
      <SectionLabel>{displayName}</SectionLabel>
      <HeroRoot>
        <HeroHeader>
          <HeroTitleRow>
            <HeroTitle>{displayName} default</HeroTitle>
            {pinned ? (
              <HeroBadge $tone="ok">
                <HeroStatusDot $tone="ok" /> pinned
              </HeroBadge>
            ) : (
              <HeroBadge $tone="muted">
                <Code2 size={10} /> auto-detected
              </HeroBadge>
            )}
          </HeroTitleRow>
          <HeroSubline>
            {pinned
              ? pinned
              : `Projects without an override will use the system ${displayName}.`}
          </HeroSubline>
        </HeroHeader>
        <HeroActionRow>
          <InterpreterPicker
            toolchainId={toolchainId}
            currentPath={pinned || undefined}
            hasOverride={!!pinned}
            label={update.isPending ? "Saving…" : "Change default"}
            onSelect={handlePick}
            onClearOverride={handleClear}
          />
          {pinned && (
            <PillButton
              onClick={handleClear}
              disabled={update.isPending}
              title="Remove the global default"
            >
              <RotateCcw size={12} /> Clear pin
            </PillButton>
          )}
        </HeroActionRow>
        <InfoNote style={{ color: "var(--studio-text-muted)" }}>
          Stored as <code>{settingKey}</code>. Icon: {icon}
        </InfoNote>
      </HeroRoot>
    </div>
  );
}

function StudioVenvRow() {
  const { data: studioEnv } = useResolvedEnvQuery("python", "studio");
  const createEnv = useCreateProjectEnv();
  const deleteEnv = useDeleteProjectEnv();
  const [confirmReset, setConfirmReset] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleReset = async () => {
    setLocalError(null);
    try {
      const result = await deleteEnv.mutateAsync({
        toolchainId: "python",
        scope: "studio",
      });
      setConfirmReset(false);
      if (result && "error" in result) setLocalError(result.error.message);
    } catch (err) {
      setConfirmReset(false);
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCreate = async () => {
    setLocalError(null);
    try {
      const result = await createEnv.mutateAsync({
        toolchainId: "python",
        scope: "studio",
      });
      if (result && "error" in result) setLocalError(result.error.message);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div>
      <SectionLabel>Studio environment</SectionLabel>
      <HeroRoot>
        <HeroHeader>
          <HeroTitleRow>
            <HeroTitle>Blacksmith studio venv</HeroTitle>
            {studioEnv ? (
              <HeroBadge $tone="ok">
                <HeroStatusDot $tone="ok" /> ready
              </HeroBadge>
            ) : (
              <HeroBadge $tone="muted">
                <AlertTriangle size={10} /> not created
              </HeroBadge>
            )}
            <HeroBadge $tone="muted">
              <Package size={10} /> managed
            </HeroBadge>
          </HeroTitleRow>
          <HeroSubline>
            {studioEnv
              ? studioEnv.root
              : "Shared venv under ~/.blacksmith-studio/venv. Used by Graphify and Blacksmith's internal tooling."}
          </HeroSubline>
        </HeroHeader>
        <HeroActionRow>
          {studioEnv ? (
            <PillButton
              onClick={() => setConfirmReset(true)}
              disabled={deleteEnv.isPending}
            >
              {deleteEnv.isPending ? (
                <>
                  <Loader2
                    size={12}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Resetting…
                </>
              ) : (
                <>
                  <Trash2 size={12} /> Reset studio venv
                </>
              )}
            </PillButton>
          ) : (
            <PillButton
              data-variant="primary"
              onClick={handleCreate}
              disabled={createEnv.isPending}
            >
              {createEnv.isPending ? (
                <>
                  <Loader2
                    size={12}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Creating…
                </>
              ) : (
                <>
                  <Package size={12} /> Create studio venv
                </>
              )}
            </PillButton>
          )}
        </HeroActionRow>
        {localError && (
          <InfoNote style={{ color: "var(--studio-error, #c24242)" }}>
            {localError}
          </InfoNote>
        )}
      </HeroRoot>
      {confirmReset && (
        <ConfirmDialog
          message="Reset the studio environment?"
          description="The shared .blacksmith-studio/venv will be deleted. Graphify and any other installed tools will need to be re-bootstrapped on next use."
          confirmLabel="Reset"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
          loading={deleteEnv.isPending}
        />
      )}
    </div>
  );
}
