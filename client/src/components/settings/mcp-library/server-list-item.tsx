import styled from '@emotion/styled'
import type { McpPreset } from './presets'

const Item = styled.button<{ added: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: ${({ added }) => (added ? 'default' : 'pointer')};
  text-align: left;
  font-family: inherit;
  transition: all 0.1s ease;
  opacity: ${({ added }) => (added ? 0.5 : 1)};

  &:hover {
    ${({ added }) => !added && 'background: var(--studio-bg-hover);'}
  }
`

const IconWrap = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--studio-bg-sidebar);
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--studio-text-muted);
  flex-shrink: 0;
`

const Info = styled.div`
  flex: 1;
  min-width: 0;
`

const Name = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--studio-text-primary);
`

const Desc = styled.div`
  font-size: 13px;
  color: var(--studio-text-tertiary);
  margin-top: 1px;
`

const Hint = styled.div`
  font-size: 12px;
  color: var(--studio-text-muted);
  margin-top: 2px;
  font-style: italic;
`

const Badge = styled.span`
  font-size: 12px;
  color: var(--studio-text-muted);
  flex-shrink: 0;
`

interface ServerListItemProps {
  preset: McpPreset
  added: boolean
  onClick: () => void
}

export function ServerListItem({ preset, added, onClick }: ServerListItemProps) {
  const Icon = preset.icon
  return (
    <Item added={added} onClick={() => !added && onClick()}>
      <IconWrap><Icon size={16} /></IconWrap>
      <Info>
        <Name>{preset.label}</Name>
        <Desc>{preset.description}</Desc>
        {preset.envHint && !added && <Hint>{preset.envHint}</Hint>}
      </Info>
      {added && <Badge>Added</Badge>}
    </Item>
  )
}
