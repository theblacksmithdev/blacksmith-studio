import { Flex } from "@chakra-ui/react";
import { Circle } from "lucide-react";
import { Text, spacing } from "@/components/shared/ui";
import { useThemeMode } from "@/hooks/use-theme-mode";

interface StatusBarProps {
  lineCount: number;
  language: string;
  isChanged: boolean;
  saving?: boolean;
}

export function StatusBar({
  lineCount,
  language,
  isChanged,
  saving,
}: StatusBarProps) {
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <Flex
      align="center"
      justify="space-between"
      css={{
        padding: `3px ${spacing.md}`,
        borderTop: "1px solid var(--studio-border)",
        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
        flexShrink: 0,
      }}
    >
      <Text variant="tiny" color="muted">
        {lineCount} lines
      </Text>

      <Flex align="center" gap={spacing.md}>
        {saving ? (
          <Text variant="tiny" color="muted">
            Saving...
          </Text>
        ) : isChanged ? (
          <Flex align="center" gap={spacing.xs}>
            <Circle
              size={5}
              fill="var(--studio-warning)"
              style={{ color: "var(--studio-warning)" }}
            />
            <Text variant="tiny" css={{ color: "var(--studio-warning)" }}>
              Modified
            </Text>
          </Flex>
        ) : null}
        <Text
          variant="tiny"
          color="muted"
          css={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          {language}
        </Text>
        <Text variant="tiny" color="muted">
          UTF-8
        </Text>
      </Flex>
    </Flex>
  );
}
