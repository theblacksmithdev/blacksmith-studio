import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { ProjectLayout } from '@/components/layout/project-layout'
import { Path } from './paths'

import DashboardPage from '@/pages/dashboard'
import ProjectsPage from '@/pages/projects'
import SettingsPage from '@/pages/settings'
import NewChatPage from '@/pages/chat/new'
import ChatPage from '@/pages/chat'
import FilesPage from '@/pages/files'
import RunPage from '@/pages/run'

export const router = createBrowserRouter([
  // Global routes — title bar only, no sidebar
  {
    element: <AppLayout />,
    children: [
      { path: Path.Home, element: <DashboardPage /> },
      { path: Path.Projects, element: <ProjectsPage /> },
    ],
  },

  // Project-scoped routes — title bar + sidebar + runner dock
  {
    path: '/:projectId',
    element: <ProjectLayout />,
    children: [
      { index: true, element: <NewChatPage /> },
      { path: 'chat/new', element: <NewChatPage /> },
      { path: 'chat/:sessionId', element: <ChatPage /> },
      { path: 'code', element: <FilesPage /> },
      { path: 'run', element: <RunPage /> },
      { path: 'settings', element: <SettingsPage /> },

      // Redirects for removed pages
      { path: 'templates', element: <Navigate to="../chat/new" replace /> },
      { path: 'activity', element: <Navigate to="../chat/new" replace /> },
    ],
  },
])
