import { useState, useCallback, useMemo, type ReactNode } from "react";
import {
  ArrowLeft,
  Brain,
  Wrench,
  CheckCircle,
  AlertCircle,
  Activity,
  Layers,
  ChevronDown,
  ChevronRight,
  Users,
  Zap,
  Bot,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Flex } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useAgentStore, type AgentLogEntry } from "@/stores/agent-store";
import { api } from "@/api";
import { ROLE_ICONS } from "../shared/role-icons";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import {
  ConversationView,
  type ConversationMessage,
} from "@/components/shared/conversation";
import { Text } from "@/components/shared/ui";
import type { AgentInfo, AgentRole } from "@/api/types";
import { AGENT_TEAMS } from "@/api/types";
import {
  Root,
  TopBar,
  BackBtn,
  TopBarDivider,
  AgentHeader,
  AgentIcon,
  AgentName,
  AgentStatusText,
  TopBarStats,
  StatPill,
  ContentArea,
  StreamColumn,
  StreamHeader,
  StreamTitle,
  LiveDot,
  MsgGroup,
  AgentRow,
  AgentAvatar,
  AgentBubble,
  SystemRow,
  SystemBubble,
  ToolRow,
  ToolIcon,
  ToolCard,
  ToolHeader,
  ToolName,
  ToolTime,
  ToolCodeWrap,
  ThinkingBubble,
  ThinkingLabel,
  CollapsibleContent,
  ToggleBtn,
  InfoPanel,
  InfoHero,
  HeroIconWrap,
  HeroTitle,
  HeroDesc,
  HeroBadge,
  HeroDot,
  InfoSection,
  InfoSectionLabel,
  InfoGrid,
  InfoMetric,
  MetricValue,
  MetricLabel,
  TeamCard,
  TeamHeader,
  TeamIconWrap,
  TeamTitle,
  TeamDesc,
  TeamMemberList,
  TeamMember,
  SelfTag,
  MemberStatusDot,
} from "./styles";

interface AgentInnerViewProps {
  agent: AgentInfo;
  onBack: () => void;
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
      return "Waiting for tasks";
    case "thinking":
      return "Thinking...";
    case "executing":
      return "Working...";
    case "done":
      return "Completed";
    case "error":
      return "Failed";
    default:
      return "";
  }
}

function statusBadgeText(status: string): string {
  switch (status) {
    case "idle":
      return "Idle";
    case "thinking":
      return "Thinking";
    case "executing":
      return "Active";
    case "done":
      return "Complete";
    case "error":
      return "Error";
    default:
      return "Idle";
  }
}

/* ── Entry renderer for agent log events ── */

