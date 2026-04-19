import { useState, type ReactNode } from "react";
import {
  User,
  Sparkles,
  Wrench,
  FileOutput,
  Brain,
  GitBranch,
  ListTree,
  CircleDot,
  CheckCircle2,
  XCircle,
  Circle,
  Activity,
  Terminal,
  AlertCircle,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type { ConversationEvent } from "@/api/types";
import { Tooltip } from "@/components/shared/ui";
import { CodeBlock } from "@/components/shared/code-block";
import { formatTimeAgo } from "@/lib/format";
import {
  BodyMeta,
  BodyText,
  CardHeader,
  Chevron,
  EventCard,
  EventItem,
  ExpandBody,
  IconNode,
  Timestamp,
  TitleText,
  TypeLabel,
} from "./styles";

type Tone = "neutral" | "accent" | "error";

interface CodeContent {
  content: string;
  language?: string;
}

interface RowShape {
  icon: LucideIcon;
  tone: Tone;
  label: string;
  title?: string;
  body?: ReactNode;
  meta?: ReactNode;
  code?: CodeContent;
}

const ICON_SIZE = 12;

/**
 * Renders a single conversation event on the timeline rail. Collapsed
 * by default — each event is one compact row (icon · label · title ·
 * time · chevron). Clicking expands to reveal the full body, meta, and
 * syntax-highlighted code block.
 */
export function EventRow({ event }: { event: ConversationEvent }) {
  const [expanded, setExpanded] = useState(false);
  const exact = new Date(event.timestamp).toLocaleString();
  const relative = formatTimeAgo(event.timestamp);
  const shape = buildShape(event);
  const expandable = !!(shape.body || shape.meta || shape.code);

  return (
    <EventItem>
      <IconNode className="event-icon" tone={shape.tone}>
        <shape.icon size={ICON_SIZE} />
      </IconNode>
      <EventCard
        className="event-card"
        data-tone={shape.tone}
        tone={shape.tone}
        type="button"
        onClick={() => expandable && setExpanded((v) => !v)}
        aria-expanded={expandable ? expanded : undefined}
        style={{ cursor: expandable ? "pointer" : "default" }}
      >
        <CardHeader>
          <TypeLabel>{shape.label}</TypeLabel>
          <TitleText>{shape.title || ""}</TitleText>
          <Tooltip content={exact} placement="top">
            <Timestamp>{relative}</Timestamp>
          </Tooltip>
          {expandable && (
            <Chevron
              className="event-chevron"
              data-expanded={expanded ? "true" : "false"}
            >
              <ChevronRight size={12} />
            </Chevron>
          )}
        </CardHeader>
        {expandable && expanded && (
          <ExpandBody onClick={(e) => e.stopPropagation()}>
            {shape.body && <BodyText>{shape.body}</BodyText>}
            {shape.meta && <BodyMeta>{shape.meta}</BodyMeta>}
            {shape.code && (
              <CodeBlock
                code={shape.code.content}
                language={shape.code.language ?? "json"}
                showHeader={false}
                maxHeight={280}
              />
            )}
          </ExpandBody>
        )}
      </EventCard>
    </EventItem>
  );
}

function buildShape(event: ConversationEvent): RowShape {
  const payload = event.payload as Record<string, unknown> | null;
  const role = event.agentRole;

  switch (event.eventType) {
    case "user_message": {
      const content = str(payload?.content) || "(empty)";
      return {
        icon: User,
        tone: "accent",
        label: "You",
        title: firstLine(content),
        body: content.length > firstLine(content).length ? content : undefined,
      };
    }

    case "assistant_message": {
      const content = str(payload?.content) || "(empty)";
      const cost = payload?.costUsd;
      const duration = payload?.durationMs;
      const metaParts: string[] = [];
      if (cost != null) metaParts.push(`$${Number(cost).toFixed(4)}`);
      if (duration != null) metaParts.push(`${Number(duration)}ms`);
      return {
        icon: Sparkles,
        tone: "neutral",
        label: role ?? "Assistant",
        title: firstLine(content),
        body: content.length > firstLine(content).length ? content : undefined,
        meta: metaParts.length > 0 ? metaParts.join(" · ") : undefined,
      };
    }

    case "tool_use": {
      const toolName = str(payload?.toolName) || "tool";
      const input = payload?.input;
      return {
        icon: Wrench,
        tone: "neutral",
        label: "Tool",
        title: toolName,
        code:
          input != null
            ? { content: JSON.stringify(input, null, 2), language: "json" }
            : undefined,
      };
    }

    case "tool_result": {
      const raw = payload?.output;
      const isString = typeof raw === "string";
      const content = isString
        ? (raw as string)
        : JSON.stringify(raw ?? null, null, 2);
      return {
        icon: FileOutput,
        tone: "neutral",
        label: "Result",
        title: isString ? firstLine(content) : "Tool result",
        code: { content, language: inferLang(content, isString) },
      };
    }

    case "thinking_block": {
      const content = str(payload?.content);
      return {
        icon: Brain,
        tone: "neutral",
        label: "Thinking",
        title: firstLine(content) || "Thinking…",
        body: content,
      };
    }

    case "dispatch_created": {
      const mode = str(payload?.planMode);
      const summary = str(payload?.planSummary);
      return {
        icon: GitBranch,
        tone: "accent",
        label: "Dispatch",
        title: mode ? `Dispatch created (${mode})` : "Dispatch created",
        body: summary || undefined,
      };
    }

    case "dispatch_plan": {
      const plan = payload?.plan as
        | { tasks?: { title: string; role: string }[] }
        | undefined;
      const tasks = plan?.tasks ?? [];
      return {
        icon: ListTree,
        tone: "accent",
        label: "Plan",
        title: tasks.length ? `${tasks.length} task${tasks.length === 1 ? "" : "s"}` : "Plan",
        meta:
          tasks.length > 0 ? (
            <ol style={{ margin: 0, paddingLeft: 16 }}>
              {tasks.map((t, i) => (
                <li key={i} style={{ marginBottom: 2 }}>
                  {t.title}{" "}
                  <span style={{ color: "var(--studio-text-muted)" }}>
                    — {t.role}
                  </span>
                </li>
              ))}
            </ol>
          ) : undefined,
      };
    }

    case "dispatch_status": {
      const status = str(payload?.status);
      const summary = str(payload?.summary);
      const failed = status === "failed";
      return {
        icon: failed ? XCircle : CheckCircle2,
        tone: failed ? "error" : "accent",
        label: status || "Status",
        title: `Dispatch ${status}`,
        body: summary || undefined,
      };
    }

    case "task_created":
      return {
        icon: Circle,
        tone: "neutral",
        label: "Task",
        title: str(payload?.title),
        meta: str(payload?.role) || undefined,
      };

    case "task_status_change":
      return {
        icon: CircleDot,
        tone: "neutral",
        label: str(payload?.status) || "Task",
        title: str(payload?.title),
      };

    case "task_result": {
      const status = str(payload?.status);
      const isError = status === "error";
      const response = str(payload?.responseText);
      const error = str(payload?.error);
      return {
        icon: isError ? XCircle : CheckCircle2,
        tone: isError ? "error" : "neutral",
        label: `Task ${status}`.trim(),
        title: response ? firstLine(response) : status,
        body: response || undefined,
        code: error ? { content: error, language: "text" } : undefined,
      };
    }

    case "agent_activity": {
      const description = str(payload?.description) || str(payload?.status);
      return {
        icon: Activity,
        tone: "neutral",
        label: role ?? "Agent",
        title: firstLine(description),
        body:
          description.length > firstLine(description).length
            ? description
            : undefined,
      };
    }

    case "command_executed": {
      const toolchain = str(payload?.toolchainId) || "raw";
      const preset = str(payload?.preset);
      const scope = str(payload?.scope) || "project";
      const status = str(payload?.status);
      const cmd = str(payload?.command);
      const argv = Array.isArray(payload?.args)
        ? (payload?.args as string[]).join(" ")
        : "";
      const envDisplay = str(payload?.resolvedEnvDisplay);
      const duration = payload?.durationMs;
      const isFailed = status === "error" || status === "timeout";

      const fullCmd = `${preset || cmd}${argv ? ` ${argv}` : ""}`;
      const metaParts: string[] = [scope];
      if (envDisplay) metaParts.push(envDisplay);
      if (status) metaParts.push(status);
      if (duration != null) metaParts.push(`${Number(duration)}ms`);

      return {
        icon: Terminal,
        tone: isFailed ? "error" : "accent",
        label: toolchain,
        title: fullCmd,
        code: { content: fullCmd, language: "bash" },
        meta: metaParts.join(" · "),
      };
    }

    case "error": {
      const message = str(payload?.error) || "Unknown error";
      return {
        icon: AlertCircle,
        tone: "error",
        label: "Error",
        title: firstLine(message),
        code: { content: message, language: "text" },
      };
    }

    default:
      return {
        icon: CircleDot,
        tone: "neutral",
        label: event.eventType,
        title: event.eventType,
        code: {
          content: JSON.stringify(event.payload, null, 2),
          language: "json",
        },
      };
  }
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function firstLine(text: string): string {
  const line = text.split("\n")[0] ?? "";
  return line.length > 140 ? line.slice(0, 140) + "…" : line;
}

/**
 * Cheap language guess for tool outputs — we prefer JSON when the content
 * starts like an object/array, otherwise fall back to plain text for
 * strings (no false-positive highlighting on prose).
 */
function inferLang(content: string, isString: boolean): string {
  if (!isString) return "json";
  const trimmed = content.trimStart();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  return "text";
}
