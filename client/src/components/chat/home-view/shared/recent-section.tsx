import type { ReactNode } from 'react'
import styled from '@emotion/styled'
import { ArrowRight, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Text, Avatar, Badge, spacing, radii } from '@/components/shared/ui'
import type { WorkMode } from '@/stores/ui-store'

/* ── Styled ── */

const Wrap = styled.div`
  width: 100%;
`

const Label = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  margin-bottom: ${spacing.sm};
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Item = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${radii.lg};
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-surface);
    .item-arrow { opacity: 1; transform: translateX(0); }
    .item-action { opacity: 1; }
  }
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  margin-top: 1px;
`

const Arrow = styled.div`
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.12s ease;
  color: var(--studio-text-muted);
  flex-shrink: 0;
  display: flex;
`

const ActionBtn = styled.button`
  opacity: 0;
  padding: 4px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover { background: var(--studio-error-subtle); color: var(--studio-error); }
`

/* ── Types ── */

export interface RecentEntry {
  id: string
  title: string
  type: 'chat' | 'agents'
  updatedAt: string
  meta?: string
  icon: ReactNode
}

/* ── Components ── */

interface RecentSectionProps {
  label?: string
  items: RecentEntry[]
  onSelect: (id: string) => void
  onDelete?: (id: string) => void
}

export function RecentSection({ label = 'Recent', items, onSelect, onDelete }: RecentSectionProps) {
  if (items.length === 0) return null

  return (
    <Wrap>
      <Label>{label}</Label>
      <List>
        {items.map((item) => (
          <Item key={`${item.type}-${item.id}`} onClick={() => onSelect(item.id)}>
            <Avatar
              size="sm"
              variant={item.type === 'agents' ? 'active' : 'default'}
              icon={item.icon}
            />
            <Body>
              <Text variant="label" truncate css={{ display: 'block', color: 'var(--studio-text-primary)', fontWeight: 450 }}>
                {item.title}
              </Text>
              <Meta>
                <Badge variant={item.type === 'agents' ? 'success' : 'default'} size="sm">
                  {item.type === 'chat' ? 'Chat' : 'Team'}
                </Badge>
                {item.meta && <Text variant="caption" color="muted">{item.meta} ·</Text>}
                <Text variant="caption" color="muted">
                  {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                </Text>
              </Meta>
            </Body>
            {onDelete && (
              <ActionBtn className="item-action" onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}>
                <Trash2 size={12} />
              </ActionBtn>
            )}
            <Arrow className="item-arrow"><ArrowRight size={13} /></Arrow>
          </Item>
        ))}
      </List>
    </Wrap>
  )
}
