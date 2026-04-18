export interface MessageAttachment {
  id: string;
  name: string;
  kind: "image" | "text" | "code" | "pdf" | "file";
  mime: string;
  size: number;
  absPath: string;
  relPath: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  attachments?: MessageAttachment[];
  timestamp: string;
}

export interface ToolCall {
  toolId: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: string;
}

export interface SessionSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastPrompt?: string;
}

export interface Session {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  fields: TemplateField[];
  promptTemplate: string;
}

export interface TemplateField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required: boolean;
}

export interface HealthStatus {
  projectName: string;
  projectRoot: string;
  claudeInstalled: boolean;
  claudeVersion?: string;
}
