import { Flex, Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import {
  Zap,
  Trash2,
  Check,
  Loader2,
  Server,
  Globe,
  MoreVertical,
} from "lucide-react";
import { Text, Alert, Menu, IconButton, Badge } from "@/components/shared/ui";
import type { MenuOption } from "@/components/shared/ui";
import { SettingToggle } from "@/pages/settings/components/setting-toggle";
import { useMcpServerItem } from "../hooks/use-mcp-server-item";
import type { McpServerEntry } from "@/api/modules/mcp";

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const MONO = "'SF Mono', 'Fira Code', monospace";

type ServerStatus = "on" | "off" | "error";

const statusColor: Record<ServerStatus, string> = {
  on: "var(--studio-green)",
  error: "var(--studio-error)",
  off: "var(--studio-text-muted)",
};

function getServerMeta(entry: McpServerEntry): string {
  if (entry.transport === "http") return (entry.config as any).url || "";
  const cfg = entry.config as any;
  return [cfg.command, ...(cfg.args || [])].join(" ");
}

function getStatus(entry: McpServerEntry): ServerStatus {
  if (!entry.enabled) return "off";
  if (entry.status === "error") return "error";
  return "on";
}

const Row = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid var(--studio-border);
  background: transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: inherit;
  transition: background 0.12s ease;

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: var(--studio-bg-surface);
  }
`;

interface McpServerRowProps {
  entry: McpServerEntry;
  onEdit: () => void;
  onDelete: () => void;
}

export function McpServerRow({ entry, onEdit, onDelete }: McpServerRowProps) {
  const { isTesting, testResult, toggle, test, clearTestResult } =
    useMcpServerItem(entry);
  const status = getStatus(entry);
  const TransportIcon = entry.transport === "http" ? Globe : Server;

  const menuOptions: MenuOption[] = [
    { icon: <Zap />, label: "Test Connection", onClick: test },
    {
      icon: <Trash2 />,
      label: "Remove",
      onClick: onDelete,
      danger: true,
      separator: true,
    },
  ];

  return (
    <Flex
      direction="column"
      css={{
        borderBottom: "1px solid var(--studio-border)",
        opacity: entry.enabled ? 1 : 0.5,
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Row onClick={onEdit} style={{ opacity: entry.enabled ? 1 : 0.5 }}>
        <Box
          css={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            flexShrink: 0,
            background: statusColor[status],
          }}
        />

        <TransportIcon
          size={14}
          style={{ color: "var(--studio-text-muted)", flexShrink: 0 }}
        />

        <Flex direction="column" css={{ flex: 1, minWidth: 0, gap: "1px" }}>
          <Flex align="center" gap="6px">
            <Text
              css={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--studio-text-primary)",
              }}
            >
              {entry.name}
            </Text>
            <Badge variant="default" size="sm">
              {entry.transport}
            </Badge>
            {isTesting && (
              <Flex
                align="center"
                gap="4px"
                css={{ color: "var(--studio-text-muted)" }}
              >
                <Loader2
                  size={10}
                  style={{ animation: `${spin} 0.8s linear infinite` }}
                />
                <Text
                  css={{ fontSize: "11px", color: "var(--studio-text-muted)" }}
                >
                  Testing...
                </Text>
              </Flex>
            )}
            {!isTesting && testResult?.ok && (
              <Flex
                align="center"
                gap="3px"
                css={{ color: "var(--studio-green)" }}
              >
                <Check size={11} />
                <Text css={{ fontSize: "11px", color: "var(--studio-green)" }}>
                  Connected
                </Text>
              </Flex>
            )}
          </Flex>
          <Text
            css={{
              fontSize: "11px",
              color: "var(--studio-text-tertiary)",
              fontFamily: MONO,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {getServerMeta(entry)}
          </Text>
        </Flex>

        <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <Menu
            trigger={
              <IconButton variant="ghost" size="xs" aria-label="Options">
                <MoreVertical size={14} />
              </IconButton>
            }
            options={menuOptions}
          />
        </Box>
        <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <SettingToggle value={entry.enabled} onChange={toggle} />
        </Box>
      </Row>

      {!isTesting && testResult && !testResult.ok && (
        <Box css={{ padding: "0 16px 12px 42px" }}>
          <Alert variant="error" onDismiss={clearTestResult}>
            {testResult.error || "Connection failed"}
          </Alert>
        </Box>
      )}
    </Flex>
  );
}
