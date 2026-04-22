import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Edit2,
  FileCode,
  FileText,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { HtmlPreviewBlock } from "@/components/shared/html-preview-block";
import { PanelEmptyState } from "@/components/shared/panel-empty-state";
import { Tooltip } from "@/components/shared/tooltip";
import { ConfirmDialog } from "@/components/shared/ui";
import { extractHtmlArtifact } from "./detect-html";
import { ROLE_ICONS } from "@/components/shared/agent-role-icons";
import type { AgentRole } from "@/api/types";
import {
  useArtifactContentQuery,
  useArtifactQuery,
  useDeleteArtifact,
  useRenameArtifact,
  useSetArtifactTags,
  useWriteArtifactContent,
} from "@/api/hooks/artifacts";
import {
  DetailActions,
  DetailBody,
  DetailBodyInner,
  DetailHeader,
  DetailHeaderTop,
  DetailIconButton,
  DetailMeta,
  DetailPillButton,
  DetailRoleTile,
  DetailRoot,
  DetailTitleBlock,
  DetailTitleInput,
  MetaDot,
  PreviewTextarea,
  RoleLabel,
  TagChip,
  TagInput,
  TagsRow,
} from "./styles";

interface ArtifactDetailProps {
  artifactId: string | null;
  /** Called after a hard delete so the caller can clear selection. */
  onDeleted?: () => void;
  /** Close button — when provided, renders an X in the top-right. */
  onClose?: () => void;
}

/**
 * Markdown preview + inline edit for a single artifact.
 *
 * Premium detail layout: role tile + editable title + meta + tag
 * chips in a generous header band; markdown body padded with a
 * max-width for comfortable reading; actions grouped top-right; close
 * button always reachable.
 */
export function ArtifactDetail({
  artifactId,
  onDeleted,
  onClose,
}: ArtifactDetailProps) {
  const { data: artifact } = useArtifactQuery(artifactId ?? undefined);
  const { data: content, isLoading } = useArtifactContentQuery(
    artifactId ?? undefined,
  );
  const writeContent = useWriteArtifactContent();
  const rename = useRenameArtifact();
  const setTags = useSetArtifactTags();
  const deleteArtifact = useDeleteArtifact();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [titleDraft, setTitleDraft] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setDraft(content?.content ?? "");
  }, [content?.content]);

  useEffect(() => {
    setTitleDraft(artifact?.title ?? "");
  }, [artifact?.title]);

  useEffect(() => {
    // When selection changes, drop edit mode + any in-flight drafts.
    setEditing(false);
    setTagInput("");
    setConfirmingDelete(false);
  }, [artifactId]);

  if (!artifactId) {
    return (
      <DetailRoot>
        <PanelEmptyState
          icon={<FileText size={22} />}
          title="Select an artifact"
          description="Pick one from the list to preview, edit, tag, or delete it."
        />
      </DetailRoot>
    );
  }

  if (!artifact) {
    return (
      <DetailRoot>
        <PanelEmptyState
          icon={<FileText size={22} />}
          title="Artifact not found"
          description="It may have been deleted. Pick another from the list."
        />
      </DetailRoot>
    );
  }

  const RoleIcon = ROLE_ICONS[artifact.role as AgentRole] ?? FileCode;
  const createdAt = safeDistance(artifact.createdAt);
  const updatedAt = safeDistance(artifact.updatedAt);
  const edited = artifact.updatedAt !== artifact.createdAt;

  const handleSaveContent = () => {
    writeContent.mutate(
      { id: artifactId, content: draft },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleRename = () => {
    const next = titleDraft.trim();
    if (!next || next === artifact.title) return;
    rename.mutate({ id: artifactId, title: next });
  };

  const handleAddTag = () => {
    const next = tagInput.trim();
    if (!next) return;
    if (artifact.tags.includes(next)) {
      setTagInput("");
      return;
    }
    setTags.mutate(
      { id: artifactId, tags: [...artifact.tags, next] },
      { onSuccess: () => setTagInput("") },
    );
  };

  const handleRemoveTag = (tag: string) => {
    setTags.mutate({
      id: artifactId,
      tags: artifact.tags.filter((t) => t !== tag),
    });
  };

  const handleDelete = () => setConfirmingDelete(true);

  const confirmDelete = () => {
    deleteArtifact.mutate(artifactId, {
      onSuccess: () => {
        setConfirmingDelete(false);
        onDeleted?.();
      },
      onError: () => setConfirmingDelete(false),
    });
  };

  return (
    <DetailRoot>
      <DetailHeader>
        <DetailHeaderTop>
          <DetailRoleTile>
            <RoleIcon size={18} />
          </DetailRoleTile>

          <DetailTitleBlock>
            <DetailTitleInput
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              aria-label="Artifact title"
            />
            <DetailMeta>
              <RoleLabel>{artifact.role.replace(/-/g, " ")}</RoleLabel>
              <MetaDot />
              <span>created {createdAt}</span>
              {edited && (
                <>
                  <MetaDot />
                  <span>edited {updatedAt}</span>
                </>
              )}
            </DetailMeta>
          </DetailTitleBlock>

          <DetailActions>
            {editing ? (
              <>
                <DetailPillButton
                  data-variant="primary"
                  onClick={handleSaveContent}
                  disabled={writeContent.isPending}
                >
                  <Save size={12} /> Save
                </DetailPillButton>
                <DetailPillButton
                  onClick={() => {
                    setEditing(false);
                    setDraft(content?.content ?? "");
                  }}
                >
                  Cancel
                </DetailPillButton>
              </>
            ) : (
              <Tooltip content="Edit content">
                <DetailIconButton
                  onClick={() => setEditing(true)}
                  aria-label="Edit artifact"
                >
                  <Edit2 size={14} />
                </DetailIconButton>
              </Tooltip>
            )}
            <Tooltip content="Delete artifact">
              <DetailIconButton
                $danger
                onClick={handleDelete}
                disabled={deleteArtifact.isPending}
                aria-label="Delete artifact"
              >
                <Trash2 size={14} />
              </DetailIconButton>
            </Tooltip>
            {onClose && (
              <Tooltip content="Close">
                <DetailIconButton
                  onClick={onClose}
                  aria-label="Close artifact"
                >
                  <X size={15} />
                </DetailIconButton>
              </Tooltip>
            )}
          </DetailActions>
        </DetailHeaderTop>

        <TagsRow>
          {artifact.tags.map((tag) => (
            <TagChip
              key={tag}
              as="button"
              onClick={() => handleRemoveTag(tag)}
              title="Remove tag"
              style={{ cursor: "pointer", fontFamily: "inherit" }}
            >
              #{tag} ×
            </TagChip>
          ))}
          <TagInput
            placeholder="Add tag…"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onBlur={handleAddTag}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
        </TagsRow>
      </DetailHeader>

      <DetailBody>
        {isLoading ? (
          <DetailBodyInner>Loading…</DetailBodyInner>
        ) : editing ? (
          <PreviewTextarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : (
          (() => {
            const raw = content?.content ?? "";
            const html = extractHtmlArtifact(raw);
            if (html) {
              return <HtmlPreviewBlock code={html} fill />;
            }
            return (
              <DetailBodyInner>
                <MarkdownRenderer content={raw} />
              </DetailBodyInner>
            );
          })()
        )}
      </DetailBody>

      {confirmingDelete && (
        <ConfirmDialog
          message="Delete this artifact?"
          description={`"${artifact.title}" will be removed from disk and the library. This cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmingDelete(false)}
          loading={deleteArtifact.isPending}
        />
      )}
    </DetailRoot>
  );
}

function safeDistance(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}
