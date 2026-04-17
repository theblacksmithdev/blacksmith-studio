import type { ReactNode } from "react";
import { Code } from "@chakra-ui/react";

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <Code
      css={{
        background: "var(--studio-bg-surface)",
        color: "var(--studio-text-primary)",
        fontSize: "0.9em",
        padding: "1px 6px",
        borderRadius: "4px",
        border: "1px solid var(--studio-border)",
        fontFamily:
          "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
      }}
    >
      {children}
    </Code>
  );
}
