import {
  MessageSquare,
  FolderTree,
  Play,
} from 'lucide-react'
import {
  newChatPath,
  codePath,
  runPath,
} from '@/router/paths'

export interface NavEntry {
  id: string
  icon: typeof MessageSquare
  label: string
  path: (pid: string) => string
  match: string
}

export const projectNav: NavEntry[] = [
  { id: 'chat', icon: MessageSquare, label: 'Chat', path: newChatPath, match: '/chat' },
  { id: 'code', icon: FolderTree, label: 'Code', path: codePath, match: '/code' },
]

export const bottomNav: NavEntry[] = [
  { id: 'run', icon: Play, label: 'Dev Servers', path: runPath, match: '/run' },
]
