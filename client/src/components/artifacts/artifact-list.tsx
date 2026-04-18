import { useMemo, useState } from "react";
import { FileCode, RefreshCw, Search } from "lucide-react";
import {
  useArtifactsQuery,
  useArtifactsSubscription,
  useBackfillArtifacts,
} from "@/api/hooks/artifacts";
import type { Artifact } from "@/api/types";
import { PanelEmptyState } from "@/components/shared/panel-empty-state";
import { Tooltip } from "@/components/shared/tooltip";
import { ArtifactFilters } from "./artifact-filters";
import { ArtifactPreviewDrawer } from "./artifact-preview-drawer";
import { ArtifactRow } from "./artifact-row";
import {
  CountLabel,
  Divider,
  Header,
  HeaderTop,
  IconButton,
  ListScroll,
  Root,
  SearchInput,
  SearchShell,
  TitleText,
} from "./styles";

interface ArtifactListProps {
  conversationId?: string;
  title?: string;
  showBackfill?: boolean;
  /** Currently selected artifact id — drives row highlight. */
  selectedId?: string | null;
  /**
   * Called when a row is clicked. When provided, the list becomes
   * "controlled" and no internal drawer opens — the caller is expected
   * to render the detail view elsewhere (e.g. a split panel / route).
   * When absent, the legacy drawer-on-click behaviour is preserved for
   * surfaces that can't afford an inline detail pane.
   */
  onSelect?: (id: string) => void;
}

/**
 * Reusable artifact list. Powers both the project-wide library page
 * (split panel, route-driven selection) and the conversation-scoped
 * panel (internal drawer).
 */
export function ArtifactList({
  conversationId,
  title = "Artifacts",
  showBackfill = true,
  selectedId = null,
  onSelect,
}: ArtifactListProps) {
  useArtifactsSubscription();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const { data: artifacts = [], isLoading } = useArtifactsQuery({
    conversationId,
    search: search.trim() || undefined,
    role: role ?? undefined,
    tag: tag ?? undefined,
  });

  const backfill = useBackfillArtifacts();

  // Unfiltered list drives the chip rail so filters don't disappear as
  // the user narrows the view.
  const { data: allArtifacts = [] } = useArtifactsQuery({ conversationId });

  const rows: Artifact[] = useMemo(() => artifacts, [artifacts]);

  const handleOpen = (id: string) => {
    if (onSelect) onSelect(id);
    else setDrawerId(id);
  };

  const filtersActive = hasActiveFilters(search, role, tag);
  const hasAny = allArtifacts.length > 0;

  return (
    <Root>
      <Header>
        <HeaderTop>
          <TitleText>{title}</TitleText>
          <CountLabel>{rows.length}</CountLabel>
          {showBackfill && (
            <Tooltip content="Re-scan .blacksmith/artifacts/">
              <IconButton
                onClick={() => backfill.mutate()}
                disabled={backfill.isPending}
                aria-label="Re-index artifacts"
              >
                <RefreshCw size={13} />
              </IconButton>
            </Tooltip>
          )}
        </HeaderTop>
        <SearchShell>
          <Search size={13} />
          <SearchInput
            placeholder="Search artifacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchShell>
      </Header>

      <ArtifactFilters
        artifacts={allArtifacts}
        role={role}
        tag={tag}
        onRoleChange={setRole}
        onTagChange={setTag}
      />

      {hasAny && <Divider />}

      <ListScroll>
        {isLoading ? (
          <PanelEmptyState
            icon={<FileCode size={22} />}
            title="Loading artifacts"
            description="Reading markdown files from .blacksmith/artifacts/."
          />
        ) : rows.length === 0 ? (
          <PanelEmptyState
            icon={<FileCode size={22} />}
            title={filtersActive ? "No matches" : "No artifacts yet"}
            description={
              filtersActive
                ? "No artifacts match the current filters. Clear them to see everything."
                : "Artifacts are saved automatically when agents complete tasks. Their specs, designs, and summaries land here for you to read, edit, and tag."
            }
          />
        ) : (
          rows.map((a) => (
            <ArtifactRow
              key={a.id}
              artifact={a}
              selected={a.id === selectedId}
              onOpen={handleOpen}
            />
          ))
        )}
      </ListScroll>

      {drawerId && !onSelect && (
        <ArtifactPreviewDrawer
          artifactId={drawerId}
          onClose={() => setDrawerId(null)}
          onDeleted={() => setDrawerId(null)}
        />
      )}
    </Root>
  );
}

function hasActiveFilters(
  search: string,
  role: string | null,
  tag: string | null,
): boolean {
  return search.trim().length > 0 || role !== null || tag !== null;
}
