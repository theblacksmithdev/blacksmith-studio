import { createHashRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { ProjectLayout } from '@/components/layout/project-layout'
import { Path } from './paths'

import DashboardPage from '@/pages/dashboard'
import ProjectsPage from '@/pages/projects'
import SettingsPage from '@/pages/settings'
import { AiSettings } from '@/pages/settings/components/sections/ai-settings'
import { McpSettings } from '@/pages/settings/components/sections/mcp'
import { SkillsSettings } from '@/pages/settings/components/sections/skills-settings'
import { AppearanceSettings } from '@/pages/settings/components/sections/appearance-settings'
import { EditorSettings } from '@/pages/settings/components/sections/editor-settings'
import { WorkspaceSettings } from '@/pages/settings/components/sections/workspace-settings'
import { DangerZone } from '@/pages/settings/components/sections/danger-zone'
import { KnowledgeSettings } from '@/pages/settings/components/sections/knowledge-settings'
import NewChatPage from '@/pages/chat/new'
import ChatPage from '@/pages/chat'
import FilesPage from '@/pages/files'
import { RunnerPage, RunnerLogsPage } from '@/components/runner/runner-page'
import SkillsBrowserPage from '@/pages/skills'
import McpBrowserPage from '@/pages/mcp'
import SourceControlPage from '@/pages/source-control'
import AgentsHomePage from '@/pages/agents/home'
import AgentsNewPage from '@/pages/agents/new'
import AgentsConversationPage from '@/pages/agents/conversation'

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
      { index: true, element: <Navigate to="chat/new" replace /> },
      { path: 'chat/new', element: <NewChatPage /> },
      { path: 'chat/:sessionId', element: <ChatPage /> },
      { path: 'code', element: <FilesPage /> },
      {
        path: 'run',
        element: <RunnerPage />,
        children: [
          { index: true, element: <Navigate to="all" replace /> },
          { path: ':configId', element: <RunnerLogsPage /> },
        ],
      },
      { path: 'skills', element: <SkillsBrowserPage /> },
      { path: 'mcp', element: <McpBrowserPage /> },
      { path: 'source-control', element: <SourceControlPage /> },
      { path: 'agents', element: <AgentsHomePage /> },
      { path: 'agents/new', element: <AgentsNewPage /> },
      { path: 'agents/:conversationId', element: <AgentsConversationPage /> },

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
