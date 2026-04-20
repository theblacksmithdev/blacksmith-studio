import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader,
  Play,
  Square,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { Text, Badge } from "@/components/shared/ui";
import { api } from "@/api";
import { queryKeys } from "@/api/query-keys";
import {
  useOllamaStateQuery,
  useInstallOllamaMutation,
} from "@/api/hooks/ollama";
import { useChannelEffect } from "@/api/hooks/_shared";
import type { OllamaInstallProgress } from "@/api/types";

const ActionButton = styled.button<{ variant?: "primary" | "secondary" }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  border: 1px solid
    ${(p) =>
      p.variant === "primary"
        ? "var(--studio-accent)"
        : "var(--studio-border)"};
  background: ${(p) =>
    p.variant === "primary"
      ? "var(--studio-accent)"
      : "var(--studio-bg-surface)"};
  color: ${(p) =>
    p.variant === "primary"
      ? "var(--studio-bg-main)"
      : "var(--studio-text-primary)"};

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  overflow: hidden;
`;

const ProgressFill = styled.div<{ fraction: number }>`
  width: ${(p) => Math.min(100, Math.max(0, p.fraction * 100))}%;
  height: 100%;
  background: var(--studio-text-primary);
  transition: width 0.15s linear;
`;

/**
 * Shown only when the active provider is Ollama. Owns two responsibilities
 * the rest of the settings screen doesn't care about:
 *
 *   1. First-run install — triggers `ollama:install`, shows streaming
 *      download/extract progress, refreshes state when done.
 *   2. Daemon control — start/stop buttons + a status badge. A system
 *      Ollama.app counts as running too.
 */
export function OllamaStatusCard() {
  const { data: state } = useOllamaStateQuery();
  const installMutation = useInstallOllamaMutation();
  const [progress, setProgress] = useState<OllamaInstallProgress | null>(null);
  const qc = useQueryClient();

  useChannelEffect("ollama:installProgress", (p) => {
    setProgress(p);
    if (p.phase === "done") {
      qc.invalidateQueries({ queryKey: queryKeys.ollamaState });
    }
  });

  useChannelEffect("ollama:daemonStatus", () => {
    qc.invalidateQueries({ queryKey: queryKeys.ollamaState });
  });

  const installing = installMutation.isPending;
  const installed = !!state?.installed;
  const daemon = state?.daemon ?? "stopped";

  return (
    <SettingsSection
      title="Ollama"
      description={
        installed
          ? `Managed install at ${state?.binaryPath ?? ""}`
          : "Install Ollama to run open-source models locally. Roughly 150–300 MB."
      }
    >
      <Box css={{ padding: "18px 20px" }}>
        {!installed && !installing && (
          <Flex direction="column" gap="14px">
            <Text css={{ fontSize: "13px", color: "var(--studio-text-muted)" }}>
              Blacksmith downloads the Ollama binary into
              {" "}
              <code>~/.blacksmith-studio/ollama/</code>. No admin prompt, no
              system install.
            </Text>
            <ActionButton
              variant="primary"
              onClick={() => installMutation.mutate()}
            >
              <Download size={14} />
              Install Ollama
            </ActionButton>
          </Flex>
        )}

        {installing && (
          <Flex direction="column" gap="10px">
            <Flex align="center" gap="10px">
              <Loader size={14} className="spin" />
              <Text
                css={{ fontSize: "13px", color: "var(--studio-text-primary)" }}
              >
                {progress?.message ?? "Preparing install…"}
              </Text>
            </Flex>
            <ProgressTrack>
              <ProgressFill fraction={progress?.fraction ?? 0.05} />
            </ProgressTrack>
          </Flex>
        )}

        {installed && (
          <Flex direction="column" gap="14px">
            <DaemonRow status={daemon} endpoint={state?.endpoint ?? ""} />
            {installMutation.isError && (
              <Text
                css={{
                  fontSize: "12px",
                  color: "var(--studio-text-muted)",
                }}
              >
                {(installMutation.error as Error).message}
              </Text>
            )}
          </Flex>
        )}

        {installMutation.isError && !installing && !installed && (
          <Text
            css={{
              fontSize: "12px",
              color: "var(--studio-text-muted)",
              marginTop: "8px",
            }}
          >
            Install failed: {(installMutation.error as Error).message}
          </Text>
        )}
      </Box>
    </SettingsSection>
  );
}

/**
 * Inline daemon status + start/stop controls. Visible once Ollama is
 * installed (whether via our flow or a prior system install).
 */
function DaemonRow({
  status,
  endpoint,
}: {
  status: "stopped" | "starting" | "running" | "failed";
  endpoint: string;
}) {
  const starting = status === "starting";
  const running = status === "running";
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    try {
      await api.ollama.startDaemon();
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    setBusy(true);
    try {
      await api.ollama.stopDaemon();
    } finally {
      setBusy(false);
    }
  };

  const statusBadge = (() => {
    if (running) {
      return (
        <Flex align="center" gap="6px">
          <CheckCircle2 size={14} color="var(--studio-green)" />
          <Text
            css={{ fontSize: "12px", color: "var(--studio-text-secondary)" }}
          >
            Daemon running on {endpoint}
          </Text>
        </Flex>
      );
    }
    if (starting) {
      return (
        <Flex align="center" gap="6px">
          <Loader size={14} className="spin" />
          <Text css={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>
            Starting daemon…
          </Text>
        </Flex>
      );
    }
    if (status === "failed") {
      return (
        <Flex align="center" gap="6px">
          <AlertTriangle size={14} color="var(--studio-red)" />
          <Text css={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>
            Daemon failed — try starting again
          </Text>
        </Flex>
      );
    }
    return (
      <Flex align="center" gap="6px">
        <Badge variant="default" size="sm">
          Stopped
        </Badge>
        <Text css={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>
          Daemon not running
        </Text>
      </Flex>
    );
  })();

  return (
    <Flex justify="space-between" align="center" gap="12px" wrap="wrap">
      {statusBadge}
      <Flex gap="8px">
        {!running && (
          <ActionButton disabled={busy || starting} onClick={start}>
            <Play size={12} />
            Start
          </ActionButton>
        )}
        {running && (
          <ActionButton disabled={busy} onClick={stop}>
            <Square size={12} />
            Stop
          </ActionButton>
        )}
      </Flex>
    </Flex>
  );
}
