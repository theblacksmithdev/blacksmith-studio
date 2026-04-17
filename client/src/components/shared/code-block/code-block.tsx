import { useState } from "react";
import { Box } from "@chakra-ui/react";
import { radii } from "@/components/shared/ui";
import { CodeHeader } from "./code-header";
import { CodeBody } from "./code-body";
import { inferLanguage } from "./language";
import type { CodeBlockProps } from "./types";

export function CodeBlock({
  code,
  language,
  filename,
  showHeader = true,
  showLineNumbers = false,
  maxHeight,
  collapsible = false,
  defaultCollapsed = false,
}: CodeBlockProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const resolvedLanguage = inferLanguage(language, filename);

  return (
    <Box
      css={{
        borderRadius: radii.md,
        border: "1px solid var(--studio-border)",
        overflow: "hidden",
        background: "var(--studio-code-bg)",
      }}
    >
      {showHeader && (
        <CodeHeader
          filename={filename}
          language={resolvedLanguage}
          code={code}
          collapsible={collapsible}
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />
      )}
      {!collapsed && (
        <CodeBody
          code={code}
          language={resolvedLanguage}
          showLineNumbers={showLineNumbers}
          maxHeight={maxHeight}
        />
      )}
    </Box>
  );
}
