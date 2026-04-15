import type { ReactNode } from "react";
import styled from "@emotion/styled";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Text, spacing, radii } from "@/components/shared/ui";

const Wrap = styled.div`
  width: 100%;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const Item = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.sm} ${spacing.xs};
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: inherit;
  transition: all 0.12s ease;
  border-radius: ${radii.md};

  &:hover {
    background: var(--studio-bg-surface);
    .item-action {
      opacity: 1;
    }
  }
`;

const Icon = styled.div<{ $accent: boolean }>`
  color: ${({ $accent }) =>
    $accent ? "var(--studio-green)" : "var(--studio-text-muted)"};
  flex-shrink: 0;
  display: flex;

  & svg {
    width: 14px;
    height: 14px;
  }
`;

const Title = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 450;
  color: var(--studio-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Time = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
  flex-shrink: 0;
`;

const ActionBtn = styled.button`
  opacity: 0;
  padding: 4px;
  border-radius: ${radii.xs};
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-error-subtle);
    color: var(--studio-error);
  }
`;

export interface RecentEntry {
  id: string;
  title: string;
  type: "chat" | "agents";
  updatedAt: string;
  meta?: string;
  icon: ReactNode;
}

interface RecentSectionProps {
  label?: string;
  items: RecentEntry[];
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function RecentSection({
  label = "Recent",
  items,
  onSelect,
  onDelete,
}: RecentSectionProps) {
  if (items.length === 0) return null;

  return (
    <Wrap>
      <Text variant="tiny" color="muted" css={{ marginBottom: spacing.sm }}>
        {label}
      </Text>
      <List>
        {items.map((item) => (
          <Item
            key={`${item.type}-${item.id}`}
            onClick={() => onSelect(item.id)}
          >
            <Icon $accent={item.type === "agents"}>{item.icon}</Icon>
            <Title>{item.title}</Title>
            <Time>
              {formatDistanceToNow(new Date(item.updatedAt), {
                addSuffix: true,
              })}
            </Time>
            {onDelete && (
              <ActionBtn
                className="item-action"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
              >
                <Trash2 size={11} />
              </ActionBtn>
            )}
          </Item>
        ))}
      </List>
    </Wrap>
  );
}
