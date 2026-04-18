import { useMemo } from "react";
import type { Artifact } from "@/api/types";
import {
  FilterChip,
  FilterGroup,
  FilterLabel,
  FilterRow,
} from "./styles";

interface ArtifactFiltersProps {
  artifacts: Artifact[];
  role: string | null;
  tag: string | null;
  onRoleChange: (role: string | null) => void;
  onTagChange: (tag: string | null) => void;
}

/**
 * Stacked filter groups — labeled "Roles" and "Tags" — so the rail
 * doesn't read as one soup of chips. Groups collapse when empty.
 */
export function ArtifactFilters({
  artifacts,
  role,
  tag,
  onRoleChange,
  onTagChange,
}: ArtifactFiltersProps) {
  const roles = useMemo(
    () => unique(artifacts.map((a) => a.role)).sort(),
    [artifacts],
  );
  const tags = useMemo(
    () => unique(artifacts.flatMap((a) => a.tags)).sort(),
    [artifacts],
  );

  if (roles.length === 0 && tags.length === 0) return null;

  return (
    <>
      {roles.length > 0 && (
        <FilterGroup>
          <FilterLabel>Roles</FilterLabel>
          <FilterRow>
            {roles.map((r) => (
              <FilterChip
                key={`role:${r}`}
                $active={role === r}
                onClick={() => onRoleChange(role === r ? null : r)}
              >
                {r.replace(/-/g, " ")}
              </FilterChip>
            ))}
          </FilterRow>
        </FilterGroup>
      )}
      {tags.length > 0 && (
        <FilterGroup>
          <FilterLabel>Tags</FilterLabel>
          <FilterRow>
            {tags.map((t) => (
              <FilterChip
                key={`tag:${t}`}
                $active={tag === t}
                onClick={() => onTagChange(tag === t ? null : t)}
              >
                #{t}
              </FilterChip>
            ))}
          </FilterRow>
        </FilterGroup>
      )}
    </>
  );
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}
