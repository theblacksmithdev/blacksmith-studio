import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import {
  Check,
  Edit2,
  Trash2,
  Tag as TagIcon,
  Save,
  X,
} from "lucide-react";
import { Drawer } from "@/components/shared/drawer";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import {
  useArtifactContentQuery,
  useArtifactQuery,
  useDeleteArtifact,
  useRenameArtifact,
  useSetArtifactTags,
  useWriteArtifactContent,
} from "@/api/hooks/artifacts";
import {
  PreviewBody,
  PreviewTextarea,
  TagChip,
  ToolbarButton,
} from "./styles";

interface ArtifactPreviewDrawerProps {
  artifactId: string;
  onClose: () => void;
  onDeleted?: () => void;
}

/**
 * Markdown preview + inline edit for a single artifact. Actions: save
 * content, rename, set tags, delete. Delete is hard — confirm then
 * unlink file + remove DB row.
 */
export function ArtifactPreviewDrawer({
  artifactId,
  onClose,
  onDeleted,
}: ArtifactPreviewDrawerProps) {
  const { data: artifact } = useArtifactQuery(artifactId);
  const { data: content, isLoading } = useArtifactContentQuery(artifactId);
  const writeContent = useWriteArtifactContent();
  const rename = useRenameArtifact();
  const setTags = useSetArtifactTags();
  const deleteArtifact = useDeleteArtifact();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [titleDraft, setTitleDraft] = useState("");
  const [tagsDraft, setTagsDraft] = useState("");

  useEffect(() => {
    setDraft(content?.content ?? "");
  }, [content?.content]);

  useEffect(() => {
    setTitleDraft(artifact?.title ?? "");
    setTagsDraft((artifact?.tags ?? []).join(", "));
  }, [artifact?.title, artifact?.tags]);

  const handleSaveContent = () => {
    writeContent.mutate(
      { id: artifactId, content: draft },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleRename = () => {
    if (!artifact || titleDraft.trim() === artifact.title) return;
    rename.mutate({ id: artifactId, title: titleDraft.trim() });
  };

  const handleSaveTags = () => {
    const parsed = tagsDraft
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setTags.mutate({ id: artifactId, tags: parsed });
  };

  const handleDelete = () => {
    if (!confirm("Permanently delete this artifact? This cannot be undone."))
      return;
    deleteArtifact.mutate(artifactId, {
      onSuccess: () => {
        onDeleted?.();
        onClose();
      },
    });
  };

  return (
    <Drawer
      title={artifact?.title ?? "Artifact"}
      onClose={onClose}
      size="520px"
      footer={
        <Flex gap="8px" wrap="wrap">
          {editing ? (
            <>
              <ToolbarButton
                onClick={handleSaveContent}
                disabled={writeContent.isPending}
              >
                <Save size={12} /> Save
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  setEditing(false);
                  setDraft(content?.content ?? "");
                }}
              >
                <X size={12} /> Cancel
              </ToolbarButton>
            </>
          ) : (
            <ToolbarButton onClick={() => setEditing(true)}>
              <Edit2 size={12} /> Edit
            </ToolbarButton>
          )}
          <ToolbarButton onClick={handleDelete} disabled={deleteArtifact.isPending}>
            <Trash2 size={12} /> Delete
          </ToolbarButton>
        </Flex>
      }
    >
      <Flex direction="column" css={{ height: "100%", minHeight: 0 }}>
        <Flex
          direction="column"
          gap="8px"
          css={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--studio-border)",
            flexShrink: 0,
          }}
        >
          <Flex gap="6px" align="center">
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleRename}
              style={{
                flex: 1,
                height: "28px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid var(--studio-border)",
                background: "var(--studio-bg-sidebar)",
                color: "var(--studio-text-primary)",
                fontSize: "13px",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            {rename.isSuccess && <Check size={14} />}
          </Flex>
          <Flex gap="6px" align="center">
            <TagIcon
              size={12}
              style={{ color: "var(--studio-text-muted)" }}
            />
            <input
              value={tagsDraft}
              onChange={(e) => setTagsDraft(e.target.value)}
              onBlur={handleSaveTags}
              placeholder="comma-separated tags"
              style={{
                flex: 1,
                height: "26px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid var(--studio-border)",
                background: "var(--studio-bg-sidebar)",
                color: "var(--studio-text-primary)",
                fontSize: "12px",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </Flex>
          {artifact && artifact.tags.length > 0 && (
            <Flex gap="4px" wrap="wrap">
              {artifact.tags.map((t) => (
                <TagChip key={t}>{t}</TagChip>
              ))}
            </Flex>
          )}
        </Flex>

        {isLoading ? (
          <PreviewBody>Loading…</PreviewBody>
        ) : editing ? (
          <PreviewTextarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : (
          <PreviewBody>
            <MarkdownRenderer content={content?.content ?? ""} />
          </PreviewBody>
        )}
      </Flex>
    </Drawer>
  );
}
