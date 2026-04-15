import { api as raw } from "../client";
import type {
  Session,
  PaginatedSessions,
  SessionListInput,
  SessionCreateInput,
  SessionGetInput,
  SessionRenameInput,
  SessionDeleteInput,
} from "../types";

export const sessions = {
  list: (input: { projectId: string } & SessionListInput) =>
    raw.invoke<PaginatedSessions>("sessions:list", input),
  get: (input: SessionGetInput) => raw.invoke<Session>("sessions:get", input),
  create: (input: { projectId: string } & SessionCreateInput) =>
    raw.invoke<Session>("sessions:create", input),
  rename: (input: SessionRenameInput) =>
    raw.invoke<void>("sessions:rename", input),
  delete: (input: SessionDeleteInput) =>
    raw.invoke<void>("sessions:delete", input),
} as const;
