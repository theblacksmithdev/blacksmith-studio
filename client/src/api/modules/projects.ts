import { api as raw } from '../client'
import type {
  Project,
  ProjectGetInput,
  ProjectRegisterInput,
  ProjectCreateInput,
  ProjectCloneInput,
  ProjectRenameInput,
  ProjectRemoveInput,
  ProjectValidateInput,
  ProjectValidateResult,
  ProjectCreateOutputEvent,
  ProjectCreateDoneEvent,
  ProjectCreateErrorEvent,
} from '../types'

export const projects = {
  list: () => raw.invoke<Project[]>('projects:list'),
  get: (input: ProjectGetInput) => raw.invoke<Project>('projects:get', input),
  register: (input: ProjectRegisterInput) => raw.invoke<Project>('projects:register', input),
  create: (input: ProjectCreateInput & { projectId?: string }) => raw.invoke<{ started: boolean }>('projects:create', input),
  clone: (input: ProjectCloneInput) => raw.invoke<{ started: boolean }>('projects:clone', input),
  rename: (input: ProjectRenameInput) => raw.invoke<void>('projects:rename', input),
  remove: (input: ProjectRemoveInput) => raw.invoke<void>('projects:remove', input),
  validate: (input: ProjectValidateInput) => raw.invoke<ProjectValidateResult>('projects:validate', input),

  onCreateOutput: (cb: (data: ProjectCreateOutputEvent) => void) => raw.subscribe('projects:onCreateOutput', cb),
  onCreateDone: (cb: (data: ProjectCreateDoneEvent) => void) => raw.subscribe('projects:onCreateDone', cb),
  onCreateError: (cb: (data: ProjectCreateErrorEvent) => void) => raw.subscribe('projects:onCreateError', cb),
} as const
