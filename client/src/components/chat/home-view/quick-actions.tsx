import styled from '@emotion/styled'
import { ArrowRight } from 'lucide-react'

const suggestions = [
  'Create a resource',
  'Add a page',
  'Build an API',
  'Add auth',
  'Fix a bug',
  'Write tests',
]

const promptMap: Record<string, string> = {
  'Create a resource': 'Help me create a new full-stack resource with Django model, serializer, API viewset, and React pages.',
  'Add a page': 'Help me create a new page with proper routing, layout, and components.',
  'Build an API': 'Help me create a new Django REST API endpoint with serializer and views.',
  'Add auth': 'Help me add authentication with login, registration, and route protection.',
  'Fix a bug': 'Help me investigate and fix a bug in my project.',
  'Write tests': 'Help me write tests for my existing code using the project testing patterns.',
}

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;
`

const Chip = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  font-size: 14px;
  font-weight: 450;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;

  .chip-arrow {
    opacity: 0;
    transform: translateX(-2px);
    transition: all 0.15s ease;
    color: var(--studio-text-tertiary);
    display: flex;
  }

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
    background: var(--studio-bg-surface);

    .chip-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
`

interface QuickActionsProps {
  onSend: (prompt: string) => void
}

export function QuickActions({ onSend }: QuickActionsProps) {
  return (
    <Wrap>
      {suggestions.map((label) => (
        <Chip key={label} onClick={() => onSend(promptMap[label])}>
          {label}
          <span className="chip-arrow">
            <ArrowRight size={12} />
          </span>
        </Chip>
      ))}
    </Wrap>
  )
}
