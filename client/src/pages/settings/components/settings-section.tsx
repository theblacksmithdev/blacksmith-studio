import { Flex, Box } from "@chakra-ui/react";
import { RotateCw } from "lucide-react";
import type { ReactNode } from "react";
import { Text, Badge } from "@/components/shared/ui";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  /** Optional count badge next to the title */
  badge?: number;
  onReset?: () => void;
}

export function SettingsSection({
  title,
  description,
  children,
  badge,
  onReset,
}: SettingsSectionProps) {
  return (
    <Box>
      <Flex
        justify="space-between"
        align="flex-start"
        css={{ marginBottom: "14px" }}
      >
        <Box css={{ flex: 1 }}>
          <Flex align="center" gap="8px" css={{ marginBottom: "4px" }}>
            <Text
              css={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--studio-text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </Text>
            {badge !== undefined && badge > 0 && (
              <Badge variant="default" size="sm">
                {badge}
              </Badge>
            )}
          </Flex>
          <Text
            css={{
              fontSize: "13px",
              color: "var(--studio-text-tertiary)",
              lineHeight: 1.5,
            }}
          >
            {description}
          </Text>
        </Box>
        {onReset && (
          <Flex
            as="button"
            align="center"
            gap="5px"
            onClick={onReset}
            css={{
              padding: "4px 10px",
              borderRadius: "6px",
              border: "none",
              background: "transparent",
              color: "var(--studio-text-muted)",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.12s ease",
              flexShrink: 0,
              marginTop: "2px",
              "&:hover": {
                background: "var(--studio-bg-surface)",
                color: "var(--studio-text-secondary)",
              },
            }}
          >
            <RotateCw size={11} />
            Reset
          </Flex>
        )}
      </Flex>
      <Flex
        direction="column"
        css={{
          borderRadius: "10px",
          border: "1px solid var(--studio-border)",
          overflow: "hidden",
          background: "var(--studio-bg-sidebar)",
        }}
      >
        {children}
      </Flex>
    </Box>
  );
}
