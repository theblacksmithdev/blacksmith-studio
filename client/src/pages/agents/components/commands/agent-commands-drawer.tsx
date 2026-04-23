import { useState } from "react";
import styled from "@emotion/styled";
import { Terminal } from "lucide-react";
import { Drawer } from "@/components/shared/ui";
import { useCommandRunsQuery } from "@/api/hooks/commands";
import { CommandRunRow, CommandRunDetail } from "@/components/commands";

interface AgentCommandsDrawerProps {
  conversationId: string;
  onClose: () => void;
}

export function AgentCommandsDrawer({
  conversationId,
  onClose,
}: AgentCommandsDrawerProps) {
  const { data: runs = [] } = useCommandRunsQuery({
    conversationId,
    limit: 200,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const count = runs.length;

  return (
    <Drawer
      title="Agent commands"
      subtitle={
        count > 0
          ? `${count} run${count === 1 ? "" : "s"} in this conversation`
          : undefined
      }
      onClose={onClose}
      placement="end"
      size="xl"
      noPadding
    >
      {count === 0 ? (
        <Empty>
          <EmptyIcon>
            <Terminal size={22} />
          </EmptyIcon>
          <EmptyTitle>No commands yet</EmptyTitle>
          <EmptyBody>
            Subprocesses agents spawn via the <Mono>run_command</Mono> MCP tool
            appear here — stdout, stderr, and the resolved environment for each
            run.
          </EmptyBody>
        </Empty>
      ) : (
        <Split>
          <ListPane>
            {runs.map((run) => (
              <CommandRunRow
                key={run.id}
                run={run}
                selected={run.id === selectedId}
                onOpen={setSelectedId}
              />
            ))}
          </ListPane>
          <DetailPane>
            <CommandRunDetail
              runId={selectedId}
              onClose={
                selectedId ? () => setSelectedId(null) : undefined
              }
            />
          </DetailPane>
        </Split>
      )}
    </Drawer>
  );
}

const Split = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const ListPane = styled.div`
  width: 320px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid var(--studio-border);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailPane = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  background: var(--studio-bg-main);
`;

const Empty = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
  padding: 40px 32px;
`;

const EmptyIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-muted);
`;

const EmptyTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--studio-text-primary);
`;

const EmptyBody = styled.div`
  font-size: 12px;
  color: var(--studio-text-muted);
  max-width: 320px;
  line-height: 1.5;
`;

const Mono = styled.code`
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  font-size: 11px;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
`;
