import { Flex, Box } from "@chakra-ui/react";
import { Sparkles } from "lucide-react";
import styled from "@emotion/styled";
import {
  Text,
  Textarea,
  Button,
  Skeleton,
  spacing,
  radii,
} from "@/components/shared/ui";

const Label = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing.xs};
`;

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export function MessageInput({
  value,
  onChange,
  onRegenerate,
  isGenerating,
}: MessageInputProps) {
  return (
    <Box css={{ marginBottom: spacing.lg }}>
      <Label>
        <Text variant="caption" color="muted" css={{ fontWeight: 500 }}>
          Commit message
        </Text>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          disabled={isGenerating}
        >
          <Sparkles size={11} />
          {isGenerating ? "Generating…" : "Generate"}
        </Button>
      </Label>

      {isGenerating ? (
        <Flex
          direction="column"
          gap={spacing.xs}
          css={{
            padding: spacing.md,
            borderRadius: radii.md,
            border: "1px solid var(--studio-border)",
            background: "var(--studio-bg-surface)",
            minHeight: "76px",
          }}
        >
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </Flex>
      ) : (
        <Textarea
          size="md"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your changes…"
          autoFocus
          css={{ resize: "none", minHeight: "76px" }}
        />
      )}
    </Box>
  );
}
