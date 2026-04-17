import {
  Files,
  Play,
  GitBranch,
  Settings,
  MessageSquare,
  Users,
  Sparkles,
  Plug,
} from "lucide-react";
import {
  codePath,
  runPath,
  sourceControlPath,
  settingsPath,
  newChatPath,
  agentsNewPath,
  skillsBrowserPath,
  mcpBrowserPath,
} from "@/router/paths";

export interface NavEntry {
  id: string;
  icon: typeof Files;
  label: string;
  path: (pid: string) => string;
  match: string;
}

/**
 * Primary actions — what the user most often reaches for on entering a
 * project. Chat and Agents are the two AI surfaces; they were previously
 * only accessible via URL or the history toggle, which hid them from new
 * users.
 */
export const primaryNav: NavEntry[] = [
  {
    id: "chat",
    icon: MessageSquare,
    label: "Chat",
    path: newChatPath,
    match: "/chat",
  },
  {
    id: "agents",
    icon: Users,
    label: "Agents Team",
    path: agentsNewPath,
    match: "/agents",
  },
];

/** Project workspace — browsing / editing destinations. */
export const projectNav: NavEntry[] = [
  { id: "code", icon: Files, label: "Files", path: codePath, match: "/code" },
  {
    id: "git",
    icon: GitBranch,
    label: "Source Control",
    path: sourceControlPath,
    match: "/source-control",
  },
  {
    id: "skills",
    icon: Sparkles,
    label: "Skills",
    path: skillsBrowserPath,
    match: "/skills",
  },
  {
    id: "mcp",
    icon: Plug,
    label: "MCP",
    path: mcpBrowserPath,
    match: "/mcp",
  },
];

export const bottomNav: NavEntry[] = [
  {
    id: "run",
    icon: Play,
    label: "Dev Services",
    path: runPath,
    match: "/run",
  },
];

export const settingsNav: NavEntry = {
  id: "settings",
  icon: Settings,
  label: "Settings",
  path: settingsPath,
  match: "/settings",
};
