import { Box, FolderOpen } from "lucide-react";
import {
  useCommandAvailabilityQuery,
  useResolvedEnvQuery,
} from "@/api/hooks/commands";
import type { CommandScope } from "@/api/types";
import {
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
export function EnvScopeCard({ toolchainId, scope }: EnvScopeCardProps) {
  const { data: env } = useResolvedEnvQuery(toolchainId, scope);
  const { data: availability } = useCommandAvailabilityQuery(
    toolchainId,
    scope,
  );
  const copy = SCOPE_COPY[scope];
  const ScopeIcon = copy.icon;

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
        <ScopeNotDetected>{copy.hint}</ScopeNotDetected>
      )}
    </ScopeCard>
  );
}
