/**
 * Shared types for the artifact subsystem. `ArtifactRecord` is the
 * serialised shape the IPC layer returns; `ArtifactListInput` is the
 * filter bundle the UI and agent MCP tools both pass.
 */

export interface ArtifactRecord {
  id: string;
  projectId: string;
  conversationId: string | null;
  dispatchId: string | null;
  taskId: string | null;
  role: string;
  slug: string;
  title: string;
  relPath: string;
  sizeBytes: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ArtifactListInput {
  projectId: string;
  conversationId?: string;
  role?: string;
  tag?: string;
  search?: string;
  limit?: number;
}

export interface ArtifactUpsertInput {
  projectId: string;
  conversationId: string | null;
  dispatchId: string | null;
  taskId: string | null;
  role: string;
  slug: string;
  title: string;
  relPath: string;
  sizeBytes: number;
  tags?: string[];
}

export interface ArtifactCreateInput {
  projectId: string;
  role: string;
  title: string;
  content: string;
  conversationId?: string;
  dispatchId?: string;
  taskId?: string;
  tags?: string[];
}

export type ArtifactChange =
  | { kind: "upsert"; artifact: ArtifactRecord }
  | { kind: "delete"; id: string; projectId: string };
