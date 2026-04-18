import { useMemo } from "react";
import { Box } from "@chakra-ui/react";
import { highlightCode } from "./highlight-code";
import { HIGHLIGHT_THEME_CSS } from "./highlight-theme";

interface CodeBodyProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: number | string;
}

export function CodeBody({
  code,
  language,
  showLineNumbers,
  maxHeight,
}: CodeBodyProps) {
  const lines = useMemo(() => code.split("\n"), [code]);
  const highlighted = useMemo(
    () => highlightCode(code, language),
    [code, language],
  );
  const gutterWidth = useMemo(() => {
    const digits = String(lines.length).length;
    return `${digits * 9 + 14}px`;
  }, [lines.length]);

  const resolvedMax =
    typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

  return (
    <Box
      className="studio-highlight"
      css={{
        display: "flex",
        overflow: "auto",
        maxHeight: resolvedMax,
        background: "var(--studio-code-bg)",
        fontFamily:
          "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
        fontSize: "13px",
        lineHeight: "20px",
        "&::-webkit-scrollbar": {
          width: "10px",
          height: "10px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "var(--studio-scrollbar)",
          borderRadius: "5px",
          border: "2px solid var(--studio-code-bg)",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "var(--studio-scrollbar-hover)",
        },
      }}
    >
      <style>{HIGHLIGHT_THEME_CSS}</style>
      {showLineNumbers && (
        <Box
          aria-hidden="true"
          css={{
            flexShrink: 0,
            padding: "12px 8px 12px 14px",
            textAlign: "right",
            color: "var(--studio-text-muted)",
            userSelect: "none",
            width: gutterWidth,
            borderRight: "1px solid var(--studio-border)",
            background: "var(--studio-bg-inset)",
            opacity: 0.75,
          }}
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </Box>
      )}
      <Box
        as="pre"
        css={{
          flex: 1,
          margin: 0,
          padding: "12px 16px",
          minWidth: 0,
          color: "var(--studio-text-primary)",
        }}
      >
        <code
          className={
            highlighted.language
              ? `hljs language-${highlighted.language}`
              : "hljs"
          }
          dangerouslySetInnerHTML={{ __html: highlighted.html }}
        />
      </Box>
    </Box>
  );
}
