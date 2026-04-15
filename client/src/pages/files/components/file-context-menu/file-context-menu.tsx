import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Copy,
  ClipboardCopy,
  FolderOpen,
  Pencil,
  Trash2,
  MessageSquare,
  Bot,
} from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ui";
import {
  Overlay,
  Menu,
  MenuItem,
  DangerMenuItem,
  MenuDivider,
  RenameInput,
} from "./styled";
import { useFileActions, useMenuPosition, useEditors } from "./hooks";
import { EditorPicker } from "./editor-picker";

/* ── Types ──────────────────────────────────────────────── */

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface FileContextMenuProps {
  path: string;
  position: ContextMenuPosition;
  isDirectory?: boolean;
  showTabActions?: boolean;
  onClose: () => void;
}

/* ── Component ──────────────────────────────────────────── */

export function FileContextMenu({
  path: filePath,
  position,
  isDirectory = false,
  showTabActions = false,
  onClose,
}: FileContextMenuProps) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(
    filePath.split("/").pop() || filePath,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const menuRef = useMenuPosition([renaming]);
  const actions = useFileActions({ filePath, isDirectory, onClose });
  const { editors, preferred, setPreferred } = useEditors();

  const handleRename = async () => {
    const ok = await actions.rename(renameValue);
    if (!ok) setRenaming(false);
  };

  const handleDelete = async () => {
    await actions.deleteFile();
    setConfirmDelete(false);
  };

  return (
    <>
      {createPortal(
        <>
          <Overlay
            onClick={onClose}
            onContextMenu={(e) => {
              e.preventDefault();
              onClose();
            }}
          />
          <Menu ref={menuRef} style={{ left: position.x, top: position.y }}>
            {/* ── Tab actions ── */}
            {showTabActions && (
              <>
                <MenuItem onClick={actions.close}>
                  <X size={14} /> Close
                </MenuItem>
                <MenuItem onClick={actions.closeOthers}>
                  <X size={14} /> Close Others
                </MenuItem>
                <MenuItem onClick={actions.closeAll}>
                  <X size={14} /> Close All
                </MenuItem>
                <MenuDivider />
              </>
            )}

            {/* ── File / folder operations ── */}
            {renaming ? (
              <RenameInput
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") setRenaming(false);
                }}
                onBlur={handleRename}
              />
            ) : (
              <MenuItem onClick={() => setRenaming(true)}>
                <Pencil size={14} /> Rename
              </MenuItem>
            )}
            <DangerMenuItem onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} /> Delete
            </DangerMenuItem>

            <MenuDivider />

            {/* ── Copy ── */}
            <MenuItem onClick={actions.copyPath}>
              <Copy size={14} /> Copy Path
            </MenuItem>
            <MenuItem onClick={actions.copyFullPath}>
              <ClipboardCopy size={14} /> Copy Full Path
            </MenuItem>

            <MenuDivider />

            {/* ── AI ── */}
            {actions.project && (
              <>
                <MenuItem onClick={actions.addToChat}>
                  <MessageSquare size={14} /> Add to Chat
                </MenuItem>
                <MenuItem onClick={actions.addToAgentTeam}>
                  <Bot size={14} /> Add to Agent Team
                </MenuItem>
                <MenuDivider />
              </>
            )}

            {/* ── External ── */}
            <MenuItem onClick={actions.revealInFinder}>
              <FolderOpen size={14} /> Reveal in Finder
            </MenuItem>
            <EditorPicker
              editors={editors}
              preferredCommand={preferred?.command ?? null}
              onSelect={(cmd) => actions.openInEditor(cmd)}
              onSetPreferred={setPreferred}
            />
          </Menu>
        </>,
        document.body,
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${actions.fileName}"?`}
          description={
            isDirectory
              ? "This will permanently delete the folder and all its contents. This action cannot be undone."
              : "This will permanently delete the file from your project. This action cannot be undone."
          }
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setConfirmDelete(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
