import { useEffect, useCallback, useRef } from 'react'
import { api } from '@/api/client'
import { useChatStore } from '@/stores/chat-store'
import { useFileStore } from '@/stores/file-store'

export function useClaude() {
  const lastContentRef = useRef('')
  const chatStore = useChatStore
  const markChanged = useFileStore((s) => s.markChanged)

  useEffect(() => {
    const onMessage = (data: { sessionId: string; content: string; isPartial: boolean }) => {
      lastContentRef.current = data.content
      chatStore.getState().updateStreamingMessage(data.content)
    }

    const onToolUse = (data: { sessionId: string; toolId: string; toolName: string; input: Record<string, unknown> }) => {
      chatStore.getState().addToolCall({
        toolId: data.toolId,
        toolName: data.toolName,
        input: data.input,
      })
    }

    const onDone = () => {
      chatStore.getState().finalizeAssistantMessage(lastContentRef.current)
      lastContentRef.current = ''
    }

    const onError = (data: { sessionId: string; error: string; code: string }) => {
      chatStore.getState().finalizeAssistantMessage(`Error: ${data.error}`)
      lastContentRef.current = ''
    }

    const onFilesChanged = (data: { paths: string[] }) => {
      markChanged(data.paths)
    }

    const unsubs = [
      api.subscribe('claude:onMessage', onMessage),
      api.subscribe('claude:onToolUse', onToolUse),
      api.subscribe('claude:onDone', onDone),
      api.subscribe('claude:onError', onError),
      api.subscribe('files:onChanged', onFilesChanged),
    ]

    return () => unsubs.forEach((unsub) => unsub())
  }, [markChanged])

  const sendPrompt = useCallback(
    (prompt: string, sessionId: string) => {
      const store = chatStore.getState()
      store.addUserMessage(prompt)
      store.setStreaming(true)
      store.updateStreamingMessage('')
      lastContentRef.current = ''
      api.invoke('claude:sendPrompt', { sessionId, prompt })
    },
    [],
  )

  const cancelPrompt = useCallback(
    (sessionId: string) => {
      api.invoke('claude:cancel', { sessionId })
      chatStore.getState().setStreaming(false)
    },
    [],
  )

  return { sendPrompt, cancelPrompt }
}
