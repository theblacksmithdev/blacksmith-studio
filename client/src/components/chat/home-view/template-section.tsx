import { useState } from 'react'
import styled from '@emotion/styled'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, ArrowRight } from 'lucide-react'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { TemplateModal } from '@/components/templates/template-modal'
import type { PromptTemplate } from '@/types'

const Wrap = styled.div`
  width: 100%;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`

const Label = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
`

const SeeAll = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
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
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`

const Card = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-surface);
  }
`

const CardIcon = styled.div`
  color: var(--studio-text-muted);
  flex-shrink: 0;
`

const CardTitle = styled.div`
  font-size: 12px;
  font-weight: 450;
  color: var(--studio-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

interface TemplateSectionProps {
  onSend: (prompt: string) => void
}

export function TemplateSection({ onSend }: TemplateSectionProps) {
  const { data: templates = [] } = useQuery({
    queryKey: queryKeys.templates,
    queryFn: () => api.templates.list(),
    staleTime: 60_000,
  })

  const [selected, setSelected] = useState<PromptTemplate | null>(null)

  if (templates.length === 0) return null

  const visible = templates.slice(0, 4)

  return (
    <Wrap>
      <Header>
        <Label>Templates</Label>
        {templates.length > 4 && (
          <SeeAll onClick={() => setSelected(templates[0])}>
            See all
            <ArrowRight size={11} />
          </SeeAll>
        )}
      </Header>

      <Grid>
        {visible.map((t) => (
          <Card key={t.id} onClick={() => setSelected(t)}>
            <CardIcon>
              <Sparkles size={14} />
            </CardIcon>
            <CardTitle>{t.name}</CardTitle>
          </Card>
        ))}
      </Grid>

      {selected && (
        <TemplateModal
          template={selected}
          isOpen
          onClose={() => setSelected(null)}
          onSubmit={onSend}
        />
      )}
    </Wrap>
  )
}
