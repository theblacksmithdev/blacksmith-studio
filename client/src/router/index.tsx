import { createHashRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { ProjectLayout } from "@/components/layout/project-layout";
import { Path } from "./paths";

import DashboardPage from "@/pages/dashboard";
import ProjectsPage from "@/pages/projects";
import SettingsPage, {
  AiSettings,
  McpSettings,
  SkillsSettings,
  AppearanceSettings,
  EditorSettings,
  WorkspaceSettings,
  KnowledgeSettings,
  DangerZone,
} from "@/pages/settings";
import { SingleAgentChat, AgentTeamChat } from "@/pages/home-page";
import ChatPage from "@/pages/chat";
import FilesPage from "@/pages/files";
import { RunnerPage, RunnerLogsPage } from "@/pages/runner";
import SkillsBrowserPage from "@/pages/skills";
import McpBrowserPage from "@/pages/mcp";
import SourceControlPage from "@/pages/source-control";
import AgentsNewPage from "@/pages/agents/new";
import AgentsConversationPage from "@/pages/agents/conversation";

export interface RouteHandle {
  title?: string;
}

export const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      { path: Path.Home, element: <DashboardPage /> },
      {
        path: Path.Projects,
        element: <ProjectsPage />,
        handle: { title: "Projects" } satisfies RouteHandle,
      },
    ],
  },

  {
    path: "/:projectId",
    element: <ProjectLayout />,
    children: [
      { index: true, element: <Navigate to="chat/new" replace /> },
      { path: "chat/new", element: <SingleAgentChat /> },
      {
        path: "chat/:sessionId",
        element: <ChatPage />,
        handle: { title: "Chat" } satisfies RouteHandle,
      },
      {
        path: "code",
        element: <FilesPage />,
        handle: { title: "Code" } satisfies RouteHandle,
      },
      {
        path: "run",
        element: <RunnerPage />,
        handle: { title: "Dev Services" } satisfies RouteHandle,
        children: [
          { index: true, element: <Navigate to="all" replace /> },
          {
            path: ":configId",
            element: <RunnerLogsPage />,
            handle: { title: "Dev Services" } satisfies RouteHandle,
          },
        ],
      },
      {
        path: "skills",
        element: <SkillsBrowserPage />,
        handle: { title: "Skills" } satisfies RouteHandle,
      },
      {
        path: "mcp",
        element: <McpBrowserPage />,
        handle: { title: "MCP" } satisfies RouteHandle,
      },
      {
        path: "source-control",
        element: <SourceControlPage />,
        handle: { title: "Source Control" } satisfies RouteHandle,
      },
      { path: "agents", element: <AgentTeamChat /> },
      {
        path: "agents/new",
        element: <AgentsNewPage />,
        handle: { title: "Agents" } satisfies RouteHandle,
      },
      {
        path: "agents/:conversationId",
        element: <AgentsConversationPage />,
        handle: { title: "Agents" } satisfies RouteHandle,
      },

      // Settings with nested routes
      {
        path: "settings",
        element: <SettingsPage />,
        handle: { title: "Settings" } satisfies RouteHandle,
        children: [
          { index: true, element: <Navigate to="ai" replace /> },
          {
            path: "ai",
            element: <AiSettings />,
            handle: { title: "AI & Prompting" } satisfies RouteHandle,
          },
          {
            path: "mcp",
            element: <McpSettings />,
            handle: { title: "MCP Servers" } satisfies RouteHandle,
          },
          {
            path: "skills",
            element: <SkillsSettings />,
            handle: { title: "Skills" } satisfies RouteHandle,
          },
          {
            path: "appearance",
            element: <AppearanceSettings />,
            handle: { title: "Appearance" } satisfies RouteHandle,
          },
          {
            path: "editor",
            element: <EditorSettings />,
            handle: { title: "Editor" } satisfies RouteHandle,
          },
          {
            path: "workspace",
            element: <WorkspaceSettings />,
            handle: { title: "Workspace" } satisfies RouteHandle,
          },
          {
            path: "knowledge",
            element: <KnowledgeSettings />,
            handle: { title: "Knowledge Base" } satisfies RouteHandle,
          },
          {
            path: "danger",
            element: <DangerZone />,
            handle: { title: "Danger Zone" } satisfies RouteHandle,
          },
        ],
      },

      { path: "templates", element: <Navigate to="../chat/new" replace /> },
      { path: "activity", element: <Navigate to="../chat/new" replace /> },
    ],
  },
]);
