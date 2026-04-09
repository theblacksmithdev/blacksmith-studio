import {
  MessageSquare,
  FolderTree,
  Play,
  History,
  Network,
} from 'lucide-react'
import {
  newChatPath,
  codePath,
  runPath,
  checkpointsPath,
  agentsPath,
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
  { id: 'agents', icon: Network, label: 'Agents', path: agentsPath, match: '/agents' },
  { id: 'code', icon: FolderTree, label: 'Code', path: codePath, match: '/code' },
  { id: 'git', icon: History, label: 'Source Control', path: checkpointsPath, match: '/checkpoints' },
]

export const bottomNav: NavEntry[] = [
  { id: 'run', icon: Play, label: 'Dev Servers', path: runPath, match: '/run' },
]
