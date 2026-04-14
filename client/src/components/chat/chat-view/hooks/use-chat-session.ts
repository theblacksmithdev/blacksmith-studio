import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { api } from '@/api'
import { useClaude } from '@/hooks/use-claude'
import { useChatStore } from '@/stores/chat-store'
import { useSessionStore } from '@/stores/session-store'
import { toConversationMessages } from '../message-helpers'

/**
 * Manages loading/resuming a chat session, sending prompts,
 * and transforming messages for the conversation view.
 */
export function useChatSession() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const location = useLocation()
  const { sendPrompt, cancelPrompt } = useClaude()
  const { messages, isStreaming, partialMessage } = useChatStore()
  const { activeSessionId, setActiveSession } = useSessionStore()
  const { loadMessages } = useChatStore()

  // Load session when navigating to a new one
  useEffect(() => {
    if (sessionId && sessionId !== activeSessionId) {
      api.sessions.get({ id: sessionId }).then((session) => {
        setActiveSession(session.id)
        loadMessages(session.messages)
      })
    }
  }, [sessionId, activeSessionId])

  // Auto-send initial prompt from route state (e.g. from template or quick action)
  const initialPromptSent = useRef(false)
  useEffect(() => {
    const state = location.state as { initialPrompt?: string } | null
    if (state?.initialPrompt && sessionId && !initialPromptSent.current && !isStreaming) {
      initialPromptSent.current = true
      sendPrompt(state.initialPrompt, sessionId)
    }
  }, [sessionId, location.state])

  const handleSend = useCallback((text: string) => {
    if (!sessionId) return
    sendPrompt(text, sessionId)
  }, [sessionId, sendPrompt])

  const handleCancel = useCallback(() => {
    if (sessionId) cancelPrompt(sessionId)
  }, [sessionId, cancelPrompt])

  const conversationMessages = useMemo(
    () => toConversationMessages(messages),
    [messages],
  )

  return {
    sessionId,
    messages,
    conversationMessages,
    isStreaming,
    partialMessage,
    handleSend,
    handleCancel,
  }
}
