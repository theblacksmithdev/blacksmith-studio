import { api as raw } from '../client'
import type { BrowseInput, BrowseResult } from '../types'

export const browse = {
  list: (input?: BrowseInput) => raw.invoke<BrowseResult>('browse:list', input),
} as const
