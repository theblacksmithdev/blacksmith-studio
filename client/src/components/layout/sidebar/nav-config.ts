import {
  Files,
  Play,
  GitBranch,
  MessageSquare,
  Network,
  FileCode,
  Gauge,
} from "lucide-react";
import {
  codePath,
  runPath,
  sourceControlPath,
  newChatPath,
  agentsNewPath,
  artifactsPath,
  usagePath,
} from "@/router/paths";

export interface NavEntry {
  id: string;
  icon: typeof Files;
  label: string;
  path: (pid: string) => string;
  match: string;
}

/**
 * Primary AI surfaces — what you reach for when you sit down at a
 * project. Chat is the solo interaction; Agents Team is the
 * multi-agent workflow.
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
    icon: Network,
    label: "Agents Team",
    path: agentsNewPath,
    match: "/agents",
  },
];

/**
 * Project work — the surfaces you edit in, commit from, and run
 * against. Grouped separately from AI because the mental mode is
 * different (authoring code vs. collaborating with Claude).
 */
export const workNav: NavEntry[] = [
  { id: "code", icon: Files, label: "Files", path: codePath, match: "/code" },
  {
    id: "git",
    icon: GitBranch,
    label: "Source Control",
    path: sourceControlPath,
    match: "/source-control",
  },
  {
    id: "run",
    icon: Play,
    label: "Dev Services",
    path: runPath,
    match: "/run",
  },
];

/**
 * Activity — read-only audit trails. Surfaces what Claude and agents
 * have been doing (artifacts produced, cost accrued) without driving
 * new work. Agent subprocess runs live inside each agent conversation
 * now rather than as a global surface.
 */
export const activityNav: NavEntry[] = [
  {
    id: "artifacts",
    icon: FileCode,
    label: "Artifacts",
    path: artifactsPath,
    match: "/artifacts",
  },
  {
    id: "usage",
    icon: Gauge,
    label: "Usage",
    path: usagePath,
    match: "/usage",
  },
];
