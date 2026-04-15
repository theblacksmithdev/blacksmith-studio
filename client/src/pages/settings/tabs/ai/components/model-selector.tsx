import { Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Sparkles, Zap, Feather } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { MODELS } from "../hooks/use-ai-settings";

const ICONS: Record<string, React.ReactNode> = {
  sonnet: <Zap />,
  opus: <Sparkles />,
  haiku: <Feather />,
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
`;

const Card = styled.button<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  border-radius: 9px;
  border: 1.5px solid
    ${(p) => (p.active ? "var(--studio-accent)" : "var(--studio-border)")};
  background: ${(p) =>
    p.active ? "var(--studio-bg-hover)" : "var(--studio-bg-surface)"};
  color: ${(p) =>
    p.active ? "var(--studio-text-primary)" : "var(--studio-text-muted)"};
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-secondary);
  }

  & svg {
    width: 18px;
    height: 18px;
  }
`;

const Name = styled.span<{ active: boolean }>`
  font-size: 13px;
  font-weight: ${(p) => (p.active ? 600 : 500)};
`;

const Desc = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
`;

interface ModelSelectorProps {
  model: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({ model, onModelChange }: ModelSelectorProps) {
  return (
    <SettingsSection
      title="Model"
      description="Choose which Claude model to use. Each has different speed and capability trade-offs."
    >
      <Box css={{ padding: "14px 16px" }}>
        <Grid>
          {MODELS.map((m) => (
            <Card
              key={m.value}
              active={model === m.value}
              onClick={() => onModelChange(m.value)}
            >
              {ICONS[m.value]}
              <Name active={model === m.value}>{m.label}</Name>
              <Desc>{m.desc}</Desc>
            </Card>
          ))}
        </Grid>
      </Box>
    </SettingsSection>
  );
}
