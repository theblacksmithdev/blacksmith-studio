import { Outlet, useNavigate, useParams } from "react-router-dom";
import styled from "@emotion/styled";
import { SplitPanel } from "@/components/shared/layout";
import { CommandRunList } from "@/components/commands";
import { commandRunPath, commandsPath } from "@/router/paths";

const Root = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
`;

const DetailPanel = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  background: var(--studio-bg-main);
`;

/**
 * Split-panel commands console.
 *
 * Left: `CommandRunList` (search + filters + rows). Right: a nested
 * route outlet — either the empty state or `CommandRunDetail`. URL
 * owns selection so runs deep-link and browser back works.
 */
export default function CommandsLayout() {
  const { projectId = "", runId } = useParams<{
    projectId: string;
    runId?: string;
  }>();
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    navigate(commandRunPath(projectId, id));
  };

  const clearSelection = () => {
    navigate(commandsPath(projectId));
  };

  return (
    <Root>
      <SplitPanel
        left={
          <CommandRunList
            title="Commands"
            selectedId={runId ?? null}
            onSelect={handleSelect}
          />
        }
        defaultWidth={420}
        minWidth={320}
        maxWidth={600}
        storageKey="commands.listWidth"
      >
        <DetailPanel>
          <Outlet context={{ onClose: clearSelection }} />
        </DetailPanel>
      </SplitPanel>
    </Root>
  );
}
