import { useState, useEffect } from "react";
import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Terminal, HardDrive, Cpu, Download } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingInput } from "@/pages/settings/components/setting-input";
import { Text, Badge } from "@/components/shared/ui";
import { useAiProvidersQuery } from "@/api/hooks/ai";
import {
  useGlobalSettingsQuery,
  useUpdateGlobalSettings,
} from "@/api/hooks/settings";

/** Per-provider-id icon with a generic fallback for unknown providers. */
const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  "claude-cli": <Terminal size={18} />,
  ollama: <Cpu size={18} />,
};

/** Human copy per provider id. Unknown providers render the default copy. */
const PROVIDER_COPY: Record<string, string> = {
  "claude-cli": "Uses your local Claude Code installation.",
  ollama: "Runs local open-source models via Ollama. Requires Ollama daemon.",
};

const Card = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid
    ${(p) => (p.active ? "var(--studio-accent)" : "var(--studio-border)")};
  border-radius: 10px;
  background: ${(p) =>
    p.active ? "var(--studio-bg-hover)" : "var(--studio-bg-surface)"};
  text-align: left;
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;

  &:hover {
    border-color: var(--studio-border-hover);
  }
`;

const IconBox = styled.div<{ active: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${(p) =>
    p.active ? "var(--studio-text-primary)" : "var(--studio-text-secondary)"};
`;

interface ProviderSectionProps {
  provider: string;
  onProviderChange: (id: string) => void;
}

export function ProviderSection({
  provider,
  onProviderChange,
}: ProviderSectionProps) {
  const { data: providers = [] } = useAiProvidersQuery();

  return (
    <>
      <SettingsSection
        title="Provider"
        description="The AI provider powering code generation and chat."
      >
        <Flex direction="column" gap="8px" css={{ padding: "14px 16px" }}>
          {providers.length === 0 ? (
            <Text
              css={{ fontSize: "13px", color: "var(--studio-text-muted)" }}
            >
              No providers registered.
            </Text>
          ) : (
            providers.map((p) => {
              const active = p.id === provider;
              return (
                <Card
                  key={p.id}
                  active={active}
                  onClick={() => onProviderChange(p.id)}
                  type="button"
                >
                  <IconBox active={active}>
                    {PROVIDER_ICONS[p.id] ?? <Cpu size={18} />}
                  </IconBox>
                  <Box css={{ flex: 1, minWidth: 0 }}>
                    <Flex align="center" gap="8px">
                      <Text
                        css={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--studio-text-primary)",
                        }}
                      >
                        {p.name}
                      </Text>
                      {active && (
                        <Badge variant="default" size="sm">
                          Active
                        </Badge>
                      )}
                    </Flex>
                    <Text
                      css={{
                        fontSize: "12px",
                        color: "var(--studio-text-muted)",
                        marginTop: "3px",
                      }}
                    >
                      {PROVIDER_COPY[p.id] ??
                        "Custom AI provider registered by the app."}
                    </Text>
                  </Box>
                </Card>
              );
            })
          )}
        </Flex>
      </SettingsSection>

      {provider === "ollama" && <OllamaEndpointSection />}

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
                Model downloads
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
              In-app downloads for Llama, Codestral, Qwen, and others. For now,
              pull models directly via <code>ollama pull &lt;name&gt;</code>.
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
            In-app downloads will appear here
          </Flex>
        </Flex>
      </SettingsSection>
    </>
  );
}

/**
 * Endpoint URL input for the Ollama daemon. Global setting — one
 * Ollama instance per machine, shared across projects. Commits on
 * blur so users aren't fighting a mutation on every keystroke.
 */
function OllamaEndpointSection() {
  const { data: globalSettings } = useGlobalSettingsQuery();
  const updateGlobal = useUpdateGlobalSettings();
  const saved =
    (globalSettings?.["ai.ollamaEndpoint"] as string | undefined) ??
    "http://localhost:11434";
  const [draft, setDraft] = useState(saved);

  // Pick up external changes (another window, manual DB edit).
  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  return (
    <SettingsSection
      title="Ollama endpoint"
      description="HTTP URL of the Ollama daemon. Defaults to http://localhost:11434."
    >
      <Box css={{ padding: "14px 16px" }}>
        <SettingInput
          value={draft}
          size="lg"
          placeholder="http://localhost:11434"
          onChange={(v) => setDraft(String(v))}
          onBlur={(v) => {
            const next = String(v).trim();
            if (next && next !== saved) {
              updateGlobal.mutate({ "ai.ollamaEndpoint": next });
            }
          }}
        />
        <Text
          css={{
            fontSize: "12px",
            color: "var(--studio-text-muted)",
            marginTop: "8px",
          }}
        >
          Changes take effect on the next message.
        </Text>
      </Box>
    </SettingsSection>
  );
}
