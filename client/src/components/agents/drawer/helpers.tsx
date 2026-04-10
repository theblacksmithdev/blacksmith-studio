import {
  CheckCircle2, Circle, Loader2, XCircle, SkipForward,
} from 'lucide-react'
import type { DispatchTask } from '@/api/types'

export function getIcon(status: DispatchTask['status']) {
  switch (status) {
    case 'done': return <CheckCircle2 size={14} />
    case 'running': return <Loader2 size={14} />
    case 'error': return <XCircle size={14} />
    case 'skipped': return <SkipForward size={14} />
    default: return <Circle size={14} />
  }
}

export function statusText(status: DispatchTask['status']): string {
  switch (status) {
    case 'done': return 'Completed'
    case 'running': return 'In progress'
    case 'error': return 'Failed'
    case 'skipped': return 'Skipped'
    default: return 'Pending'
  }
}

export function roleLabel(role: string): string {
  return role.replace('-engineer', '').replace('-', ' ')
}

export function modelLabel(model?: string): string {
  switch (model) {
    case 'premium': return 'Premium'
    case 'fast': return 'Fast'
    default: return 'Balanced'
  }
}
