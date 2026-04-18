import type { ConversationEvent } from "@/api/types";
import {
  Preformatted,
  RowBody,
  RowIcon,
  RowMeta,
  RowShell,
  RowTitle,
} from "./styles";

interface EventRowProps {
  event: ConversationEvent;
}

/**
 * Renders a single conversation event. The switch is intentionally
 * flat — each branch decides tone, icon label, and body shape without
 * handing off to specialised components, so adding a new event type
 * is a one-branch edit.
 */
export function EventRow({ event }: EventRowProps) {
  const time = new Date(event.timestamp).toLocaleTimeString();
  const payload = event.payload as Record<string, unknown> | null;

  switch (event.eventType) {
    case "user_message": {
      const content = typeof payload?.content === "string" ? payload.content : "";
      return (
        <RowShell tone="accent">
          <RowIcon>user · {time}</RowIcon>
          <RowBody>
            <RowTitle>{content || "(empty)"}</RowTitle>
          </RowBody>
        </RowShell>
      );
    }
    case "assistant_message": {
      const content = typeof payload?.content === "string" ? payload.content : "";
      const cost = payload?.costUsd;
      const durationMs = payload?.durationMs;
      return (
        <RowShell>
          <RowIcon>
            {event.agentRole ?? "assistant"} · {time}
          </RowIcon>
          <RowBody>
            <RowTitle>{content || "(empty)"}</RowTitle>
            {(cost != null || durationMs != null) && (
              <RowMeta>
                {cost != null && `$${Number(cost).toFixed(4)}`}
                {cost != null && durationMs != null && " · "}
                {durationMs != null && `${Number(durationMs)}ms`}
              </RowMeta>
            )}
          </RowBody>
        </RowShell>
      );
    }
    case "tool_use": {
      const toolName = String(payload?.toolName ?? "tool");
      const input = payload?.input;
      return (
        <RowShell>
          <RowIcon>tool · {time}</RowIcon>
          <RowBody>
            <RowTitle>{toolName}</RowTitle>
            {input != null && (
              <Preformatted>{JSON.stringify(input, null, 2)}</Preformatted>
            )}
          </RowBody>
        </RowShell>
      );
    }
    case "tool_result": {
      const output =
        typeof payload?.output === "string"
          ? payload.output
          : JSON.stringify(payload?.output ?? null, null, 2);
      return (
        <RowShell>
          <RowIcon>result · {time}</RowIcon>
          <RowBody>
            <Preformatted>{output}</Preformatted>
          </RowBody>
        </RowShell>
      );
    }
    case "thinking_block": {
      const content = typeof payload?.content === "string" ? payload.content : "";
      return (
        <RowShell>
          <RowIcon>thinking · {time}</RowIcon>
          <RowBody>
            <RowMeta>{content}</RowMeta>
          </RowBody>
        </RowShell>
      );
    }
    case "dispatch_created": {
      const mode = String(payload?.planMode ?? "");
      const summary = String(payload?.planSummary ?? "");
      return (
        <RowShell tone="accent">
          <RowIcon>dispatch · {time}</RowIcon>
          <RowBody>
            <RowTitle>Dispatch created ({mode})</RowTitle>
            <RowMeta>{summary}</RowMeta>
          </RowBody>
        </RowShell>
      );
    }
    case "dispatch_plan": {
      const plan = payload?.plan as
        | { tasks?: { title: string; role: string }[] }
        | undefined;
      return (
        <RowShell tone="accent">
          <RowIcon>plan · {time}</RowIcon>
          <RowBody>
            <RowTitle>Plan</RowTitle>
            {plan?.tasks?.map((t, i) => (
              <RowMeta key={i}>
                {i + 1}. {t.title} — {t.role}
              </RowMeta>
            ))}
          </RowBody>
        </RowShell>
      );
    }
    case "dispatch_status": {
      const status = String(payload?.status ?? "");
      const summary = String(payload?.summary ?? "");
      return (
        <RowShell tone={status === "failed" ? "error" : "accent"}>
          <RowIcon>status · {time}</RowIcon>
          <RowBody>
            <RowTitle>Dispatch {status}</RowTitle>
            <RowMeta>{summary}</RowMeta>
          </RowBody>
        </RowShell>
      );
    }
    case "task_created": {
      const title = String(payload?.title ?? "");
      const role = String(payload?.role ?? "");
      return (
        <RowShell>
          <RowIcon>task · {time}</RowIcon>
          <RowBody>
            <RowTitle>{title}</RowTitle>
            <RowMeta>{role}</RowMeta>
          </RowBody>
        </RowShell>
      );
    }
    case "task_status_change": {
      const status = String(payload?.status ?? "");
      const title = String(payload?.title ?? "");
      return (
        <RowShell>
          <RowIcon>
            {status} · {time}
          </RowIcon>
          <RowBody>
            <RowTitle>{title}</RowTitle>
          </RowBody>
        </RowShell>
      );
    }
    case "task_result": {
      const status = String(payload?.status ?? "");
      const response = String(payload?.responseText ?? "").slice(0, 400);
      const error = payload?.error ? String(payload.error) : null;
      return (
        <RowShell tone={status === "error" ? "error" : undefined}>
          <RowIcon>
            task {status} · {time}
          </RowIcon>
          <RowBody>
            {response && <RowMeta>{response}</RowMeta>}
            {error && <Preformatted>{error}</Preformatted>}
          </RowBody>
        </RowShell>
      );
    }
    case "agent_activity": {
      const description =
        typeof payload?.description === "string"
          ? payload.description
          : typeof payload?.status === "string"
            ? String(payload.status)
            : "";
      return (
        <RowShell>
          <RowIcon>
            {event.agentRole ?? "agent"} · {time}
          </RowIcon>
          <RowBody>
            <RowMeta>{description}</RowMeta>
          </RowBody>
        </RowShell>
      );
    }
    case "error": {
      const message = String(payload?.error ?? "Unknown error");
      return (
        <RowShell tone="error">
          <RowIcon>error · {time}</RowIcon>
          <RowBody>
            <RowTitle>Error</RowTitle>
            <Preformatted>{message}</Preformatted>
          </RowBody>
        </RowShell>
      );
    }
    default: {
      return (
        <RowShell>
          <RowIcon>
            {event.eventType} · {time}
          </RowIcon>
          <RowBody>
            <Preformatted>
              {JSON.stringify(event.payload, null, 2)}
            </Preformatted>
          </RowBody>
        </RowShell>
      );
    }
  }
}
