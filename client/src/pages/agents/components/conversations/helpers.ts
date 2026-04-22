import {
  Monitor,
  Server,
  Database,
  Palette,
  TestTube,
  Shield,
} from "lucide-react";

export const quickActions = [
  {
    label: "Build a feature",
    prompt: "Help me build a new full-stack feature with models, API, and UI.",
  },
  {
    label: "Add a page",
    prompt: "Create a new page with components, routing, and state management.",
  },
  {
    label: "Build an API",
    prompt: "Create new Django REST API endpoints with serializers and views.",
  },
  {
    label: "Fix a bug",
    prompt: "Help me investigate and fix a bug in my project.",
  },
  { label: "Write tests", prompt: "Write tests for my existing code." },
  {
    label: "Review code",
    prompt: "Review recent code changes for quality and security.",
  },
];

export const roster = [
  { icon: Monitor, label: "Frontend" },
  { icon: Server, label: "Backend" },
  { icon: Database, label: "Database" },
  { icon: Palette, label: "UI/UX" },
  { icon: TestTube, label: "QA" },
  { icon: Shield, label: "Security" },
];

export function timeAgo(d: string): string {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
