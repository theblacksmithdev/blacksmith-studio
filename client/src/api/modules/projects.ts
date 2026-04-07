import { api as raw } from '../client'
import type {
  Project,
  ProjectRegisterInput,
  ProjectCreateInput,
  ProjectActivateInput,
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
  getActive: () => raw.invoke<Project | null>('projects:getActive'),
  register: (input: ProjectRegisterInput) => raw.invoke<Project>('projects:register', input),
  create: (input: ProjectCreateInput) => raw.invoke<{ started: boolean }>('projects:create', input),
  activate: (input: ProjectActivateInput) => raw.invoke<Project>('projects:activate', input),
  rename: (input: ProjectRenameInput) => raw.invoke<void>('projects:rename', input),
  remove: (input: ProjectRemoveInput) => raw.invoke<void>('projects:remove', input),
  validate: (input: ProjectValidateInput) => raw.invoke<ProjectValidateResult>('projects:validate', input),

  onCreateOutput: (cb: (data: ProjectCreateOutputEvent) => void) => raw.subscribe('projects:onCreateOutput', cb),
  onCreateDone: (cb: (data: ProjectCreateDoneEvent) => void) => raw.subscribe('projects:onCreateDone', cb),
  onCreateError: (cb: (data: ProjectCreateErrorEvent) => void) => raw.subscribe('projects:onCreateError', cb),
} as const
