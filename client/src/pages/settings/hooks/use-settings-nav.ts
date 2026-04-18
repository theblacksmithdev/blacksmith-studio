import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Palette,
  Sparkles,
  Code2,
  FolderCog,
  Blocks,
  Wand2,
  BookOpen,
  Boxes,
  Network,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

export interface SettingsNavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

export interface SettingsNavGroup {
  label: string;
  items: SettingsNavItem[];
}

/**
 * Settings groups grouped by intent rather than by the system doing
 * the work:
 *   · Preferences — app-wide UI choices
 *   · AI          — what Claude is + how it thinks
 *   · Knowledge   — what Claude reads from this project
 *   · Project     — per-project fundamentals
 */
export const settingsGroups: SettingsNavGroup[] = [
  {
    label: "Preferences",
    items: [
      { id: "appearance", icon: Palette, label: "Appearance" },
      { id: "editor", icon: Code2, label: "Editor" },
    ],
  },
  {
    label: "AI",
    items: [
      { id: "ai", icon: Sparkles, label: "Prompting" },
      { id: "mcp", icon: Blocks, label: "MCP Servers" },
      { id: "skills", icon: Wand2, label: "Skills" },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { id: "knowledge", icon: BookOpen, label: "Knowledge Base" },
      { id: "graphify", icon: Network, label: "Knowledge Graph" },
    ],
  },
  {
    label: "Project",
    items: [
      { id: "workspace", icon: FolderCog, label: "Workspace" },
      { id: "environments", icon: Boxes, label: "Environments" },
    ],
  },
];

export const dangerItems: SettingsNavItem[] = [
  { id: "danger", icon: AlertTriangle, label: "Danger Zone" },
];

export function useSettingsNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const segments = location.pathname.split("/");
  const activeId = segments[segments.length - 1] || "ai";

  const goTo = useCallback(
    (id: string) => {
      navigate(id, { relative: "path" });
    },
    [navigate],
  );

  const isActive = useCallback((id: string) => activeId === id, [activeId]);

  return { activeId, goTo, isActive };
}
