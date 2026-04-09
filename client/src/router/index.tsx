import { createHashRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { ProjectLayout } from '@/components/layout/project-layout'
import { Path } from './paths'

import DashboardPage from '@/pages/dashboard'
import ProjectsPage from '@/pages/projects'
import SettingsPage from '@/pages/settings'
import { AiSettings } from '@/components/settings/sections/ai-settings'
import { McpSettings } from '@/components/settings/sections/mcp-settings'
import { SkillsSettings } from '@/components/settings/sections/skills-settings'
import { AppearanceSettings } from '@/components/settings/sections/appearance-settings'
import { EditorSettings } from '@/components/settings/sections/editor-settings'
import { WorkspaceSettings } from '@/components/settings/sections/workspace-settings'
import { DangerZone } from '@/components/settings/sections/danger-zone'
import { KnowledgeSettings } from '@/components/settings/sections/knowledge-settings'
import NewChatPage from '@/pages/chat/new'
import ChatPage from '@/pages/chat'
import FilesPage from '@/pages/files'
import RunPage from '@/pages/run'
import SkillsBrowserPage from '@/pages/skills'
import McpBrowserPage from '@/pages/mcp'
import CheckpointsPage from '@/pages/checkpoints'
import AgentsPageRoute from '@/pages/agents'

export const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      { path: Path.Home, element: <DashboardPage /> },
      { path: Path.Projects, element: <ProjectsPage /> },
    ],
  },

  {
    path: '/:projectId',
    element: <ProjectLayout />,
    children: [
      { index: true, element: <NewChatPage /> },
      { path: 'chat/new', element: <NewChatPage /> },
      { path: 'chat/:sessionId', element: <ChatPage /> },
      { path: 'code', element: <FilesPage /> },
      { path: 'run', element: <RunPage /> },
      { path: 'skills', element: <SkillsBrowserPage /> },
      { path: 'mcp', element: <McpBrowserPage /> },
      { path: 'checkpoints', element: <CheckpointsPage /> },
      { path: 'agents', element: <AgentsPageRoute /> },

      // Settings with nested routes
      {
        path: 'settings',
        element: <SettingsPage />,
        children: [
          { index: true, element: <Navigate to="ai" replace /> },
          { path: 'ai', element: <AiSettings /> },
          { path: 'mcp', element: <McpSettings /> },
          { path: 'skills', element: <SkillsSettings /> },
          { path: 'appearance', element: <AppearanceSettings /> },
          { path: 'editor', element: <EditorSettings /> },
          { path: 'workspace', element: <WorkspaceSettings /> },
          { path: 'knowledge', element: <KnowledgeSettings /> },
          { path: 'danger', element: <DangerZone /> },
        ],
      },

      { path: 'templates', element: <Navigate to="../chat/new" replace /> },
      { path: 'activity', element: <Navigate to="../chat/new" replace /> },
    ],
  },
])
