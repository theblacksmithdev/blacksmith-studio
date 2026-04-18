import { formatDistanceToNow } from "date-fns";
import type { Artifact } from "@/api/types";
import { RowShell, RowTitle, RowMeta, TagChip } from "./styles";

interface ArtifactRowProps {
  artifact: Artifact;
  onOpen: (id: string) => void;
}

/** Single artifact row — title, role, age, tag chips. */
export function ArtifactRow({ artifact, onOpen }: ArtifactRowProps) {
  const age = safeDistance(artifact.updatedAt);
  return (
    <RowShell onClick={() => onOpen(artifact.id)}>
      <div style={{ minWidth: 0 }}>
        <RowTitle>{artifact.title}</RowTitle>
        <RowMeta>
          <span>{artifact.role.replace(/-/g, " ")}</span>
          <span>·</span>
          <span>{age}</span>
          {artifact.tags.length > 0 && (
            <>
              <span>·</span>
              {artifact.tags.map((t) => (
                <TagChip key={t}>{t}</TagChip>
              ))}
            </>
          )}
        </RowMeta>
      </div>
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
