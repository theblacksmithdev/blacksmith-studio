import { useEffect, useRef } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Terminal } from "lucide-react";
import {
  installLogBodyCss,
  installLogCardCss,
  installLogHeaderCss,
} from "./styles";

interface InstallLogProps {
  title?: string;
  lines: string[];
}

/**
 * Auto-scrolling monospace log used during installs / env setup. Pure
 * presentational — callers own the line buffer.
 */
export function InstallLog({ title = "Log", lines }: InstallLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines.length]);

  return (
    <Box css={installLogCardCss}>
      <Flex css={installLogHeaderCss}>
        <Terminal size={12} />
        {title}
      </Flex>
      <Box css={installLogBodyCss}>
        {lines.length === 0 ? (
          <Box css={{ color: "var(--studio-text-muted)" }}>No output yet.</Box>
        ) : (
          lines.map((line, i) => <Box key={i}>{line}</Box>)
        )}
        <Box ref={endRef} />
      </Box>
    </Box>
  );
}
