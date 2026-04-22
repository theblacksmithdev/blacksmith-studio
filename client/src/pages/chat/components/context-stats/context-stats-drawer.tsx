import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { Flex, Box } from "@chakra-ui/react";
import { Archive, MessageSquarePlus } from "lucide-react";
import { Drawer, Text, Button } from "@/components/shared/ui";
import { useSessionMeter } from "@/api/hooks/usage";
import { useCreateSession } from "@/api/hooks/sessions";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { useAiChat } from "@/hooks/use-ai-chat";
import { chatPath } from "@/router/paths";

interface ContextStatsDrawerProps {
  sessionId: string | null | undefined;
  isStreaming: boolean;
  onClose: () => void;
}

/**
 * Context-stats drawer for a single chat session.
 *
 * Combines the live meter, the last-turn token breakdown, and the
 * session actions (Compact / Clear) into one surface — invoked from
 * the chat header's stat button. Replaces the inline meter pill and
 * the separate Compact/Clear icon buttons.
 */
export function ContextStatsDrawer({
  sessionId,
  isStreaming,
  onClose,
}: ContextStatsDrawerProps) {
  const navigate = useNavigate();
  const projectId = useActiveProjectId();
  const { data: meter } = useSessionMeter("chat-session", sessionId);
  const { sendPrompt } = useAiChat();
  const createSession = useCreateSession();

  const handleCompact = useCallback(() => {
    if (!sessionId || isStreaming) return;
    sendPrompt("/compact", sessionId);
    onClose();
  }, [sessionId, isStreaming, sendPrompt, onClose]);

  const handleClear = useCallback(() => {
    if (!projectId) return;
    createSession.mutate(undefined, {
      onSuccess: (session) => {
        navigate(chatPath(projectId, session.id));
        onClose();
      },
    });
  }, [projectId, createSession, navigate, onClose]);

  const pct = meter && meter.window > 0 ? Math.min(meter.used / meter.window, 1) : 0;
  const sev = severity(pct);

  return (
    <Drawer
      title="Context stats"
      subtitle={meter?.label ?? undefined}
      onClose={onClose}
      placement="end"
      size="sm"
    >
      {!meter ? (
        <EmptyState>
          No context recorded for this session yet. Send a message to see stats.
        </EmptyState>
      ) : (
        <Flex direction="column" gap="22px">
          {/* Meter visualization */}
          <Section>
            <SectionHeader>
              <SectionTitle>Last-turn context</SectionTitle>
              <ModelLabel>{meter.model ?? "—"}</ModelLabel>
            </SectionHeader>
            <FigureRow>
              <BigFigure>{formatTokens(meter.used)}</BigFigure>
              <FigureSub>
                / {formatTokens(meter.window)} ·{" "}
                <Mono>{Math.round(pct * 100)}%</Mono>
              </FigureSub>
            </FigureRow>
            <Bar>
              <BarFill
                data-severity={sev}
                style={{ width: `${Math.round(pct * 100)}%` }}
              />
            </Bar>
          </Section>

          {/* Buckets */}
          <Section>
            <SectionHeader>
              <SectionTitle>Token mix</SectionTitle>
            </SectionHeader>
            <Buckets>
              <Bucket label="Input" value={meter.tokens.input} />
              <Bucket label="Output" value={meter.tokens.output} />
              <Bucket label="Cache read" value={meter.tokens.cacheRead} />
              <Bucket label="Cache create" value={meter.tokens.cacheCreation} />
            </Buckets>
          </Section>

          {/* Actions */}
          <Section>
            <SectionHeader>
              <SectionTitle>Actions</SectionTitle>
            </SectionHeader>
            <Flex direction="column" gap="8px">
              <Button
                variant="secondary"
                size="md"
                onClick={handleCompact}
                disabled={!sessionId || isStreaming}
                css={{ justifyContent: "flex-start", gap: "10px" }}
              >
                <Archive size={14} />
                <Box css={{ flex: 1, textAlign: "left" }}>
                  <Text css={{ fontWeight: 500, fontSize: "13px" }}>
                    Compact context
                  </Text>
                  <Text
                    variant="caption"
                    color="muted"
                    css={{ marginTop: "2px" }}
                  >
                    {isStreaming
                      ? "Finish the current turn first"
                      : "Summarises the current session via /compact"}
                  </Text>
                </Box>
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleClear}
                disabled={!projectId || createSession.isPending}
                css={{ justifyContent: "flex-start", gap: "10px" }}
              >
                <MessageSquarePlus size={14} />
                <Box css={{ flex: 1, textAlign: "left" }}>
                  <Text css={{ fontWeight: 500, fontSize: "13px" }}>
                    Start a new chat
                  </Text>
                  <Text
                    variant="caption"
                    color="muted"
                    css={{ marginTop: "2px" }}
                  >
                    Fresh context — prior session stays in history
                  </Text>
                </Box>
              </Button>
            </Flex>
          </Section>
        </Flex>
      )}
    </Drawer>
  );
}

function Bucket({ label, value }: { label: string; value: number }) {
  return (
    <BucketCard>
      <BucketLabel>{label}</BucketLabel>
      <BucketValue>{formatTokens(value)}</BucketValue>
    </BucketCard>
  );
}

function severity(pct: number): "ok" | "warn" | "alert" {
  if (pct >= 0.9) return "alert";
  if (pct >= 0.6) return "warn";
  return "ok";
}

function formatTokens(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `${n}`;
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
`;

const SectionTitle = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
`;

const ModelLabel = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  font-variant-numeric: tabular-nums;
`;

const FigureRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const BigFigure = styled.span`
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--studio-text-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1;
`;

const FigureSub = styled.span`
  font-size: 12px;
  color: var(--studio-text-muted);
`;

const Mono = styled.span`
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  font-variant-numeric: tabular-nums;
`;

const Bar = styled.div`
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--studio-bg-hover);
  overflow: hidden;
`;

const BarFill = styled.span`
  display: block;
  height: 100%;
  background: var(--studio-brand);
  transition: width 0.25s ease, background 0.15s ease;

  &[data-severity="warn"] {
    background: var(--studio-warning);
  }
  &[data-severity="alert"] {
    background: var(--studio-error);
  }
`;

const Buckets = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const BucketCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
`;

const BucketLabel = styled.span`
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
`;

const BucketValue = styled.span`
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--studio-text-primary);
`;

const EmptyState = styled.div`
  font-size: 13px;
  color: var(--studio-text-muted);
  padding: 8px 0;
`;
