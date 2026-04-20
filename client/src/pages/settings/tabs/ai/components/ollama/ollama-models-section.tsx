import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Download, Trash2, Check, Loader, X } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { Text, Badge } from "@/components/shared/ui";
import { api } from "@/api";
import {
  useOllamaModelsQuery,
  usePullModelMutation,
  useDeleteModelMutation,
} from "@/api/hooks/ollama";
import { useChannelEffect } from "@/api/hooks/_shared";
import type { OllamaPullProgress } from "@/api/types";
import { OLLAMA_CATALOG } from "./model-catalog";

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--studio-border);
  &:last-child {
    border-bottom: none;
  }
`;

const IconButton = styled.button<{ variant?: "danger" | "primary" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 12px;
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
      : p.variant === "danger"
        ? "var(--studio-red)"
        : "var(--studio-text-primary)"};

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }
`;

const MiniTrack = styled.div`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  overflow: hidden;
`;

const MiniFill = styled.div<{ fraction: number }>`
  width: ${(p) => Math.min(100, Math.max(0, p.fraction * 100))}%;
  height: 100%;
  background: var(--studio-text-primary);
  transition: width 0.15s linear;
`;

/**
 * Manages installed Ollama models + surfaces a curated catalog.
 *
 * Shown only when Ollama is the active provider AND it's installed —
 * callers guard on that. We handle pull/delete + live progress
 * streaming from `ollama:pullProgress`.
 */
export function OllamaModelsSection() {
  const { data: installed = [], isLoading } = useOllamaModelsQuery();
  const pullMutation = usePullModelMutation();
  const deleteMutation = useDeleteModelMutation();
  const [activePulls, setActivePulls] = useState<
    Record<string, OllamaPullProgress>
  >({});

  useChannelEffect("ollama:pullProgress", (p) => {
    setActivePulls((prev) => {
      if (p.done) {
        const { [p.modelName]: _done, ...rest } = prev;
        return rest;
      }
      return { ...prev, [p.modelName]: p };
    });
  });

  const installedNames = new Set(installed.map((m) => m.name));

  return (
    <>
      <SettingsSection
        title="Installed models"
        description="Models on disk. Used by the model picker when Ollama is active."
      >
        <Box>
          {isLoading ? (
            <Row>
              <Text
                css={{ fontSize: "13px", color: "var(--studio-text-muted)" }}
              >
                Loading…
              </Text>
            </Row>
          ) : installed.length === 0 ? (
            <Row>
              <Text
                css={{ fontSize: "13px", color: "var(--studio-text-muted)" }}
              >
                No models installed yet. Pick one from the catalog below.
              </Text>
            </Row>
          ) : (
            installed.map((m) => (
              <Row key={m.name}>
                <Box css={{ flex: 1, minWidth: 0 }}>
                  <Flex align="center" gap="8px">
                    <Text
                      css={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--studio-text-primary)",
                      }}
                    >
                      {m.name}
                    </Text>
                    {m.parameterSize && (
                      <Badge variant="default" size="sm">
                        {m.parameterSize}
                      </Badge>
                    )}
                  </Flex>
                  <Text
                    css={{
                      fontSize: "11px",
                      color: "var(--studio-text-muted)",
                      marginTop: "2px",
                    }}
                  >
                    {formatBytes(m.sizeBytes)}
                    {m.quantization ? ` • ${m.quantization}` : ""}
                  </Text>
                </Box>
                <IconButton
                  variant="danger"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(m.name)}
                >
                  <Trash2 size={12} />
                  Delete
                </IconButton>
              </Row>
            ))
          )}
        </Box>
      </SettingsSection>

      <SettingsSection
        title="Model catalog"
        description="Curated picks for coding work. Downloads land on the Ollama daemon — size varies by model."
      >
        <Box>
          {OLLAMA_CATALOG.map((entry) => {
            const isInstalled = installedNames.has(entry.name);
            const progress = activePulls[entry.name];
            const isPulling = !!progress;
            return (
              <Row key={entry.name}>
                <Box css={{ flex: 1, minWidth: 0 }}>
                  <Flex align="center" gap="8px">
                    <Text
                      css={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--studio-text-primary)",
                      }}
                    >
                      {entry.label}
                    </Text>
                    {isInstalled && (
                      <Badge variant="default" size="sm">
                        Installed
                      </Badge>
                    )}
                  </Flex>
                  <Text
                    css={{
                      fontSize: "12px",
                      color: "var(--studio-text-muted)",
                      marginTop: "3px",
                    }}
                  >
                    {entry.description}
                  </Text>
                  {isPulling && (
                    <Flex align="center" gap="8px" css={{ marginTop: "6px" }}>
                      <MiniTrack>
                        <MiniFill fraction={progress.fraction ?? 0.02} />
                      </MiniTrack>
                      <Text
                        css={{
                          fontSize: "11px",
                          color: "var(--studio-text-muted)",
                          minWidth: "140px",
                          textAlign: "right",
                        }}
                      >
                        {progress.status}
                        {progress.downloaded && progress.total
                          ? ` ${formatBytes(progress.downloaded)} / ${formatBytes(progress.total)}`
                          : ""}
                      </Text>
                    </Flex>
                  )}
                </Box>
                <Text
                  css={{
                    fontSize: "11px",
                    color: "var(--studio-text-muted)",
                    minWidth: "56px",
                    textAlign: "right",
                  }}
                >
                  ~{entry.approxSizeGb} GB
                </Text>
                {isInstalled ? (
                  <IconButton disabled>
                    <Check size={12} />
                    Installed
                  </IconButton>
                ) : isPulling ? (
                  <IconButton
                    variant="danger"
                    onClick={() => api.ollama.cancelPull(entry.name)}
                  >
                    <X size={12} />
                    Cancel
                  </IconButton>
                ) : (
                  <IconButton
                    variant="primary"
                    disabled={pullMutation.isPending}
                    onClick={() => pullMutation.mutate(entry.name)}
                  >
                    {pullMutation.isPending &&
                    pullMutation.variables === entry.name ? (
                      <Loader size={12} className="spin" />
                    ) : (
                      <Download size={12} />
                    )}
                    Install
                  </IconButton>
                )}
              </Row>
            );
          })}
        </Box>
      </SettingsSection>
    </>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
