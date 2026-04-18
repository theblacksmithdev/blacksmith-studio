import { api as raw } from "../client";
import type {
  Artifact,
  ArtifactChange,
  ArtifactContent,
  ArtifactCreateInput,
  ArtifactsListInput,
} from "../types";

export const artifacts = {
  list: (input: ArtifactsListInput) =>
    raw.invoke<Artifact[]>("artifacts:list", input),

  get: (id: string) => raw.invoke<Artifact | null>("artifacts:get", { id }),

  readContent: (id: string) =>
    raw.invoke<ArtifactContent | null>("artifacts:readContent", { id }),

  writeContent: (id: string, content: string) =>
    raw.invoke<Artifact>("artifacts:writeContent", { id, content }),

  rename: (id: string, title: string) =>
    raw.invoke<Artifact>("artifacts:rename", { id, title }),

  delete: (id: string) =>
    raw.invoke<{ ok: true }>("artifacts:delete", { id }),

  setTags: (id: string, tags: string[]) =>
    raw.invoke<Artifact>("artifacts:setTags", { id, tags }),

  create: (input: ArtifactCreateInput) =>
    raw.invoke<Artifact>("artifacts:create", input),

  backfill: (projectId: string) =>
    raw.invoke<{ indexed: number }>("artifacts:backfill", { projectId }),

  onChanged: (cb: (change: ArtifactChange) => void) =>
    raw.subscribe("artifacts:onChanged", cb),
} as const;
