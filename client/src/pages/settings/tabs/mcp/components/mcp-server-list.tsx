import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { McpServerRow } from "./mcp-server-row";
import type { McpServerEntry } from "@/api/modules/mcp";

const List = styled.div`
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  overflow: hidden;
  background: var(--studio-bg-sidebar);
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
`;

const FooterLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 0;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.12s ease;
  &:hover {
    color: var(--studio-text-primary);
  }
`;

const CountLabel = styled.span`
  font-size: 12px;
  color: var(--studio-text-muted);
`;

interface McpServerListProps {
  servers: McpServerEntry[];
  browsePath: string;
  onEdit: (server: McpServerEntry) => void;
  onDelete: (name: string) => void;
}

export function McpServerList({
  servers,
  browsePath,
  onEdit,
  onDelete,
}: McpServerListProps) {
  const enabledCount = servers.filter((s) => s.enabled).length;

  return (
    <>
      <List>
        {servers.map((entry) => (
          <McpServerRow
            key={entry.name}
            entry={entry}
            onEdit={() => onEdit(entry)}
            onDelete={() => onDelete(entry.name)}
          />
        ))}
      </List>
      <Footer>
        <CountLabel>
          {enabledCount} of {servers.length} server
          {servers.length !== 1 ? "s" : ""} enabled
        </CountLabel>
        <FooterLink to={browsePath}>
          Browse library <ArrowRight size={11} />
        </FooterLink>
      </Footer>
    </>
  );
}
