import {
  Eye,
  FilePen,
  FilePlus,
  Terminal,
  Search,
  FolderSearch,
  Globe,
  Wrench,
  ListTodo,
  Hammer,
} from "lucide-react";
import type { ToolDescriptor } from "./types";
import { shortFilename } from "@/components/shared/code-block";

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

const REGISTRY: Record<string, ToolDescriptor> = {
  Read: {
    label: "Read",
    icon: Eye,
    summarize: (input) =>
      shortFilename(str(input.file_path) || str(input.path)),
    hint: (input) => str(input.file_path) || str(input.path) || undefined,
  },
  Edit: {
    label: "Edit",
    icon: FilePen,
    summarize: (input) => shortFilename(str(input.file_path)),
    hint: (input) => str(input.file_path) || undefined,
  },
  MultiEdit: {
    label: "Edit",
    icon: FilePen,
    summarize: (input) => shortFilename(str(input.file_path)),
    hint: (input) => str(input.file_path) || undefined,
  },
  Write: {
    label: "Write",
    icon: FilePlus,
    summarize: (input) => shortFilename(str(input.file_path)),
    hint: (input) => str(input.file_path) || undefined,
  },
  Bash: {
    label: "Run",
    icon: Terminal,
    summarize: (input) => str(input.command),
  },
  Grep: {
    label: "Search",
    icon: Search,
    summarize: (input) => str(input.pattern),
    hint: (input) => str(input.path) || undefined,
  },
  Glob: {
    label: "Glob",
    icon: FolderSearch,
    summarize: (input) => str(input.pattern),
  },
  WebFetch: {
    label: "Fetch",
    icon: Globe,
    summarize: (input) => str(input.url),
  },
  WebSearch: {
    label: "Web",
    icon: Globe,
    summarize: (input) => str(input.query),
  },
  Task: {
    label: "Task",
    icon: ListTodo,
    summarize: (input) =>
      str(input.description) || str(input.prompt).slice(0, 80),
  },
  TodoWrite: {
    label: "Todos",
    icon: ListTodo,
    summarize: () => "Updated task list",
  },
};

const DEFAULT: ToolDescriptor = {
  label: "Tool",
  icon: Wrench,
  summarize: (input) => {
    const keys = Object.keys(input);
    if (keys.length === 0) return "";
    const first = keys[0];
    const value = input[first];
    return typeof value === "string" ? value.slice(0, 120) : first;
  },
};

export function describeTool(toolName: string): ToolDescriptor {
  if (toolName.startsWith("mcp__")) {
    const parts = toolName.split("__");
    const short = parts[parts.length - 1] || toolName;
    return {
      label: short.replace(/_/g, " "),
      icon: Hammer,
      summarize: (input) => {
        const keys = Object.keys(input);
        if (keys.length === 0) return parts.slice(1, -1).join(" / ");
        const value = input[keys[0]];
        return typeof value === "string"
          ? value.slice(0, 120)
          : JSON.stringify(value).slice(0, 80);
      },
      hint: () => parts.slice(1, -1).join(" / ") || undefined,
    };
  }
  return REGISTRY[toolName] ?? DEFAULT;
}
