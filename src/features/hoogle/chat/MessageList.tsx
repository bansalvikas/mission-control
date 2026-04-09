import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../lib/types'
import { MessageBubble } from './MessageBubble'

interface Props {
  messages: ChatMessage[]
  pendingUserMessage: string | null
  sending: boolean
  loadedOnce: boolean
}

export function MessageList({
  messages,
  pendingUserMessage,
  sending,
  loadedOnce,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, pendingUserMessage, sending])

  const isEmpty = loadedOnce && messages.length === 0 && !pendingUserMessage

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 font-mono text-sm space-y-3"
    >
      {!loadedOnce && (
        <div className="text-slate-700 text-[11px]">loading history...</div>
      )}

      {isEmpty && (
        <div className="text-slate-600 text-[12px] leading-relaxed space-y-2 pt-4">
          <p>Type naturally. Example:</p>
          <p className="text-slate-500">
            &gt; Put my passport in the safe in the study.
          </p>
          <p className="text-slate-500">
            &gt; Spare car keys are in the first drawer of my bedroom wardrobe.
          </p>
          <p className="pt-2">Then ask:</p>
          <p className="text-slate-500">&gt; Where is my passport?</p>
        </div>
      )}

      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}

      {pendingUserMessage && (
        <div className="flex opacity-60">
          <span className="text-[#00ff88] mr-2 select-none">&gt;</span>
          <p className="text-slate-200 whitespace-pre-wrap break-words">
            {pendingUserMessage}
          </p>
        </div>
      )}

      {sending && (
        <div className="flex items-center">
          <span className="text-slate-700 mr-2 select-none">·</span>
          <span className="text-slate-500 animate-blink">thinking...</span>
        </div>
      )}
    </div>
  )
}
