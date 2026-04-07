import { api as raw } from '../client'
import type { BrowseInput, BrowseEntry } from '../types'

export const browse = {
  list: (input?: BrowseInput) => raw.invoke<BrowseEntry[]>('browse:list', input),
} as const
