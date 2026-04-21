import { Flex } from "@chakra-ui/react";
import { HardDrive, Download } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { Text, Badge } from "@/components/shared/ui";

/**
 * Placeholder for the (not-yet-shipped) on-device model flow. Lives
 * alongside the provider + picker so the "pick a model" surface is
 * one contiguous page.
 */
export function LocalModelsSection() {
  return (
    <SettingsSection
      title="Local Models"
      description="Download and run open-source LLMs on your machine. Code with AI for free, forever — no API keys, no cloud, fully private."
    >
      <Flex
        direction="column"
        align="center"
        gap="12px"
        css={{ padding: "28px 20px", textAlign: "center" }}
      >
        <Flex
          align="center"
          justify="center"
          css={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "var(--studio-bg-surface)",
            border: "1px solid var(--studio-border)",
            color: "var(--studio-text-muted)",
          }}
        >
          <HardDrive size={22} />
        </Flex>
        <Flex direction="column" gap="4px" align="center">
          <Flex align="center" gap="8px">
            <Text
              css={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--studio-text-primary)",
              }}
            >
              On-device AI
            </Text>
            <Badge variant="default" size="sm">
              Coming Soon
            </Badge>
          </Flex>
          <Text
            css={{
              fontSize: "13px",
              color: "var(--studio-text-tertiary)",
              lineHeight: 1.5,
              maxWidth: "380px",
            }}
          >
            Download models like Llama, Codestral, and Qwen directly to your
            machine. Run them locally with full tool access — no internet
            required.
          </Text>
        </Flex>
        <Flex
          align="center"
          gap="6px"
          css={{
            marginTop: "4px",
            padding: "7px 16px",
            borderRadius: "8px",
            background: "var(--studio-bg-surface)",
            border: "1px solid var(--studio-border)",
            color: "var(--studio-text-muted)",
            fontSize: "12px",
            fontWeight: 500,
          }}
        >
          <Download size={12} />
          Model downloads will appear here
        </Flex>
      </Flex>
    </SettingsSection>
  );
}
