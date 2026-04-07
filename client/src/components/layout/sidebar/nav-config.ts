import {
  MessageSquare,
  FolderTree,
  Play,
  Sparkles,
  History,
} from 'lucide-react'
import {
  newChatPath,
  codePath,
  runPath,
  templatesPath,
  activityPath,
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
  { id: 'run', icon: Play, label: 'Dev Servers', path: runPath, match: '/run' },
  { id: 'templates', icon: Sparkles, label: 'Templates', path: templatesPath, match: '/templates' },
]

export const bottomNav: NavEntry[] = [
  { id: 'activity', icon: History, label: 'Activity', path: activityPath, match: '/activity' },
]
