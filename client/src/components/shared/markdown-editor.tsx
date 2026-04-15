import { useState } from "react";
import { Box, Flex, Button } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { Pencil, Eye } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";
import { useThemeMode } from "@/hooks/use-theme-mode";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  /** Fill remaining height of parent flex container */
  fill?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minHeight = "300px",
  fill,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">(
    value.trim() ? "preview" : "edit",
  );
  const { mode: themeMode } = useThemeMode();

  return (
    <Flex
      direction="column"
      css={{
        borderRadius: "8px",
        border: "1px solid var(--studio-border)",
        overflow: "hidden",
        background: "var(--studio-bg-inset)",
        width: "100%",
        ...(fill ? { flex: 1, minHeight: 0 } : {}),
      }}
    >
      {/* Toolbar */}
      <Flex
        align="center"
        gap={1}
        css={{
          padding: "4px 6px",
          borderBottom: "1px solid var(--studio-border)",
          background: "var(--studio-bg-sidebar)",
        }}
      >
        <Button
          size="xs"
          variant="ghost"
          onClick={() => setMode("preview")}
          css={{
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: mode === "preview" ? 500 : 400,
            background:
              mode === "preview" ? "var(--studio-bg-hover)" : "transparent",
            color:
              mode === "preview"
                ? "var(--studio-text-primary)"
                : "var(--studio-text-muted)",
            "&:hover": { color: "var(--studio-text-secondary)" },
          }}
        >
          <Eye size={12} />
          Preview
        </Button>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => setMode("edit")}
          css={{
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: mode === "edit" ? 500 : 400,
            background:
              mode === "edit" ? "var(--studio-bg-hover)" : "transparent",
            color:
              mode === "edit"
                ? "var(--studio-text-primary)"
                : "var(--studio-text-muted)",
            "&:hover": { color: "var(--studio-text-secondary)" },
          }}
        >
          <Pencil size={12} />
          Edit
        </Button>
      </Flex>

      {/* Content */}
      {mode === "edit" ? (
        <Box css={fill ? { flex: 1, minHeight: 0 } : { height: minHeight }}>
          <Editor
            height={fill ? "100%" : minHeight}
            language="markdown"
            theme={themeMode === "dark" ? "vs-dark" : "light"}
            value={value}
            onChange={(v) => onChange(v ?? "")}
            options={{
              minimap: { enabled: false },
              lineNumbers: "off",
              glyphMargin: false,
              folding: false,
              scrollBeyondLastLine: false,
              wordWrap: "on",
              wrappingStrategy: "advanced",
              fontSize: 13,
              fontFamily:
                "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, monospace",
              lineHeight: 20,
              padding: { top: 12, bottom: 12 },
              renderLineHighlight: "none",
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              overviewRulerBorder: false,
              scrollbar: {
                vertical: "auto",
                horizontal: "hidden",
                verticalScrollbarSize: 6,
              },
              placeholder,
            }}
          />
        </Box>
      ) : (
        <Box
          css={{
            ...(fill ? { flex: 1, minHeight: 0 } : { height: minHeight }),
            padding: "16px",
            overflowY: "auto",
            background: "var(--studio-bg-main)",
          }}
        >
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <Box
              css={{
                color: "var(--studio-text-muted)",
                fontSize: "14px",
                fontStyle: "italic",
              }}
            >
              Nothing to preview
            </Box>
          )}
        </Box>
      )}
    </Flex>
  );
}
