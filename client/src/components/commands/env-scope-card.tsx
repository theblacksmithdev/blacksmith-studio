import { useState } from "react";
import { Box, FolderOpen, Loader2, Plus } from "lucide-react";
import {
  useCommandAvailabilityQuery,
  useCreateProjectEnv,
  useResolvedEnvQuery,
} from "@/api/hooks/commands";
import type { CommandScope } from "@/api/types";
import {
  PillButton,
  ScopeCard,
  ScopeCardHeader,
  ScopeDisplayName,
  ScopeFieldLabel,
  ScopeFieldValue,
  ScopeFields,
  ScopeIconTile,
  ScopeLabel,
  ScopeNotDetected,
  ScopeVersion,
  StatusBadge,
} from "./styles";

interface EnvScopeCardProps {
  toolchainId: string;
  scope: CommandScope;
  /** When true, render a "Set up" button in the Not-detected state. */
  canCreate?: boolean;
}

const SCOPE_COPY: Record<
  CommandScope,
  { label: string; icon: typeof Box; hint: string }
> = {
  project: {
    label: "Project",
    icon: FolderOpen,
    hint: "Resolved from the user's project (.venv, .nvmrc, poetry, etc.)",
  },
  studio: {
    label: "Studio",
    icon: Box,
    hint: "Blacksmith-internal environment (~/.blacksmith-studio/…)",
  },
};

/**
 * One scope's worth of env info for a given toolchain — resolved
 * environment, bin path, optional wrapper invoker, availability +
 * version. Auto-hides as "Not detected" when the resolver couldn't
 * find a valid env for this scope.
 *
 * Composed twice (project + studio) by `EnvInspector` so the user can
 * compare the two at a glance without toggling a dropdown.
 */
export function EnvScopeCard({
  toolchainId,
  scope,
  canCreate = false,
}: EnvScopeCardProps) {
  const { data: env } = useResolvedEnvQuery(toolchainId, scope);
  const { data: availability } = useCommandAvailabilityQuery(
    toolchainId,
    scope,
  );
  const createEnv = useCreateProjectEnv();
  const [localError, setLocalError] = useState<string | null>(null);
  const copy = SCOPE_COPY[scope];
  const ScopeIcon = copy.icon;

  const handleSetup = async () => {
    setLocalError(null);
    try {
      const result = await createEnv.mutateAsync(toolchainId);
      if (result && "error" in result) {
        setLocalError(result.error.message);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  const showSetup =
    canCreate && scope === "project" && !env && !createEnv.isPending;

  return (
    <ScopeCard $tone={scope}>
      <ScopeCardHeader>
        <ScopeIconTile>
          <ScopeIcon size={14} />
        </ScopeIconTile>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ScopeLabel>{copy.label}</ScopeLabel>
          {env ? (
            <ScopeDisplayName>
              {env.displayName}
              {availability?.version && (
                <>
                  {" "}
                  <ScopeVersion>· {availability.version}</ScopeVersion>
                </>
              )}
            </ScopeDisplayName>
          ) : (
            <ScopeDisplayName style={{ color: "var(--studio-text-muted)" }}>
              Not detected
            </ScopeDisplayName>
          )}
        </div>
        {availability && (
          <StatusBadge $status={availability.ok ? "done" : "error"}>
            {availability.ok ? "ok" : "unavailable"}
          </StatusBadge>
        )}
      </ScopeCardHeader>

      {env ? (
        <ScopeFields>
          <ScopeFieldLabel>Bin</ScopeFieldLabel>
          <ScopeFieldValue>{env.bin || "—"}</ScopeFieldValue>
          {env.invoker && (
            <>
              <ScopeFieldLabel>Invoker</ScopeFieldLabel>
              <ScopeFieldValue>
                {env.invoker.command}
                {env.invoker.args.length > 0
                  ? ` ${env.invoker.args.join(" ")}`
                  : ""}
              </ScopeFieldValue>
            </>
          )}
          {availability?.error && (
            <>
              <ScopeFieldLabel>Error</ScopeFieldLabel>
              <ScopeFieldValue
                style={{ color: "var(--studio-error, #c24242)" }}
              >
                {availability.error}
              </ScopeFieldValue>
            </>
          )}
        </ScopeFields>
      ) : (
        <>
          <ScopeNotDetected>{copy.hint}</ScopeNotDetected>
          {showSetup && (
            <PillButton
              data-variant="primary"
              onClick={handleSetup}
              disabled={createEnv.isPending}
            >
              <Plus size={12} /> Set up {setupLabel(toolchainId)}
            </PillButton>
          )}
          {createEnv.isPending && (
            <PillButton disabled>
              <Loader2
                size={12}
                style={{
                  animation: "spin 1s linear infinite",
                }}
              />{" "}
              Creating environment…
            </PillButton>
          )}
          {localError && (
            <ScopeNotDetected
              style={{ color: "var(--studio-error, #c24242)" }}
            >
              {localError}
            </ScopeNotDetected>
          )}
        </>
      )}
    </ScopeCard>
  );
}

function setupLabel(toolchainId: string): string {
  if (toolchainId === "python") return ".venv";
  return "environment";
}
