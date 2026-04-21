import styled from "@emotion/styled";
import type { ModelEntry } from "@/api/modules/ai";
import { formatWindow, groupByFamily } from "./helpers";

interface ModelGridProps {
  models: ModelEntry[];
  value: string | null | undefined;
  onChange: (id: string) => void;
}

/**
 * Grid variant — used in settings. One column per family with hairline
 * separators; each row is a slim card with left-edge accent when
 * selected, primary label, meta line, and a right-aligned context
 * window chip. Designed to read like a tidy spec sheet rather than a
 * button cluster.
 */
export function ModelGrid({ models, value, onChange }: ModelGridProps) {
  const groups = groupByFamily(models);

  return (
    <Wrap>
      {groups.map((group) => (
        <Group key={group.family}>
          <GroupHeader>
            <GroupTitle>{group.family}</GroupTitle>
            <GroupRule />
            <GroupCount>
              {group.entries.length} option
              {group.entries.length === 1 ? "" : "s"}
            </GroupCount>
          </GroupHeader>
          <Rows>
            {group.entries.map((m) => {
              const selected = value === m.id;
              return (
                <Row
                  key={m.id}
                  data-active={selected || undefined}
                  data-legacy={m.legacy || undefined}
                  onClick={() => onChange(m.id)}
                >
                  <RowMark data-active={selected || undefined} />
                  <RowMain>
                    <RowTitleLine>
                      <RowLabel>{m.label}</RowLabel>
                      {m.variant && <Variant>{m.variant.toUpperCase()}</Variant>}
                      {m.legacy && <LegacyTag>Legacy</LegacyTag>}
                    </RowTitleLine>
                    <RowMeta>
                      <RowVersion>v{m.version}</RowVersion>
                      <MetaDot />
                      <RowProvider>{m.provider}</RowProvider>
                    </RowMeta>
                  </RowMain>
                  <RowWindow>{formatWindow(m.contextWindow)}</RowWindow>
                </Row>
              );
            })}
          </Rows>
        </Group>
      ))}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 2px;
`;

const GroupTitle = styled.span`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--studio-text-secondary);
`;

const GroupRule = styled.span`
  flex: 1;
  height: 1px;
  background: var(--studio-border);
`;

const GroupCount = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Row = styled.button`
  all: unset;
  position: relative;
  display: grid;
  grid-template-columns: 3px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 12px 14px 12px 10px;
  border-radius: 10px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-secondary);
  cursor: pointer;
  transition:
    background 0.12s ease,
    border-color 0.12s ease,
    color 0.12s ease,
    transform 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }

  &:active {
    transform: translateY(0.5px);
  }

  &[data-active] {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
    box-shadow: 0 0 0 1px var(--studio-border-hover);
  }

  &[data-legacy]:not([data-active]) {
    opacity: 0.72;
  }
`;

const RowMark = styled.span`
  width: 3px;
  height: 24px;
  border-radius: 2px;
  background: transparent;
  transition: background 0.12s ease;

  &[data-active] {
    background: var(--studio-text-primary);
  }
`;

const RowMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

const RowTitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RowLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: inherit;
`;

const Variant = styled.span`
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
`;

const LegacyTag = styled.span`
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--studio-bg-main);
  border: 1px solid var(--studio-border);
  color: var(--studio-text-muted);
`;

const RowMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--studio-text-muted);
`;

const RowVersion = styled.span`
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  font-variant-numeric: tabular-nums;
`;

const MetaDot = styled.span`
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: var(--studio-text-muted);
  opacity: 0.6;
`;

const RowProvider = styled.span`
  text-transform: capitalize;
`;

const RowWindow = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--studio-text-primary);
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  font-variant-numeric: tabular-nums;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--studio-bg-main);
  border: 1px solid var(--studio-border);
  letter-spacing: -0.01em;
`;
