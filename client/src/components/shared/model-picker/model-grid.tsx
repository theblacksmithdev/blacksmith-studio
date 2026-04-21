import { useMemo } from "react";
import styled from "@emotion/styled";
import { RadioGroup } from "@chakra-ui/react";
import { Check } from "lucide-react";
import type { ModelEntry } from "@/api/modules/ai";
import { formatWindow, groupByFamily } from "./helpers";

interface ModelGridProps {
  models: ModelEntry[];
  value: string | null | undefined;
  onChange: (id: string) => void;
}

/**
 * Grid variant — settings-grade model selector.
 *
 * Flat and slim. No shadows or gradients. Selection is a Chakra
 * RadioGroup so the control is a real radio input (accessible,
 * keyboard-navigable); everything else in the row is visual content
 * layered on the item label.
 */
export function ModelGrid({ models, value, onChange }: ModelGridProps) {
  const groups = groupByFamily(models);
  const active = useMemo(
    () => models.find((m) => m.id === value) ?? null,
    [models, value],
  );

  return (
    <Wrap>
      {active && <CurrentPreview entry={active} />}

      <RadioGroup.Root
        value={value ?? undefined}
        onValueChange={(d) => d.value && onChange(d.value)}
      >
        <Groups>
          {groups.map((group) => (
            <Group key={group.family}>
              <GroupHeader>
                <GroupTitle>{group.family}</GroupTitle>
                <GroupRule />
                <GroupCount>{group.entries.length}</GroupCount>
              </GroupHeader>
              <Rows>
                {group.entries.map((m) => {
                  const selected = value === m.id;
                  return (
                    <RowItem
                      key={m.id}
                      value={m.id}
                      data-active={selected || undefined}
                    >
                      <RadioGroup.ItemHiddenInput />
                      <RadioIndicator data-active={selected || undefined}>
                        <RadioDot data-active={selected || undefined} />
                      </RadioIndicator>
                      <RowMain>
                        <RowLabel>{m.label}</RowLabel>
                        <RowCanonical>{m.id}</RowCanonical>
                      </RowMain>
                      <RowSpecs>
                        <SpecText>{formatWindow(m.contextWindow)} ctx</SpecText>
                        {m.maxOutputTokens && (
                          <>
                            <SpecDot />
                            <SpecText>
                              {formatWindow(m.maxOutputTokens)} out
                            </SpecText>
                          </>
                        )}
                      </RowSpecs>
                    </RowItem>
                  );
                })}
              </Rows>
            </Group>
          ))}
        </Groups>
      </RadioGroup.Root>
    </Wrap>
  );
}

function CurrentPreview({ entry }: { entry: ModelEntry }) {
  return (
    <Preview>
      <PreviewBadge>
        <Check size={10} strokeWidth={2.4} />
        Current
      </PreviewBadge>
      <PreviewBody>
        <PreviewMain>
          <PreviewTitle>{entry.label}</PreviewTitle>
          <PreviewCanonical>{entry.id}</PreviewCanonical>
        </PreviewMain>
        <PreviewSpecs>
          <PreviewSpec>
            <PreviewSpecValue>
              {formatWindow(entry.contextWindow)}
            </PreviewSpecValue>
            <PreviewSpecLabel>context</PreviewSpecLabel>
          </PreviewSpec>
          {entry.maxOutputTokens && (
            <PreviewSpec>
              <PreviewSpecValue>
                {formatWindow(entry.maxOutputTokens)}
              </PreviewSpecValue>
              <PreviewSpecLabel>max output</PreviewSpecLabel>
            </PreviewSpec>
          )}
        </PreviewSpecs>
      </PreviewBody>
    </Preview>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Preview = styled.div`
  position: relative;
  padding: 14px 16px 14px 18px;
  border-radius: 10px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);

  &::before {
    content: "";
    position: absolute;
    top: 10px;
    bottom: 10px;
    left: 0;
    width: 2px;
    border-radius: 0 2px 2px 0;
    background: var(--studio-text-primary);
  }
`;

const PreviewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--studio-text-muted);

  svg {
    color: var(--studio-text-primary);
  }
`;

const PreviewBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 6px;
`;

const PreviewMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const PreviewTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--studio-text-primary);
`;

const PreviewCanonical = styled.div`
  font-size: 10px;
  color: var(--studio-text-muted);
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  font-variant-numeric: tabular-nums;
`;

const PreviewSpecs = styled.div`
  display: flex;
  align-items: baseline;
  gap: 18px;
  flex-shrink: 0;
`;

const PreviewSpec = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
`;

const PreviewSpecValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--studio-text-primary);
  font-variant-numeric: tabular-nums;
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
`;

const PreviewSpecLabel = styled.span`
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
`;

const Groups = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 2px 6px;
`;

const GroupTitle = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
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
`;

const RowItem = styled(RadioGroup.Item)`
  display: grid;
  grid-template-columns: 14px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--studio-border);
  color: var(--studio-text-secondary);
  cursor: pointer;
  transition:
    background 0.1s ease,
    color 0.1s ease;

  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }

  &[data-active] {
    color: var(--studio-text-primary);
  }
`;

const RadioIndicator = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid var(--studio-border-hover);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.12s ease;

  &[data-active] {
    border-color: var(--studio-text-primary);
  }
`;

const RadioDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
  transition: background 0.12s ease, transform 0.12s ease;
  transform: scale(0.6);

  &[data-active] {
    background: var(--studio-text-primary);
    transform: scale(1);
  }
`;

const RowMain = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
`;

const RowLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: inherit;
`;

const RowCanonical = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowSpecs = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
`;

const SpecText = styled.span``;

const SpecDot = styled.span`
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: var(--studio-text-muted);
  opacity: 0.5;
`;
