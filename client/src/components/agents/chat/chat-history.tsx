import { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import { Clock, ChevronRight } from 'lucide-react'
import { api } from '@/api'

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--studio-scrollbar); border-radius: 3px; }
`

const Card = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: var(--studio-bg-main);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-surface);
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
`

const Dot = styled.div<{ $c: string }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $c }) => $c};
`

const Meta = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
`

const Sep = styled.span`
  font-size: 9px;
  color: var(--studio-border-hover);
`

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 36px 20px;
  text-align: center;
`

function ago(d: string): string {
  const ms = Date.now() - new Date(d).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function dotColor(s: string): string {
  if (s === 'completed') return 'var(--studio-green)'
  if (s === 'failed') return 'var(--studio-error)'
  return 'var(--studio-text-muted)'
}

export function ChatHistory() {
  const [dispatches, setDispatches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (dispatches.length === 0 && !loading) {
      setLoading(true)
      api.agents.listDispatches(30).then(setDispatches).catch(() => {}).finally(() => setLoading(false))
    }
  }, []) // eslint-disable-line

  return (
    <List>
      {loading && (
        <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', py: 6, textAlign: 'center' }}>Loading...</Text>
      )}

      {!loading && dispatches.length === 0 && (
        <Empty>
          <Box css={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'var(--studio-bg-main)', border: '1px solid var(--studio-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Clock size={16} style={{ color: 'var(--studio-text-tertiary)' }} />
          </Box>
          <Text css={{ fontSize: '12px', fontWeight: 500, color: 'var(--studio-text-secondary)' }}>
            No history yet
          </Text>
          <Text css={{ fontSize: '10px', maxWidth: '190px', lineHeight: 1.55, color: 'var(--studio-text-muted)' }}>
            Past dispatch plans will show up here.
          </Text>
        </Empty>
      )}

      <VStack gap="4px" align="stretch">
        {dispatches.map((d) => {
          const n = d.tasks?.length ?? 0
          const ok = (d.tasks ?? []).filter((t: any) => t.status === 'done').length
          return (
            <Card key={d.id}>
              <Dot $c={dotColor(d.status)} />
              <Box css={{ flex: 1, minWidth: 0 }}>
                <Text css={{
                  fontSize: '12px', fontWeight: 500, color: 'var(--studio-text-primary)',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {d.planSummary}
                </Text>
                <Flex gap="5px" mt="2px" align="center">
                  <Meta>{ok}/{n}</Meta>
                  <Sep>·</Sep>
                  <Meta>{ago(d.createdAt)}</Meta>
                  {d.totalCostUsd > 0 && <><Sep>·</Sep><Meta>${Number(d.totalCostUsd).toFixed(3)}</Meta></>}
                </Flex>
              </Box>
              <ChevronRight size={12} style={{ color: 'var(--studio-border-hover)', flexShrink: 0 }} />
            </Card>
          )
        })}
      </VStack>
    </List>
  )
}
