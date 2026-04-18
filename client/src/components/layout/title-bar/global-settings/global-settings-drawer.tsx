import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { ArrowUpRight, Boxes } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Drawer, Text } from "@/components/shared/ui";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { settingsEnvironmentsPath } from "@/router/paths";

const Section = styled.div`
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GoBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 38px;
  padding: 0 14px;
  border-radius: 9px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-primary);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-hover);
  }
`;

interface GlobalSettingsDrawerProps {
  onClose: () => void;
}

/**
 * Legacy entry point — the drawer used to host Node/Python path
 * pickers of its own. Everything env-related now lives in
 * Settings → Environments so there's one mental model (project vs.
 * global scope toggle) and one API backing it.
 *
 * This shortcut keeps the title-bar muscle memory: click the icon,
 * land on the global defaults view.
 */
export function GlobalSettingsDrawer({ onClose }: GlobalSettingsDrawerProps) {
  const navigate = useNavigate();
  const projectId = useActiveProjectId();

  const handleGo = () => {
    if (projectId) {
      navigate(settingsEnvironmentsPath(projectId, "global"));
    }
    onClose();
  };

  return (
    <Drawer
      title="Global Settings"
      subtitle="Defaults for all projects. Edit them in the Environments panel."
      onClose={onClose}
      size="sm"
    >
      <Flex direction="column" gap="14px">
        <Section>
          <Flex align="center" gap="8px">
            <Boxes size={14} style={{ color: "var(--studio-text-muted)" }} />
            <Text
              css={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--studio-text-primary)",
              }}
            >
              Environments
            </Text>
          </Flex>
          <Text
            css={{
              fontSize: "12px",
              color: "var(--studio-text-tertiary)",
              lineHeight: 1.5,
            }}
          >
            Pin default Node.js and Python interpreters for every project,
            or manage the shared Blacksmith studio venv.
          </Text>
          <GoBtn onClick={handleGo} disabled={!projectId}>
            Open Environments
            <ArrowUpRight size={14} />
          </GoBtn>
        </Section>
      </Flex>
    </Drawer>
  );
}
