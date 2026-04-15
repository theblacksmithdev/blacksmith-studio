import { Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Monitor, Sun, Moon } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";

const THEMES = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
`;

const Card = styled.button<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 10px;
  border-radius: 10px;
  border: 1.5px solid
    ${(p) => (p.active ? "var(--studio-accent)" : "var(--studio-border)")};
  background: ${(p) =>
    p.active ? "var(--studio-bg-hover)" : "var(--studio-bg-surface)"};
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  &:hover {
    border-color: var(--studio-border-hover);
  }
`;

const IconBox = styled.div<{ active: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) =>
    p.active ? "var(--studio-accent)" : "var(--studio-bg-main)"};
  color: ${(p) =>
    p.active ? "var(--studio-accent-fg)" : "var(--studio-text-muted)"};
  border: 1px solid
    ${(p) => (p.active ? "var(--studio-accent)" : "var(--studio-border)")};
  transition: all 0.15s ease;
`;

const Label = styled.span<{ active: boolean }>`
  font-size: 13px;
  font-weight: ${(p) => (p.active ? 600 : 400)};
  color: ${(p) =>
    p.active ? "var(--studio-text-primary)" : "var(--studio-text-muted)"};
`;

type ThemeSetting = "light" | "dark" | "system";

interface ThemeSelectorProps {
  theme: ThemeSetting;
  onThemeChange: (value: ThemeSetting) => void;
}

export function ThemeSelector({ theme, onThemeChange }: ThemeSelectorProps) {
  return (
    <SettingsSection
      title="Theme"
      description="Choose how Blacksmith Studio looks."
    >
      <Box css={{ padding: "14px 16px" }}>
        <Grid>
          {THEMES.map((t) => {
            const Icon = t.icon;
            const active = theme === t.value;
            return (
              <Card
                key={t.value}
                active={active}
                onClick={() => onThemeChange(t.value)}
              >
                <IconBox active={active}>
                  <Icon size={18} />
                </IconBox>
                <Label active={active}>{t.label}</Label>
              </Card>
            );
          })}
        </Grid>
      </Box>
    </SettingsSection>
  );
}
