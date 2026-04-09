import { PageShell } from '../ui/PageShell'
import { Composer } from './Composer'
import { MessageList } from './MessageList'
import { useChat } from './useChat'

export function ChatPage() {
  const { messages, pendingUserMessage, sending, error, send, loadedOnce } = useChat()

  return (
    <PageShell activeRoute="chat">
      <div className="flex flex-col flex-1 min-h-0">
        <MessageList
          messages={messages}
          pendingUserMessage={pendingUserMessage}
          sending={sending}
          loadedOnce={loadedOnce}
        />
        {error && (
          <div className="px-4 py-2 text-[11px] text-red-400 border-t border-red-900/40 font-mono">
            ! {error}
          </div>
        )}
        <Composer onSend={send} disabled={sending} />
      </div>
    </PageShell>
  )
}
