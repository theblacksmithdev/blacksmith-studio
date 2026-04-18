import { useMemo, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { FileText, RefreshCw, Search } from "lucide-react";
import {
  useArtifactsQuery,
  useArtifactsSubscription,
  useBackfillArtifacts,
} from "@/api/hooks/artifacts";
import type { Artifact } from "@/api/types";
import { ArtifactFilters } from "./artifact-filters";
import { ArtifactPreviewDrawer } from "./artifact-preview-drawer";
import { ArtifactRow } from "./artifact-row";
import {
  CountPill,
  Empty,
  HeaderBar,
  ListScroll,
  Root,
  SearchInput,
  Title,
  ToolbarButton,
} from "./styles";

interface ArtifactListProps {
  conversationId?: string;
  title?: string;
  showBackfill?: boolean;
}

/**
 * Reusable artifact list. Powers both the project-wide library page
 * and the conversation-scoped panel via the `conversationId` prop.
 *
 * Owns: search input, role/tag filters, preview drawer. Data comes
 * from `useArtifactsQuery`; live mutations are merged through
 * `useArtifactsSubscription`.
 */
export function ArtifactList({
  conversationId,
  title = "Artifacts",
  showBackfill = true,
}: ArtifactListProps) {
  useArtifactsSubscription();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: artifacts = [], isLoading } = useArtifactsQuery({
    conversationId,
    search: search.trim() || undefined,
    role: role ?? undefined,
    tag: tag ?? undefined,
  });

  const backfill = useBackfillArtifacts();

  // Use an unfiltered list to populate the chip rail so filters don't
  // disappear as the user narrows the view.
  const { data: allArtifacts = [] } = useArtifactsQuery({ conversationId });

  const rows: Artifact[] = useMemo(() => artifacts, [artifacts]);

  return (
    <Root>
      <HeaderBar>
        <Flex align="center" gap="10px" css={{ flex: 1, minWidth: 0 }}>
          <FileText
            size={14}
            style={{ color: "var(--studio-text-muted)" }}
          />
          <Title>{title}</Title>
          <CountPill>{rows.length}</CountPill>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Search
              size={12}
              style={{ color: "var(--studio-text-muted)" }}
            />
            <SearchInput
              placeholder="Search artifacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Flex>
        {showBackfill && (
          <ToolbarButton
            onClick={() => backfill.mutate()}
            disabled={backfill.isPending}
          >
            <RefreshCw size={12} /> Re-index
          </ToolbarButton>
        )}
      </HeaderBar>

      <ArtifactFilters
        artifacts={allArtifacts}
        role={role}
        tag={tag}
        onRoleChange={setRole}
        onTagChange={setTag}
      />

      <ListScroll>
        {isLoading ? (
          <Empty>Loading artifacts…</Empty>
        ) : rows.length === 0 ? (
          <Empty>
            No artifacts match. Artifacts are saved to{" "}
            <code>.blacksmith/artifacts/</code> when agents complete tasks.
          </Empty>
        ) : (
          rows.map((a) => (
            <ArtifactRow key={a.id} artifact={a} onOpen={setSelectedId} />
          ))
        )}
      </ListScroll>

      {selectedId && (
        <ArtifactPreviewDrawer
          artifactId={selectedId}
          onClose={() => setSelectedId(null)}
          onDeleted={() => setSelectedId(null)}
        />
      )}
    </Root>
  );
}
