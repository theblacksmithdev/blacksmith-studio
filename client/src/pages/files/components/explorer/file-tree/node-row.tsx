import { useState, type CSSProperties } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { NodeApi } from "react-arborist";
import { FileLabel } from "../utils/file-label";
import {
  FileContextMenu,
  type ContextMenuPosition,
} from "../../file-context-menu";
import type { TreeItem } from "../utils/tree-data";

interface NodeRowProps {
  node: NodeApi<TreeItem>;
  style: CSSProperties;
  changedFiles: Set<string>;
  onSelectFile: (path: string) => void;
}

export function NodeRow({
  node,
  style,
  changedFiles,
  onSelectFile,
}: NodeRowProps) {
  const [ctx, setCtx] = useState<ContextMenuPosition | null>(null);
  const isDir = node.data.isDir;
  const isSelected = node.isSelected;
  const isOpen = node.isOpen;
  const isChanged = changedFiles.has(node.data.path);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCtx({ x: e.clientX, y: e.clientY });
  };

  const handleClick = () => {
    if (isDir) node.toggle();
    else {
      node.select();
      onSelectFile(node.data.path);
    }
  };

  return (
    <>
      <Flex
        as="button"
        align="center"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={style}
        css={{
          width: "100%",
          gap: "2px",
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
            (isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />)}
        </Box>

        <Box css={{ flex: 1, minWidth: 0 }}>
          <FileLabel
            name={node.data.name}
            isDir={isDir}
            isOpen={isOpen}
            isSelected={isSelected}
          />
        </Box>

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

      {ctx && (
        <FileContextMenu
          path={node.data.path}
          position={ctx}
          isDirectory={isDir}
          onClose={() => setCtx(null)}
        />
      )}
    </>
  );
}
