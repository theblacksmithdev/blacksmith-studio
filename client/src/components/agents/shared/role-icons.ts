import {
  Monitor,
  Server,
  Layers,
  Container,
  TestTube,
  Shield,
  Database,
  Palette,
  FileText,
  GitPullRequest,
  Building2,
  ClipboardList,
} from "lucide-react";
import type { AgentRole } from "@/api/types";

/** Icon mapping for each agent role. Used by nodes, detail panel, etc. */
export const ROLE_ICONS: Record<AgentRole, typeof Monitor> = {
  "frontend-engineer": Monitor,
  "backend-engineer": Server,
  "fullstack-engineer": Layers,
  "devops-engineer": Container,
  "qa-engineer": TestTube,
  "security-engineer": Shield,
  "database-engineer": Database,
  "ui-designer": Palette,
  "technical-writer": FileText,
  "code-reviewer": GitPullRequest,
  architect: Building2,
  "product-manager": ClipboardList,
};
