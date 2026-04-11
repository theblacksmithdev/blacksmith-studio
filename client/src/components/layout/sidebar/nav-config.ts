import {
  Files,
  Play,
  GitBranch,
  Terminal,
  Settings,
} from 'lucide-react'
import {
  codePath,
  runPath,
  checkpointsPath,
  settingsPath,
} from '@/router/paths'

export interface NavEntry {
  id: string
  icon: typeof Files
  label: string
  path: (pid: string) => string
  match: string
}

export const projectNav: NavEntry[] = [
  { id: 'code', icon: Files, label: 'Files', path: codePath, match: '/code' },
  { id: 'git', icon: GitBranch, label: 'Source Control', path: checkpointsPath, match: '/checkpoints' },
]

export const bottomNav: NavEntry[] = [
  { id: 'run', icon: Play, label: 'Dev Servers', path: runPath, match: '/run' },
]

export const settingsNav: NavEntry = {
  id: 'settings', icon: Settings, label: 'Settings', path: settingsPath, match: '/settings',
}
