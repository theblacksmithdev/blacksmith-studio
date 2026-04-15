import styled from "@emotion/styled";
import { ArrowRight } from "lucide-react";
import type { WorkMode as Mode } from "@/stores/ui-store";

const chatSuggestions = [
  {
    label: "Create a resource",
    prompt:
      "Help me create a new full-stack resource with model, serializer, API viewset, and React pages.",
  },
  {
    label: "Add a page",
    prompt:
      "Help me create a new page with proper routing, layout, and components.",
  },
  {
    label: "Build an API",
    prompt: "Help me create a new REST API endpoint with serializer and views.",
  },
  {
    label: "Add auth",
    prompt:
      "Help me add authentication with login, registration, and route protection.",
  },
  {
    label: "Fix a bug",
    prompt: "Help me investigate and fix a bug in my project.",
  },
  {
    label: "Write tests",
    prompt:
      "Help me write tests for my existing code using the project testing patterns.",
  },
];

const agentSuggestions = [
  {
    label: "Build a feature",
    prompt: "Build a new full-stack feature with models, API, and UI.",
  },
  {
    label: "Build an API",
    prompt: "Create new REST API endpoints with serializers, views, and tests.",
  },
  {
    label: "Set up database",
    prompt:
      "Design and implement the database schema with models and migrations.",
  },
  {
    label: "Add authentication",
    prompt:
      "Implement authentication with login, registration, JWT tokens, and route protection.",
  },
  {
    label: "Full code review",
    prompt:
      "Review the recent code changes for correctness, security, and quality.",
  },
  {
    label: "Write tests",
    prompt:
      "Write comprehensive tests for the existing codebase — unit, integration, and E2E.",
  },
];

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;
`;

const Chip = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  font-size: 13px;
  font-weight: 450;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;

  .chip-arrow {
    opacity: 0;
    transform: translateX(-2px);
    transition: all 0.15s ease;
    color: var(--studio-text-tertiary);
    display: flex;
  }

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
    background: var(--studio-bg-surface);

    .chip-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

interface QuickActionsProps {
  mode?: Mode;
  onSend: (prompt: string) => void;
}

export function QuickActions({ mode = "chat", onSend }: QuickActionsProps) {
  const suggestions = mode === "agents" ? agentSuggestions : chatSuggestions;

  return (
    <Wrap>
      {suggestions.map(({ label, prompt }) => (
        <Chip key={label} onClick={() => onSend(prompt)}>
          {label}
          <span className="chip-arrow">
            <ArrowRight size={12} />
          </span>
        </Chip>
      ))}
    </Wrap>
  );
}
