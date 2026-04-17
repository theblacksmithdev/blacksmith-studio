import { useMemo } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { radii, Text, spacing } from "@/components/shared/ui";
import { CodeHeader } from "./code-header";
import { inferLanguage } from "./language";
import type { DiffBlockProps } from "./types";

type LineKind = "add" | "remove" | "context";

interface DiffLine {
  kind: LineKind;
  text: string;
  leftNo?: number;
  rightNo?: number;
}

function buildDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

  const a = oldLines.length;
  const b = newLines.length;
  const lcs: number[][] = Array.from({ length: a + 1 }, () =>
    new Array(b + 1).fill(0),
  );
  for (let i = a - 1; i >= 0; i--) {
    for (let j = b - 1; j >= 0; j--) {
      if (oldLines[i] === newLines[j]) lcs[i][j] = lcs[i + 1][j + 1] + 1;
      else lcs[i][j] = Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let leftNo = 1;
  let rightNo = 1;
  while (i < a && j < b) {
    if (oldLines[i] === newLines[j]) {
      out.push({
        kind: "context",
        text: oldLines[i],
        leftNo: leftNo++,
        rightNo: rightNo++,
      });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ kind: "remove", text: oldLines[i], leftNo: leftNo++ });
      i++;
    } else {
      out.push({ kind: "add", text: newLines[j], rightNo: rightNo++ });
      j++;
    }
  }
  while (i < a)
    out.push({ kind: "remove", text: oldLines[i++], leftNo: leftNo++ });
  while (j < b)
    out.push({ kind: "add", text: newLines[j++], rightNo: rightNo++ });

  return out;
}

function LineRow({ line }: { line: DiffLine }) {
  const bg =
    line.kind === "add"
      ? "rgba(16,163,127,0.08)"
      : line.kind === "remove"
        ? "rgba(211,47,47,0.08)"
        : "transparent";
  const marker =
    line.kind === "add" ? "+" : line.kind === "remove" ? "−" : " ";
  const markerColor =
    line.kind === "add"
      ? "var(--studio-green)"
      : line.kind === "remove"
        ? "var(--studio-error)"
        : "var(--studio-text-muted)";

  return (
    <Flex css={{ background: bg }}>
      <Box
        aria-hidden="true"
        css={{
          flexShrink: 0,
          width: "36px",
          textAlign: "right",
          paddingRight: "6px",
          color: "var(--studio-text-muted)",
          opacity: 0.7,
          userSelect: "none",
        }}
      >
        {line.leftNo ?? ""}
      </Box>
      <Box
        aria-hidden="true"
        css={{
          flexShrink: 0,
          width: "36px",
          textAlign: "right",
          paddingRight: "6px",
          color: "var(--studio-text-muted)",
          opacity: 0.7,
          userSelect: "none",
          borderRight: "1px solid var(--studio-border)",
        }}
      >
        {line.rightNo ?? ""}
      </Box>
      <Box
        css={{
          width: "18px",
          flexShrink: 0,
          textAlign: "center",
          color: markerColor,
          userSelect: "none",
        }}
      >
        {marker}
      </Box>
      <Box
        as="pre"
        css={{
          margin: 0,
          padding: "0 12px 0 0",
          whiteSpace: "pre",
          color: "var(--studio-text-primary)",
          minWidth: 0,
          flex: 1,
        }}
      >
        {line.text || " "}
      </Box>
    </Flex>
  );
}

export function DiffBlock({
  oldText,
  newText,
  filename,
  language,
  maxHeight,
}: DiffBlockProps) {
  const resolvedLanguage = inferLanguage(language, filename);
  const lines = useMemo(() => buildDiff(oldText, newText), [oldText, newText]);

  const additions = lines.filter((l) => l.kind === "add").length;
  const removals = lines.filter((l) => l.kind === "remove").length;

  const resolvedMax =
    typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

  return (
    <Box
      css={{
        borderRadius: radii.md,
        border: "1px solid var(--studio-border)",
        overflow: "hidden",
        background: "var(--studio-code-bg)",
      }}
    >
      <CodeHeader
        filename={filename}
        language={resolvedLanguage}
        code={newText}
      />
      <Flex
        align="center"
        gap={spacing.sm}
        css={{
          padding: `4px ${spacing.md}`,
          borderBottom: "1px solid var(--studio-border)",
          background: "var(--studio-bg-inset)",
        }}
      >
        <Text
          variant="tiny"
          css={{ color: "var(--studio-green)", fontWeight: 600 }}
        >
          +{additions}
        </Text>
        <Text
          variant="tiny"
          css={{ color: "var(--studio-error)", fontWeight: 600 }}
        >
          −{removals}
        </Text>
      </Flex>
      <Box
        css={{
          overflow: "auto",
          maxHeight: resolvedMax,
          fontFamily:
            "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
          fontSize: "13px",
          lineHeight: "20px",
          padding: "8px 0",
        }}
      >
        {lines.map((line, idx) => (
          <LineRow key={idx} line={line} />
        ))}
      </Box>
    </Box>
  );
}
