import { useState, memo } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { FileLabel } from "./utils/file-label";
import {
  FileContextMenu,
  type ContextMenuPosition,
} from "../file-context-menu";
import type { TreeItem } from "./utils/tree-data";

interface TreeNodeProps {
  item: TreeItem;
  depth: number;
  selectedFile: string | null;
  changedFiles: Set<string>;
  onSelectFile: (path: string) => void;
  defaultOpen?: boolean;
}

interface ContextState {
  position: ContextMenuPosition;
}

export const TreeNode = memo(function TreeNode({
  item,
  depth,
  selectedFile,
  changedFiles,
  onSelectFile,
  defaultOpen = false,
}: TreeNodeProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [ctx, setCtx] = useState<ContextState | null>(null);
  const isDir = item.isDir;
  const isSelected = item.path === selectedFile;
  const isChanged = changedFiles.has(item.path);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCtx({ position: { x: e.clientX, y: e.clientY } });
  };

  return (
    <>
      <Flex
        as="button"
        align="center"
        onClick={() => {
          if (isDir) setOpen(!open);
          else onSelectFile(item.path);
        }}
        onContextMenu={handleContextMenu}
        css={{
          width: "100%",
          height: "28px",
          gap: "2px",
          paddingLeft: `${depth * 14 + 8}px`,
          paddingRight: "8px",
          border: "none",
          borderLeft: isSelected
            ? "2px solid var(--studio-text-primary)"
            : "2px solid transparent",
          background: isSelected ? "var(--studio-bg-hover)" : "transparent",
          cursor: "pointer",
          transition: "background 0.08s ease",
          textAlign: "left",
          fontFamily: "inherit",
          "&:hover": {
            background: isSelected
              ? "var(--studio-bg-hover)"
              : "var(--studio-bg-surface)",
          },
        }}
      >
        {/* Chevron */}
        <Box
          css={{
            width: "14px",
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            color: "var(--studio-text-muted)",
          }}
        >
          {isDir &&
            (open ? <ChevronDown size={11} /> : <ChevronRight size={11} />)}
        </Box>

        {/* File label */}
        <Box css={{ flex: 1, minWidth: 0 }}>
          <FileLabel
            name={item.name}
            isDir={isDir}
            isOpen={open}
            isSelected={isSelected}
          />
        </Box>

        {/* Modified dot */}
        {isChanged && (
          <Box
            css={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--studio-warning)",
              flexShrink: 0,
            }}
          />
        )}
      </Flex>

      {/* Context menu */}
      {ctx && (
        <FileContextMenu
          path={item.path}
          position={ctx.position}
          isDirectory={isDir}
          onClose={() => setCtx(null)}
        />
      )}

      {/* Children */}
      {isDir &&
        open &&
        item.children?.map((child) => (
          <TreeNode
            key={child.id}
            item={child}
            depth={depth + 1}
            selectedFile={selectedFile}
            changedFiles={changedFiles}
            onSelectFile={onSelectFile}
            defaultOpen={depth < 0}
          />
        ))}
    </>
  );
});
