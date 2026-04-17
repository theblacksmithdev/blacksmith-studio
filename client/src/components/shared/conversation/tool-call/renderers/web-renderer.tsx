import styled from "@emotion/styled";
import { Box, Flex } from "@chakra-ui/react";
import { ExternalLink } from "lucide-react";
import { Text, spacing, radii } from "@/components/shared/ui";
import type { ToolCallData } from "../types";

const UrlLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  flex: 1;
  min-width: 0;
  color: var(--studio-text-primary);
  text-decoration: none;

  &:hover {
    color: var(--studio-link);
  }
`;

export function WebRenderer({ call }: { call: ToolCallData }) {
  const url = typeof call.input.url === "string" ? call.input.url : "";
  const query =
    typeof call.input.query === "string" ? call.input.query : undefined;
  const output = call.output ?? "";

  let host = "";
  try {
    if (url) host = new URL(url).host;
  } catch {
    /* ignore invalid URL */
  }

  return (
    <Box
      css={{
        borderRadius: radii.md,
        border: "1px solid var(--studio-border)",
        overflow: "hidden",
      }}
    >
      <Flex
        align="center"
        gap={spacing.sm}
        css={{
          padding: `6px ${spacing.md}`,
          borderBottom: "1px solid var(--studio-border)",
          background: "var(--studio-bg-inset)",
        }}
      >
        {url ? (
          <UrlLink href={url} target="_blank" rel="noreferrer">
            <Text
              variant="tiny"
              css={{
                fontWeight: 600,
                color: "inherit",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {host || url}
            </Text>
            <ExternalLink size={11} />
          </UrlLink>
        ) : (
          <Text
            variant="tiny"
            css={{
              fontWeight: 600,
              color: "var(--studio-text-primary)",
              flex: 1,
              minWidth: 0,
            }}
          >
            {query}
          </Text>
        )}
      </Flex>
      {output && (
        <Box
          as="pre"
          css={{
            margin: 0,
            padding: `${spacing.sm} ${spacing.md}`,
            maxHeight: "280px",
            overflow: "auto",
            fontSize: "12px",
            lineHeight: "18px",
            color: "var(--studio-text-secondary)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            background: "var(--studio-code-bg)",
          }}
        >
          {output}
        </Box>
      )}
    </Box>
  );
}
