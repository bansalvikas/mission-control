import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import {
  ensureDefaultConversation,
  sendChatMessage,
  subscribeMessages,
} from '../lib/api'
import type { ChatMessage } from '../lib/types'

interface UseChatResult {
  messages: ChatMessage[]
  pendingUserMessage: string | null
  sending: boolean
  error: string | null
  send: (text: string) => Promise<void>
  loadedOnce: boolean
}

export function useChat(): UseChatResult {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedOnce, setLoadedOnce] = useState(false)
  const conversationReady = useRef(false)

  useEffect(() => {
    if (!user) return
    let unsub: (() => void) | undefined

    ensureDefaultConversation(user.uid)
      .then(() => {
        conversationReady.current = true
        unsub = subscribeMessages(user.uid, (next) => {
          setMessages(next)
          setLoadedOnce(true)
        })
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load conversation.')
        setLoadedOnce(true)
      })

    return () => {
      if (unsub) unsub()
    }
  }, [user])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || sending || !user) return
      setError(null)
      setSending(true)
      setPendingUserMessage(trimmed)
      try {
        await sendChatMessage(trimmed)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to send message.'
        setError(msg)
      } finally {
        setPendingUserMessage(null)
        setSending(false)
      }
    },
    [sending, user],
  )

  return { messages, pendingUserMessage, sending, error, send, loadedOnce }
}