function ChatEntryView({
  entry,
  agentRole,
}: {
  entry: AgentLogEntry;
  agentRole: AgentRole;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ROLE_ICONS[agentRole] ?? Bot;
  const content = entry.content ?? "";
  const isLong = content.length > 500;
  const displayContent =
    isLong && !expanded ? content.slice(0, 500) + "..." : content;

  if (entry.type === "thinking") {
    return (
      <MsgGroup>
        <AgentRow>
          <AgentAvatar>
            <Brain size={11} />
          </AgentAvatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ThinkingLabel>Thinking</ThinkingLabel>
            <ThinkingBubble>
              <MarkdownRenderer content={displayContent} />
            </ThinkingBubble>
            {isLong && (
              <ToggleBtn onClick={() => setExpanded(!expanded)}>
                {expanded ? (
                  <>
                    <ChevronDown size={10} /> Less
                  </>
                ) : (
                  <>
                    <ChevronRight size={10} /> More
                  </>
                )}
              </ToggleBtn>
            )}
          </div>
        </AgentRow>
      </MsgGroup>
    );
  }

  if (entry.type === "message") {
    return (
      <MsgGroup>
        <AgentRow>
          <AgentAvatar>
            <Icon size={11} />
          </AgentAvatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <AgentBubble>
              <MarkdownRenderer content={displayContent} />
            </AgentBubble>
            {isLong && (
              <ToggleBtn onClick={() => setExpanded(!expanded)}>
                {expanded ? (
                  <>
                    <ChevronDown size={10} /> Less
                  </>
                ) : (
                  <>
                    <ChevronRight size={10} /> More
                  </>
                )}
              </ToggleBtn>
            )}
          </div>
        </AgentRow>
      </MsgGroup>
    );
  }

  if (entry.type === "tool_use") {
    const inputJson = entry.toolInput
      ? JSON.stringify(entry.toolInput, null, 2)
      : "";
    return (
      <MsgGroup>
        <ToolRow>
          <ToolIcon>
            <Wrench size={10} />
          </ToolIcon>
          <ToolCard>
            <ToolHeader>
              <ToolName>{entry.toolName ?? "Tool"}</ToolName>
              <ToolTime>{formatTime(entry.timestamp)}</ToolTime>
            </ToolHeader>
            {inputJson && (
              <>
                <CollapsibleContent $open={expanded}>
                  <ToolCodeWrap>
                    <MarkdownRenderer
                      content={"```json\n" + inputJson + "\n```"}
                    />
                  </ToolCodeWrap>
                </CollapsibleContent>
                <ToggleBtn onClick={() => setExpanded(!expanded)}>
                  {expanded ? (
                    <>
                      <ChevronDown size={10} /> Hide input
                    </>
                  ) : (
                    <>
                      <ChevronRight size={10} /> Show input
                    </>
                  )}
                </ToggleBtn>
              </>
            )}
          </ToolCard>
        </ToolRow>
      </MsgGroup>
    );
  }

  if (entry.type === "tool_result") {
    const resultContent =
      content.length > 500 && !expanded
        ? content.slice(0, 500) + "\n..."
        : content;
    const looksLikeCode =
      content.includes("\n") &&
      (content.includes("  ") ||
        content.includes("{") ||
        content.includes("function"));
    return (
      <MsgGroup>
        <ToolRow>
          <ToolIcon $result>
            <CheckCircle size={10} />
          </ToolIcon>
          <ToolCard>
            <ToolCodeWrap>
              <MarkdownRenderer
                content={
                  looksLikeCode
                    ? "```\n" + resultContent + "\n```"
                    : resultContent
                }
              />
            </ToolCodeWrap>
            {content.length > 500 && (
              <ToggleBtn onClick={() => setExpanded(!expanded)}>
                {expanded ? (
                  <>
                    <ChevronDown size={10} /> Less
                  </>
                ) : (
                  <>
                    <ChevronRight size={10} /> Full output
                  </>
                )}
              </ToggleBtn>
            )}
          </ToolCard>
        </ToolRow>
      </MsgGroup>
    );
  }

  if (entry.type === "error") {
    return (
      <MsgGroup>
        <SystemRow>
          <SystemBubble $error>
            <AlertCircle size={9} />
            {content}
          </SystemBubble>
        </SystemRow>
      </MsgGroup>
    );
  }

  return (
    <MsgGroup>
      <SystemRow>
        <SystemBubble>
          {entry.type === "done" ? (
            <CheckCircle size={9} />
          ) : (
            <Activity size={9} />
          )}
          {content}
        </SystemBubble>
      </SystemRow>
    </MsgGroup>
  );
}

/* ── Main component ── */

export function AgentInnerView({ agent, onBack }: AgentInnerViewProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const activities = useAgentStore((s) => s.activities);
  const agents = useAgentStore((s) => s.agents);
  const activity = activities.get(agent.role);
  const Icon = ROLE_ICONS[agent.role] ?? Layers;
  const status = activity?.status ?? "idle";
  const isActive = status === "executing" || status === "thinking";
  const eventLog = activity?.eventLog ?? [];
  const history = activity?.history ?? [];

  const team = AGENT_TEAMS.find((t) => t.roles.includes(agent.role));
  const teammates =
    team?.roles.map((role) => {
      const info = agents.find((a) => a.role === role);
      const act = activities.get(role);
      return {
        role,
        title: info?.title ?? role,
        status: act?.status ?? "idle",
      };
    }) ?? [];

  const toolCalls = eventLog.filter((e) => e.type === "tool_use").length;
  const thinkingCount = eventLog.filter((e) => e.type === "thinking").length;

  // User messages sent from this view
  const [userMessages, setUserMessages] = useState<
    { id: string; content: string; timestamp: string }[]
  >([]);

  const handleSend = useCallback(
    (text: string) => {
      if (isActive) return;
      setUserMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: text,
          timestamp: new Date().toISOString(),
        },
      ]);
      api.multiAgents.execute(projectId!, { prompt: text, role: agent.role });
    },
    [isActive, agent.role],
  );

  // Merge user messages + event log into ConversationMessages
  const conversationMessages: ConversationMessage[] = useMemo(() => {
    const merged: ConversationMessage[] = [];
    let userIdx = 0;

    for (const entry of eventLog) {
      while (
        userIdx < userMessages.length &&
        userMessages[userIdx].timestamp <= entry.timestamp
      ) {
        merged.push({
          id: userMessages[userIdx].id,
          role: "user",
          content: userMessages[userIdx].content,
          timestamp: userMessages[userIdx].timestamp,
        });
        userIdx++;
      }
      merged.push({
        id: entry.id,
        role: entry.type,
        content: entry.content ?? "",
        timestamp: entry.timestamp,
      });
    }
    while (userIdx < userMessages.length) {
      merged.push({
        id: userMessages[userIdx].id,
        role: "user",
        content: userMessages[userIdx].content,
        timestamp: userMessages[userIdx].timestamp,
      });
      userIdx++;
    }
    return merged;
  }, [eventLog, userMessages]);

  // Custom renderer for all non-user entries
  const renderMessage = useCallback(
    (msg: ConversationMessage): ReactNode | null => {
      if (msg.role === "user") return null; // default bubble
      const entry = eventLog.find((e) => e.id === msg.id);
      if (!entry) return null;
      return <ChatEntryView entry={entry} agentRole={agent.role} />;
    },
    [eventLog, agent.role],
  );

  const emptyState = (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="10px"
      css={{ flex: 1, padding: "40px 20px", textAlign: "center" }}
    >
      <Flex
        css={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "var(--studio-bg-surface)",
          border: "1px solid var(--studio-border)",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--studio-text-muted)",
        }}
      >
        <Sparkles size={18} />
      </Flex>
      <Text
        css={{
          fontSize: "13px",
          color: "var(--studio-text-muted)",
          maxWidth: "220px",
          lineHeight: 1.5,
        }}
      >
        Send a message or wait for the pipeline to assign work.
      </Text>
    </Flex>
  );

  return (
    <Root>
      <TopBar>
        <BackBtn onClick={onBack}>
          <ArrowLeft size={13} />
          Canvas
        </BackBtn>
        <TopBarDivider />
        <AgentHeader>
          <AgentIcon $active={isActive}>
            <Icon size={14} />
          </AgentIcon>
          <div>
            <AgentName>{agent.title}</AgentName>
            <AgentStatusText $status={status}>
              {statusLabel(status)}
            </AgentStatusText>
          </div>
        </AgentHeader>
        <TopBarStats>
          <StatPill>
            <Zap size={10} />
            <span>{eventLog.length}</span> events
          </StatPill>
          <StatPill>
            <Wrench size={10} />
            <span>{toolCalls}</span> tools
          </StatPill>
        </TopBarStats>
      </TopBar>

      <ContentArea>
        <StreamColumn>
          <StreamHeader>
            <LiveDot $active={isActive} />
            <StreamTitle>{isActive ? "Live" : "Session"}</StreamTitle>
          </StreamHeader>

          <ConversationView
            messages={conversationMessages}
            onSend={handleSend}
            disabled={isActive}
            placeholder={
              isActive
                ? `${agent.title} is working...`
                : `Message ${agent.title}...`
            }
            maxWidth="720px"
            renderMessage={renderMessage}
            emptyState={emptyState}
            streamingTrailing={
              isActive ? (
                <Flex
                  align="center"
                  gap="6px"
                  justify="center"
                  css={{ padding: "8px", color: "var(--studio-text-muted)" }}
                >
                  <Loader2
                    size={12}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <Text css={{ fontSize: "12px" }}>Working...</Text>
                </Flex>
              ) : undefined
            }
          />
        </StreamColumn>

        <InfoPanel>
          <InfoHero>
            <HeroIconWrap $active={isActive}>
              <Icon size={20} />
            </HeroIconWrap>
            <HeroTitle>{agent.title}</HeroTitle>
            <HeroDesc>{agent.description}</HeroDesc>
            <HeroBadge $status={status}>
              <HeroDot $status={status} />
              {statusBadgeText(status)}
            </HeroBadge>
          </InfoHero>

          <InfoSection>
            <InfoSectionLabel>Metrics</InfoSectionLabel>
            <InfoGrid>
              <InfoMetric>
                <MetricValue>{eventLog.length}</MetricValue>
                <MetricLabel>Events</MetricLabel>
              </InfoMetric>
              <InfoMetric>
                <MetricValue>{toolCalls}</MetricValue>
                <MetricLabel>Tool calls</MetricLabel>
              </InfoMetric>
              <InfoMetric>
                <MetricValue>{thinkingCount}</MetricValue>
                <MetricLabel>Thoughts</MetricLabel>
              </InfoMetric>
              <InfoMetric>
                <MetricValue>{history.length}</MetricValue>
                <MetricLabel>Activities</MetricLabel>
              </InfoMetric>
            </InfoGrid>
          </InfoSection>

          {team && (
            <InfoSection>
              <InfoSectionLabel>Department</InfoSectionLabel>
              <TeamCard>
                <TeamHeader>
                  <TeamIconWrap>
                    <Users size={11} />
                  </TeamIconWrap>
                  <TeamTitle>{team.title}</TeamTitle>
                </TeamHeader>
                <TeamDesc>{team.description}</TeamDesc>
                <TeamMemberList>
                  {teammates.map((m) => {
                    const MemberIcon =
                      ROLE_ICONS[m.role as AgentRole] ?? Layers;
                    const isSelf = m.role === agent.role;
                    return (
                      <TeamMember key={m.role} $isSelf={isSelf}>
                        <MemberIcon size={11} />
                        {m.title}
                        {isSelf && <SelfTag>you</SelfTag>}
                        <MemberStatusDot $status={m.status} />
                      </TeamMember>
                    );
                  })}
                </TeamMemberList>
              </TeamCard>
            </InfoSection>
          )}
        </InfoPanel>
      </ContentArea>
    </Root>
  );
}
