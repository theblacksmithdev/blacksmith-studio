import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { FileCode, FileText, FilePlus, Pencil, Folder } from "lucide-react";
import { useAgentArtifactsQuery } from "@/api/hooks/agents";
import { Text, Badge, Skeleton } from "@/components/shared/ui";
import { ROLE_ICONS } from "../shared/role-icons";
import type { AgentRole } from "@/api/types";

const List = styled.div`
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  overflow: hidden;
  background: var(--studio-bg-sidebar);
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--studio-border);
  transition: background 0.1s ease;

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: var(--studio-bg-surface);
  }
`;

const MONO = "'SF Mono', 'Fira Code', monospace";

function toolIcon(tool: string) {
  if (tool === "Write")
    return <FilePlus size={13} style={{ color: "var(--studio-green)" }} />;
  if (tool === "Edit")
    return <Pencil size={13} style={{ color: "var(--studio-text-muted)" }} />;
  return <FileText size={13} style={{ color: "var(--studio-text-muted)" }} />;
}

function fileName(path: string): string {
  return path.split("/").pop() || path;
}

function dirName(path: string): string {
  const parts = path.split("/");
  return parts.length > 1 ? parts.slice(0, -1).join("/") : "";
}

interface AgentArtifactsProps {
  conversationId?: string;
}

export function AgentArtifacts({ conversationId }: AgentArtifactsProps) {
  const { data: artifacts = [], isLoading } =
    useAgentArtifactsQuery(conversationId);

  if (!conversationId) {
    return <ArtifactsEmpty message="Start a conversation to see artifacts" />;
  }

  if (isLoading) {
    return (
      <Flex direction="column" gap="8px" css={{ padding: "24px" }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="40%" />
      </Flex>
    );
  }

  if (artifacts.length === 0) {
    return (
      <ArtifactsEmpty message="Files created and modified by agents will appear here as they work" />
    );
  }

  const writeCount = artifacts.filter((a) => a.tool === "Write").length;
  const editCount = artifacts.filter((a) => a.tool === "Edit").length;

  return (
    <Flex
      direction="column"
      gap="14px"
      css={{ padding: "20px", overflowY: "auto", height: "100%" }}
    >
      <Flex align="center" gap="8px">
        <Text
          css={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--studio-text-primary)",
          }}
        >
          Changed Files
        </Text>
        <Badge variant="default" size="sm">
          {artifacts.length}
        </Badge>
        {writeCount > 0 && (
          <Badge variant="default" size="sm">
            {writeCount} created
          </Badge>
        )}
        {editCount > 0 && (
          <Badge variant="default" size="sm">
            {editCount} edited
          </Badge>
        )}
      </Flex>

      <List>
        {artifacts.map((a) => {
          const RoleIcon = ROLE_ICONS[a.role as AgentRole];
          return (
            <Row key={a.path}>
              {toolIcon(a.tool)}
              <Box css={{ flex: 1, minWidth: 0 }}>
                <Text
                  css={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--studio-text-primary)",
                    fontFamily: MONO,
                  }}
                >
                  {fileName(a.path)}
                </Text>
                {dirName(a.path) && (
                  <Flex align="center" gap="4px" css={{ marginTop: "1px" }}>
                    <Folder
                      size={10}
                      style={{ color: "var(--studio-text-muted)" }}
                    />
                    <Text
                      css={{
                        fontSize: "11px",
                        color: "var(--studio-text-muted)",
                        fontFamily: MONO,
                      }}
                    >
                      {dirName(a.path)}
                    </Text>
                  </Flex>
                )}
              </Box>
              {RoleIcon && (
                <Flex align="center" gap="4px" css={{ flexShrink: 0 }}>
                  <RoleIcon
                    size={11}
                    style={{ color: "var(--studio-text-muted)" }}
                  />
                  <Text
                    css={{
                      fontSize: "11px",
                      color: "var(--studio-text-muted)",
                      textTransform: "capitalize",
                    }}
                  >
                    {a.role.replace(/-/g, " ")}
                  </Text>
                </Flex>
              )}
            </Row>
          );
        })}
      </List>
    </Flex>
  );
}

function ArtifactsEmpty({ message }: { message: string }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="14px"
      css={{ flex: 1, padding: "40px 24px", textAlign: "center" }}
    >
      <Flex
        css={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "var(--studio-bg-surface)",
          border: "1px solid var(--studio-border)",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--studio-text-muted)",
        }}
      >
        <FileCode size={22} />
      </Flex>
      <Flex direction="column" gap="4px" align="center">
        <Text
          css={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--studio-text-primary)",
          }}
        >
          Artifacts
        </Text>
        <Text
          css={{
            fontSize: "13px",
            color: "var(--studio-text-tertiary)",
            maxWidth: "300px",
            lineHeight: 1.6,
          }}
        >
          {message}
        </Text>
      </Flex>
    </Flex>
  );
}
