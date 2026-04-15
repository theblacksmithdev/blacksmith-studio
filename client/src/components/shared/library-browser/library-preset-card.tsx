import { Flex, Box } from "@chakra-ui/react";
import { Check, type LucideIcon } from "lucide-react";
import { Text, Badge } from "@/components/shared/ui";

interface LibraryPresetCardProps {
  icon: LucideIcon;
  label: string;
  name: string;
  description: string;
  category: string;
  installed: boolean;
  hint?: string;
  onClick: () => void;
}

export function LibraryPresetCard({
  icon: Icon,
  label,
  name,
  description,
  category,
  installed,
  hint,
  onClick,
}: LibraryPresetCardProps) {
  return (
    <Flex
      direction="column"
      as="button"
      onClick={installed ? undefined : onClick}
      css={{
        padding: "18px",
        borderRadius: "12px",
        border: "1px solid var(--studio-border)",
        background: "var(--studio-bg-sidebar)",
        cursor: installed ? "default" : "pointer",
        transition: "all 0.15s ease",
        textAlign: "left",
        fontFamily: "inherit",
        "&:hover": installed
          ? {}
          : {
              borderColor: "var(--studio-border-hover)",
              background: "var(--studio-bg-surface)",
              transform: "translateY(-1px)",
              boxShadow: "var(--studio-shadow)",
            },
      }}
    >
      {/* Top */}
      <Flex align="center" gap="10px" css={{ marginBottom: "10px" }}>
        <Flex
          align="center"
          justify="center"
          css={{
            width: "34px",
            height: "34px",
            borderRadius: "9px",
            background: "var(--studio-bg-main)",
            border: "1px solid var(--studio-border)",
            color: installed
              ? "var(--studio-text-muted)"
              : "var(--studio-text-secondary)",
            flexShrink: 0,
          }}
        >
          <Icon size={16} />
        </Flex>
        <Box css={{ flex: 1, minWidth: 0 }}>
          <Text
            css={{
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: installed
                ? "var(--studio-text-tertiary)"
                : "var(--studio-text-primary)",
            }}
          >
            {label}
          </Text>
          <Text
            css={{
              fontSize: "11px",
              color: "var(--studio-text-muted)",
              fontFamily: "'SF Mono', monospace",
            }}
          >
            {name}
          </Text>
        </Box>
        {installed && (
          <Flex
            align="center"
            gap="3px"
            css={{
              padding: "2px 7px",
              borderRadius: "5px",
              background: "var(--studio-bg-hover)",
              flexShrink: 0,
            }}
          >
            <Check size={10} style={{ color: "var(--studio-text-muted)" }} />
            <Text
              css={{
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--studio-text-muted)",
              }}
            >
              Added
            </Text>
          </Flex>
        )}
      </Flex>

      {/* Description */}
      <Text
        css={{
          fontSize: "13px",
          lineHeight: 1.6,
          flex: 1,
          color: installed
            ? "var(--studio-text-muted)"
            : "var(--studio-text-tertiary)",
        }}
      >
        {description}
      </Text>

      {hint && !installed && (
        <Text
          css={{
            fontSize: "11px",
            color: "var(--studio-text-muted)",
            fontStyle: "italic",
            marginTop: "6px",
          }}
        >
          {hint}
        </Text>
      )}

      {/* Footer */}
      <Flex
        align="center"
        justify="space-between"
        css={{
          marginTop: "14px",
          paddingTop: "10px",
          borderTop: "1px solid var(--studio-border)",
        }}
      >
        <Badge variant="default" size="sm">
          {category}
        </Badge>
        {!installed && (
          <Text
            css={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--studio-accent)",
            }}
          >
            Add to project
          </Text>
        )}
      </Flex>
    </Flex>
  );
}
