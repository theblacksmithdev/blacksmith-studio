import { FileCode } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Artifact, AgentRole } from "@/api/types";
import { ROLE_ICONS } from "@/components/shared/agent-role-icons";
import {
  MetaDot,
  RoleLabel,
  RoleTile,
  RowBody,
  RowMeta,
  RowShell,
  RowTitle,
  TagChip,
} from "./styles";

interface ArtifactRowProps {
  artifact: Artifact;
  selected?: boolean;
  onOpen: (id: string) => void;
}

/**
 * Single artifact row — role tile + title + subdued meta.
 * Selected state: surface tint + accent strip on the left edge.
 */
export function ArtifactRow({ artifact, selected, onOpen }: ArtifactRowProps) {
  const age = safeDistance(artifact.updatedAt);
  const RoleIcon = ROLE_ICONS[artifact.role as AgentRole] ?? FileCode;
  const visibleTags = artifact.tags.slice(0, 2);
  const hiddenTagCount = artifact.tags.length - visibleTags.length;

  return (
    <RowShell
      onClick={() => onOpen(artifact.id)}
      $selected={!!selected}
      aria-pressed={!!selected}
    >
      <RoleTile>
        <RoleIcon size={15} />
      </RoleTile>
      <RowBody>
        <RowTitle>{artifact.title}</RowTitle>
        <RowMeta>
          <RoleLabel>{artifact.role.replace(/-/g, " ")}</RoleLabel>
          <MetaDot />
          <span>{age}</span>
          {visibleTags.map((t) => (
            <TagChip key={t}>{t}</TagChip>
          ))}
          {hiddenTagCount > 0 && <TagChip>+{hiddenTagCount}</TagChip>}
        </RowMeta>
      </RowBody>
    </RowShell>
  );
}

function safeDistance(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}
