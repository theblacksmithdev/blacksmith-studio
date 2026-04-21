import { createHashRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { ProjectLayout } from "@/components/layout/project-layout";
import {
  RouteErrorBoundary,
  NotFoundRoute,
} from "@/components/error-boundary";
import { Path } from "./paths";

import DashboardPage from "@/pages/dashboard";
import ProjectsPage from "@/pages/projects";
import SettingsPage, {
  AiSettings,
  ModelSettings,
  McpSettings,
  SkillsSettings,
  AppearanceSettings,
  EditorSettings,
  WorkspaceSettings,
  EnvironmentsSettings,
  KnowledgeSettings,
  GraphifySettings,
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
import ArtifactsLayout from "@/pages/artifacts";
import ArtifactsEmptyRoute from "@/pages/artifacts/empty-route";
import ArtifactDetailRoute from "@/pages/artifacts/detail-route";
import CommandsLayout from "@/pages/commands";
import CommandsEmptyRoute from "@/pages/commands/empty-route";
import CommandRunDetailRoute from "@/pages/commands/detail-route";
import UsagePage from "@/pages/usage";

export interface RouteHandle {
  title?: string;
}

export const router = createHashRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
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
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="chat/new" replace /> },
      { path: "chat/new", element: <SingleAgentChat /> },
      { path: "agents/new", element: <AgentTeamChat /> },
      {
        path: "chat/:sessionId",
        element: <ChatPage />,
        handle: { title: "Chat" } satisfies RouteHandle,
      },
      {
        path: "agents/:conversationId",
        element: <AgentsConversationPage />,
        handle: { title: "Agents" } satisfies RouteHandle,
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
      {
        path: "artifacts",
        element: <ArtifactsLayout />,
        handle: { title: "Artifacts" } satisfies RouteHandle,
        children: [
          { index: true, element: <ArtifactsEmptyRoute /> },
          {
            path: ":artifactId",
            element: <ArtifactDetailRoute />,
            handle: { title: "Artifact" } satisfies RouteHandle,
          },
        ],
      },
      {
        path: "commands",
        element: <CommandsLayout />,
        handle: { title: "Commands" } satisfies RouteHandle,
        children: [
          { index: true, element: <CommandsEmptyRoute /> },
          {
            path: ":runId",
            element: <CommandRunDetailRoute />,
            handle: { title: "Command run" } satisfies RouteHandle,
          },
        ],
      },
      {
        path: "usage",
        element: <UsagePage />,
        handle: { title: "Usage" } satisfies RouteHandle,
      },

      // Settings with nested routes
      {
        path: "settings",
        element: <SettingsPage />,
        handle: { title: "Settings" } satisfies RouteHandle,
        children: [
          { index: true, element: <Navigate to="ai" replace /> },
          {
            path: "model",
            element: <ModelSettings />,
            handle: { title: "Model" } satisfies RouteHandle,
          },
          {
            path: "ai",
            element: <AiSettings />,
            handle: { title: "Prompting" } satisfies RouteHandle,
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
            path: "environments",
            element: <EnvironmentsSettings />,
            handle: { title: "Environments" } satisfies RouteHandle,
          },
          {
            path: "knowledge",
            element: <KnowledgeSettings />,
            handle: { title: "Knowledge Base" } satisfies RouteHandle,
          },
          {
            path: "graphify",
            element: <GraphifySettings />,
            handle: { title: "Knowledge Graph" } satisfies RouteHandle,
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
      { path: "*", element: <NotFoundRoute /> },
    ],
  },
  { path: "*", element: <NotFoundRoute /> },
]);
