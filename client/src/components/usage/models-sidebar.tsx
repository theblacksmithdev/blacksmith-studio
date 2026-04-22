import styled from "@emotion/styled";
import type { ModelRollup, UsageHistory } from "@/api/modules/usage";
import { formatTokens } from "./format";

interface ModelsSidebarProps {
  history: UsageHistory;
  selectedModel: string | null;
  onSelect: (modelId: string | null) => void;
}

/**
 * Left-rail navigation for the usage page. "All" sits at the top with
 * the overall total; each model that has recorded usage gets its own
 * row sorted by spend. Selection drives what the detail pane renders.
 */
export function ModelsSidebar({
  history,
  selectedModel,
  onSelect,
}: ModelsSidebarProps) {
  const maxUsage = history.byModel.reduce(
    (max, m) => Math.max(max, m.total),
    0,
  );

  return (
    <Root>
      <Header>
        <Title>Usage</Title>
        <Subtitle>Tokens by model</Subtitle>
      </Header>

      <List>
        <AllRow
          data-active={selectedModel === null || undefined}
          onClick={() => onSelect(null)}
        >
          <RowMark data-active={selectedModel === null || undefined} />
          <RowMain>
            <RowLabel>All models</RowLabel>
            <RowMeta>
              {history.byModel.length} model
              {history.byModel.length === 1 ? "" : "s"}
            </RowMeta>
          </RowMain>
          <RowValue>{formatTokens(history.total)}</RowValue>
        </AllRow>

        {history.byModel.length === 0 ? (
          <Empty>No usage recorded yet.</Empty>
        ) : (
          history.byModel.map((m) => (
            <ModelRow
              key={modelKey(m)}
              history={history}
              model={m}
              maxUsage={maxUsage}
              selected={selectedModel === (m.model ?? "")}
              onSelect={() => onSelect(m.model ?? "")}
            />
          ))
        )}
      </List>
    </Root>
  );
}

function modelKey(m: ModelRollup): string {
  return m.model ?? "__unknown__";
}

interface ModelRowProps {
  history: UsageHistory;
  model: ModelRollup;
  maxUsage: number;
  selected: boolean;
  onSelect: () => void;
}

function ModelRow({ model, maxUsage, selected, onSelect }: ModelRowProps) {
  const pct = maxUsage > 0 ? model.total / maxUsage : 0;
  return (
    <Row data-active={selected || undefined} onClick={onSelect}>
      <RowMark data-active={selected || undefined} />
      <RowMain>
        <RowLabel>{model.label}</RowLabel>
        <RowMeta>
          <ProviderText>{model.provider}</ProviderText>
          <MetaDot />
          <ShareBar>
            <ShareFill style={{ width: `${Math.round(pct * 100)}%` }} />
          </ShareBar>
        </RowMeta>
      </RowMain>
      <RowValue>{formatTokens(model.total)}</RowValue>
    </Row>
  );
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  background: var(--studio-bg-sidebar);
  border-right: 1px solid var(--studio-border);
`;

const Header = styled.div`
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--studio-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--studio-text-primary);
`;

const Subtitle = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
`;

const List = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const baseRow = `
  all: unset;
  display: grid;
  grid-template-columns: 3px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 12px 10px 8px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--studio-text-secondary);
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }

  &[data-active] {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`;

const Row = styled.button`
  ${baseRow}
`;

const AllRow = styled.button`
  ${baseRow}
  margin-bottom: 4px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--studio-border);
  border-radius: 8px 8px 0 0;
`;

const RowMark = styled.span`
  width: 3px;
  height: 22px;
  border-radius: 2px;
  background: transparent;
  transition: background 0.12s ease;

  &[data-active] {
    background: var(--studio-brand);
  }
`;

const RowMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const RowLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--studio-text-muted);
  min-width: 0;
`;

const ProviderText = styled.span`
  text-transform: capitalize;
`;

const MetaDot = styled.span`
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: var(--studio-text-muted);
  opacity: 0.5;
  flex-shrink: 0;
`;

const ShareBar = styled.span`
  flex: 1;
  height: 2px;
  border-radius: 1px;
  background: var(--studio-bg-hover);
  overflow: hidden;
  min-width: 24px;
  max-width: 72px;
`;

const ShareFill = styled.span`
  display: block;
  height: 100%;
  background: var(--studio-text-muted);
  transition: width 0.2s ease;
`;

const RowValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--studio-text-primary);
  font-variant-numeric: tabular-nums;
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
`;

const Empty = styled.div`
  padding: 16px 12px;
  font-size: 12px;
  color: var(--studio-text-muted);
`;
