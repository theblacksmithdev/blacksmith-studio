import type { Node } from "@xyflow/react";
import type { AgentRole, AgentInfo } from "@/api/types";
import { AGENT_TEAMS } from "@/api/types";
import type { AgentNodeData, TeamNodeData } from "../node";

/**
 * Org-chart layout — hierarchical team structure.
 *
 *   Row 0  Leadership:    Product Manager (solo → agent node)
 *   Row 1  Departments:   Architecture team · Engineering team · Quality team
 *   Row 2  Members:       Arch members    · Eng members       · QA members
 *   Row 3  Support:       Technical Writer (solo → agent node)
 *
 *   Teams with a single member render as an agent node directly.
 *   Teams with multiple members render as a team node + member nodes below.
 */

const NODE_W = 152;
const TEAM_W = 180;
const GAP_X = 28;
const ROW_GAP = 160;

/* ── Row Y positions ── */
const ROW_Y = {
  leadership: 0,
  teams: ROW_GAP,
  members: ROW_GAP * 2,
  support: ROW_GAP * 3,
};

/* ── Team column centers (x midpoint for each multi-member team) ── */
const TEAM_CENTERS = {
  architecture: 160,
  engineering: 520,
  quality: 880,
};

/** Center N items around a midpoint */
function spreadAround(
  center: number,
  count: number,
  itemW: number,
  gap: number,
): number[] {
  const totalW = count * itemW + (count - 1) * gap;
  const startX = center - totalW / 2;
  return Array.from({ length: count }, (_, i) => startX + i * (itemW + gap));
}

/* ── Pre-computed member positions ── */
const ARCH_ROLES: AgentRole[] = [
  "architect",
  "database-engineer",
  "devops-engineer",
];
const ENG_ROLES: AgentRole[] = [
  "backend-engineer",
  "frontend-engineer",
  "fullstack-engineer",
  "ui-designer",
];
const QA_ROLES: AgentRole[] = [
  "qa-engineer",
  "code-reviewer",
  "security-engineer",
];

const archX = spreadAround(
  TEAM_CENTERS.architecture,
  ARCH_ROLES.length,
  NODE_W,
  GAP_X,
);
const engX = spreadAround(
  TEAM_CENTERS.engineering,
  ENG_ROLES.length,
  NODE_W,
  GAP_X,
);
const qaX = spreadAround(TEAM_CENTERS.quality, QA_ROLES.length, NODE_W, GAP_X);

const MEMBER_POSITIONS: Record<AgentRole, { x: number; y: number }> = {
  // Architecture members
  architect: { x: archX[0], y: ROW_Y.members },
  "database-engineer": { x: archX[1], y: ROW_Y.members },
  "devops-engineer": { x: archX[2], y: ROW_Y.members },

  // Engineering members
  "backend-engineer": { x: engX[0], y: ROW_Y.members },
  "frontend-engineer": { x: engX[1], y: ROW_Y.members },
  "fullstack-engineer": { x: engX[2], y: ROW_Y.members },
  "ui-designer": { x: engX[3], y: ROW_Y.members },

  // Quality members
  "qa-engineer": { x: qaX[0], y: ROW_Y.members },
  "code-reviewer": { x: qaX[1], y: ROW_Y.members },
  "security-engineer": { x: qaX[2], y: ROW_Y.members },

  // Solo roles (positioned directly in the hierarchy)
  "product-manager": {
    x: TEAM_CENTERS.engineering - NODE_W / 2,
    y: ROW_Y.leadership,
  },
  "technical-writer": {
    x: TEAM_CENTERS.engineering - NODE_W / 2,
    y: ROW_Y.support,
  },
};

/**
 * Connections model the org-chart hierarchy:
 *   Leadership → Department teams
 *   Team nodes → their members
 *   Quality gate → Documentation
 */
export const CONNECTIONS: [string, string][] = [
  // PM → department teams
  ["product-manager", "team:architecture"],
  ["product-manager", "team:engineering"],
  ["product-manager", "team:quality"],

  // Architecture team → members
  ["team:architecture", "architect"],
  ["team:architecture", "database-engineer"],
  ["team:architecture", "devops-engineer"],

  // Engineering team → members
  ["team:engineering", "backend-engineer"],
  ["team:engineering", "frontend-engineer"],
  ["team:engineering", "fullstack-engineer"],
  ["team:engineering", "ui-designer"],

  // Quality team → members
  ["team:quality", "qa-engineer"],
  ["team:quality", "code-reviewer"],
  ["team:quality", "security-engineer"],

  // Quality gate → documentation
  ["team:quality", "technical-writer"],
];

export function buildNodes(agents: AgentInfo[]): Node[] {
  const agentRoles = new Set(agents.map((a) => a.role));
  const nodes: Node[] = [];

  // Build agent nodes
  for (const agent of agents) {
    const pos = MEMBER_POSITIONS[agent.role];
    if (!pos) continue;

    const isSolo =
      agent.role === "product-manager" || agent.role === "technical-writer";

    nodes.push({
      id: agent.role,
      type: "agent",
      position: { x: pos.x, y: pos.y },
      data: {
        role: agent.role,
        title: agent.title,
        status: "idle",
        activity: null,
        selected: false,
        isCenter: agent.role === "product-manager",
      } satisfies AgentNodeData,
    });
  }

  // Build team nodes for multi-member teams
  const multiTeams = AGENT_TEAMS.filter((t) => t.roles.length > 1);
  for (const team of multiTeams) {
    const center = TEAM_CENTERS[team.team as keyof typeof TEAM_CENTERS];
    if (center === undefined) continue;

    const memberCount = team.roles.filter((r) => agentRoles.has(r)).length;
    if (memberCount === 0) continue;

    nodes.push({
      id: `team:${team.team}`,
      type: "team",
      position: { x: center - TEAM_W / 2, y: ROW_Y.teams },
      data: {
        team: team.team,
        title: team.title,
        memberCount,
        activeCount: 0,
      } satisfies TeamNodeData,
    });
  }

  return nodes;
}
