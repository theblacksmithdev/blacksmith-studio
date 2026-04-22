import { Flex, Box } from "@chakra-ui/react";
import { Layers, X, Clock, Maximize2, Zap, Wrench } from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { ROLE_ICONS } from "../shared/role-icons";
import { Text, Badge } from "@/components/shared/ui";
import type { BadgeVariant } from "@/components/shared/ui/badge/badge";
import { ModelPicker } from "@/components/shared/model-picker";
import { useAgentRoleModel } from "@/api/hooks/ai";
import type { AgentInfo } from "@/api/types";
import {
  Panel,
  Header,
  HeaderTop,
  IconBox,
  CloseBtn,
  OpenFullBtn,
  Body,
  Section,
  SectionLabel,
  AboutText,
  Timeline,
  TimelineItem,
  TimelineTrack,
  TimelineDot,
  TimelineLine,
  TimelineContent,
  TimelineText,
  TimelineTime,
  EmptyActivity,
} from "./styles";

interface AgentDetailProps {
  agent: AgentInfo;
  onClose: () => void;
  onOpenInnerView?: () => void;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function statusLabel(status: string): string {
  switch (status) {
    case "idle":
      return "Ready";
    case "thinking":
      return "Thinking";
    case "executing":
      return "Executing";
    case "done":
      return "Complete";
    case "error":
      return "Error";
    default:
      return "Idle";
  }
}

function statusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case "thinking":
    case "executing":
      return "live";
    case "done":
      return "default";
    case "error":
      return "error";
    default:
      return "muted";
  }
}

function isLiveStatus(status: string): boolean {
  return status === "thinking" || status === "executing";
}

export function AgentDetail({
  agent,
  onClose,
  onOpenInnerView,
}: AgentDetailProps) {
  const activity = useAgentStore((s) => s.activities.get(agent.role));
  const { model: roleModel, setModel: setRoleModel } = useAgentRoleModel(
    agent.role,
  );
  const Icon = ROLE_ICONS[agent.role] ?? Layers;
  const status = activity?.status ?? "idle";
  const isActive = status === "executing" || status === "thinking";
  const history = activity?.history ?? [];
  const eventLog = activity?.eventLog ?? [];
  const toolCalls = eventLog.filter((e) => e.type === "tool_use").length;

  const reversed = [...history].reverse();

  return (
    <Panel>
      <Header>
        <HeaderTop>
          <IconBox $active={isActive}>
            <Icon size={16} />
          </IconBox>
          <Box css={{ flex: 1, minWidth: 0 }}>
            <Text
              css={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--studio-text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              {agent.title}
            </Text>
            <Box css={{ marginTop: "10px" }}>
              <Badge
                variant={statusBadgeVariant(status)}
                size="md"
                dot
                pulse={isLiveStatus(status)}
              >
                {statusLabel(status)}
              </Badge>
            </Box>
          </Box>
          {onOpenInnerView && (
            <CloseBtn onClick={onOpenInnerView} title="Open full view">
              <Maximize2 size={13} />
            </CloseBtn>
          )}
          <CloseBtn onClick={onClose}>
            <X size={14} />
          </CloseBtn>
        </HeaderTop>
      </Header>

      <Body>
        {/* About */}
        <Section>
          <AboutText>{agent.description}</AboutText>
        </Section>

        {/* Model override */}
        <Section>
          <SectionLabel>Model</SectionLabel>
          <Flex align="center" gap="8px">
            <ModelPicker
              variant="dropdown"
              placement="down"
              value={roleModel ?? ""}
              onChange={(id) => setRoleModel(id)}
            />
            {roleModel && (
              <Text
                as="button"
                onClick={() => setRoleModel(null)}
                css={{
                  fontSize: "11px",
                  color: "var(--studio-text-muted)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  "&:hover": {
                    color: "var(--studio-text-primary)",
                    background: "var(--studio-bg-hover)",
                  },
                }}
              >
                Reset to default
              </Text>
            )}
          </Flex>
        </Section>

        {/* Quick stats */}
        {eventLog.length > 0 && (
          <Section>
            <Flex gap="8px">
              <Flex
                align="center"
                gap="5px"
                css={{
                  padding: "5px 10px",
                  borderRadius: "7px",
                  background: "var(--studio-bg-surface)",
                  border: "1px solid var(--studio-border)",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--studio-text-muted)",
                }}
              >
                <Zap size={10} /> {eventLog.length} events
              </Flex>
              {toolCalls > 0 && (
                <Flex
                  align="center"
                  gap="5px"
                  css={{
                    padding: "5px 10px",
                    borderRadius: "7px",
                    background: "var(--studio-bg-surface)",
                    border: "1px solid var(--studio-border)",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "var(--studio-text-muted)",
                  }}
                >
                  <Wrench size={10} /> {toolCalls} tools
                </Flex>
              )}
            </Flex>
          </Section>
        )}

        {/* Activity Timeline */}
        <Section>
          <SectionLabel>Activity</SectionLabel>
          {history.length === 0 ? (
            <EmptyActivity>
              <Clock size={14} />
              No activity yet
            </EmptyActivity>
          ) : (
            <Timeline>
              {reversed.map((entry, i) => (
                <TimelineItem
                  key={entry.id}
                  $status={entry.status}
                  $isLatest={i === 0}
                >
                  <TimelineTrack>
                    <TimelineDot $status={entry.status} />
                    {i < reversed.length - 1 && <TimelineLine />}
                  </TimelineTrack>
                  <TimelineContent>
                    <TimelineText $status={entry.status} $isLatest={i === 0}>
                      {entry.text}
                    </TimelineText>
                    <TimelineTime>{formatTime(entry.timestamp)}</TimelineTime>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </Section>

        {/* Open full view */}
        {onOpenInnerView && (
          <Section>
            <OpenFullBtn onClick={onOpenInnerView}>
              <Maximize2 size={12} />
              Open full session view
            </OpenFullBtn>
          </Section>
        )}
      </Body>
    </Panel>
  );
}
