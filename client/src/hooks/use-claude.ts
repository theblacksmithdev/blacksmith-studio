import { useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/api'
import { useChatStore } from '@/stores/chat-store'
import { useFileStore } from '@/stores/file-store'

export function useClaude() {
  const lastContentRef = useRef('')
  const chatStore = useChatStore
  const markChanged = useFileStore((s) => s.markChanged)
  const { projectId } = useParams<{ projectId: string }>()

  useEffect(() => {
    const unsubs = [
      api.claude.onMessage((data) => {
        lastContentRef.current = data.content
        chatStore.getState().updateStreamingMessage(data.content)
      }),
      api.claude.onToolUse((data) => {
        chatStore.getState().addToolCall({
          toolId: data.toolId,
          toolName: data.toolName,
          input: data.input,
        })
      }),
      api.claude.onDone(() => {
        chatStore.getState().finalizeAssistantMessage(lastContentRef.current)
        lastContentRef.current = ''
      }),
      api.claude.onError((data) => {
        chatStore.getState().finalizeAssistantMessage(`Error: ${data.error}`)
        lastContentRef.current = ''
      }),
      api.files.onChanged((data) => {
        markChanged(data.paths)
      }),
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
      api.claude.sendPrompt({ projectId: projectId!, sessionId, prompt })
    },
    [],
  )

  const cancelPrompt = useCallback(
    (sessionId: string) => {
      api.claude.cancel({ sessionId })
      chatStore.getState().setStreaming(false)
    },
    [],
  )

  return { sendPrompt, cancelPrompt }
}
