import {
  Database, Globe, BookOpen, Terminal, HardDrive, Cpu,
  type LucideIcon,
} from 'lucide-react'
import type { McpServerConfig } from '@/api/modules/mcp'

export interface McpPreset {
  name: string
  label: string
  description: string
  icon: LucideIcon
  category: 'design' | 'development' | 'data' | 'productivity'
  config: McpServerConfig
  envHint?: string
}

export const PRESETS: McpPreset[] = [
  // Design
  {
    name: 'figma',
    label: 'Figma',
    description: 'Access designs, components, and styles from your Figma files',
    icon: Globe,
    category: 'design',
    config: { command: 'npx', args: ['-y', 'figma-developer-mcp', '--stdio'], env: { FIGMA_API_KEY: '' } },
    envHint: 'Get your key from figma.com/developers',
  },

  // Development
  {
    name: 'github',
    label: 'GitHub',
    description: 'Access repos, issues, pull requests, and code search',
    icon: Terminal,
    category: 'development',
    config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], env: { GITHUB_PERSONAL_ACCESS_TOKEN: '' } },
    envHint: 'Create a token at github.com/settings/tokens',
  },
  {
    name: 'filesystem',
    label: 'Filesystem',
    description: 'Read, write, and manage files on your local system',
    icon: HardDrive,
    category: 'development',
    config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '.'] },
  },
  {
    name: 'browser',
    label: 'Puppeteer',
    description: 'Browse the web, take screenshots, interact with pages',
    icon: Globe,
    category: 'development',
    config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-puppeteer'] },
  },

  // Data
  {
    name: 'postgres',
    label: 'PostgreSQL',
    description: 'Query and inspect your Postgres database',
    icon: Database,
    category: 'data',
    config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-postgres'], env: { POSTGRES_CONNECTION_STRING: '' } },
    envHint: 'e.g. postgresql://user:pass@localhost:5432/db',
  },
  {
    name: 'sqlite',
    label: 'SQLite',
    description: 'Query and inspect SQLite databases',
    icon: Database,
    category: 'data',
    config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-sqlite', '--db-path', './db.sqlite'] },
  },
  {
    name: 'memory',
    label: 'Memory',
    description: 'Persistent knowledge graph for long-term memory',
    icon: Cpu,
    category: 'data',
    config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-memory'] },
  },

  // Productivity
  {
    name: 'slack',
    label: 'Slack',
    description: 'Read and send Slack messages, search channels',
    icon: Terminal,
    category: 'productivity',
    config: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-slack'], env: { SLACK_BOT_TOKEN: '' } },
    envHint: 'Get from api.slack.com/apps',
  },

  // Docs
  {
    name: 'chakra-ui-docs',
    label: 'Chakra UI Docs',
    description: 'Search and read Chakra UI documentation',
    icon: BookOpen,
    category: 'development',
    config: { command: 'npx', args: ['-y', 'mcp-docs-server', '--url', 'https://www.chakra-ui.com/docs', '--name', 'chakra-ui-docs'] },
  },
  {
    name: 'react-docs',
    label: 'React Docs',
    description: 'Search and read React documentation',
    icon: BookOpen,
    category: 'development',
    config: { command: 'npx', args: ['-y', 'mcp-docs-server', '--url', 'https://react.dev', '--name', 'react-docs'] },
  },
  {
    name: 'django-docs',
    label: 'Django Docs',
    description: 'Search and read Django documentation',
    icon: BookOpen,
    category: 'development',
    config: { command: 'npx', args: ['-y', 'mcp-docs-server', '--url', 'https://docs.djangoproject.com/en/5.1/', '--name', 'django-docs'] },
  },
]

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'development', label: 'Development' },
  { id: 'design', label: 'Design' },
  { id: 'data', label: 'Data' },
  { id: 'productivity', label: 'Productivity' },
]
