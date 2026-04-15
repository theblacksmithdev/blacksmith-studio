import { Flex } from "@chakra-ui/react";
import { spacing, radii } from "@/components/shared/ui";

export type ConfigTab = "config" | "env";

interface DrawerTabsProps {
  active: ConfigTab;
  onChange: (tab: ConfigTab) => void;
  envCount: number;
}

export function DrawerTabs({ active, onChange, envCount }: DrawerTabsProps) {
  const tabs: { id: ConfigTab; label: string }[] = [
    { id: "config", label: "Configuration" },
    { id: "env", label: `Environment${envCount > 0 ? ` (${envCount})` : ""}` },
  ];

  return (
    <Flex gap={spacing.xs} css={{ marginBottom: spacing.xl }}>
      {tabs.map((t) => (
        <Flex
          as="button"
          key={t.id}
          align="center"
          onClick={() => onChange(t.id)}
          css={{
            padding: `${spacing.xs} ${spacing.md}`,
            borderRadius: radii.md,
            border: "none",
            background:
              active === t.id ? "var(--studio-bg-hover)" : "transparent",
            color:
              active === t.id
                ? "var(--studio-text-primary)"
                : "var(--studio-text-muted)",
            fontWeight: active === t.id ? 500 : 400,
            fontSize: "13px",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.1s ease",
            "&:hover": { color: "var(--studio-text-secondary)" },
          }}
        >
          {t.label}
        </Flex>
      ))}
    </Flex>
  );
}
