import styled from '@emotion/styled'
import { useRunnerStore, selectIsAnyRunning, selectIsAnyStarting } from '@/stores/runner-store'

const Badge = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--studio-accent);
  box-shadow: 0 0 4px var(--studio-border-hover);
`

const BadgePulse = styled(Badge)`
  animation: pulse-badge 1.5s ease-in-out infinite;
  @keyframes pulse-badge {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`

export function RunnerBadge() {
  const anyRunning = useRunnerStore(selectIsAnyRunning)
  const anyStarting = useRunnerStore(selectIsAnyStarting)

  if (!anyRunning && !anyStarting) return null
  return anyStarting ? <BadgePulse /> : <Badge />
}
