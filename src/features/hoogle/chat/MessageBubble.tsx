import type { ChatMessage } from '../lib/types'

interface Props {
  message: ChatMessage
}

export function MessageBubble({ message }: Props) {
  if (message.role === 'user') {
    return (
      <div className="flex">
        <span className="text-[#00ff88] mr-2 select-none">&gt;</span>
        <p className="text-slate-200 whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    )
  }

  if (message.role === 'tool') {
    const label =
      message.toolName === 'store_item'
        ? `· stored ${readName(message.toolPayload)}`
        : message.toolName === 'search_items'
          ? `· searched items`
          : '· tool'
    return (
      <div className="text-[11px] text-slate-600 italic pl-4">{label}</div>
    )
  }

  return (
    <div className="flex">
      <span className="text-slate-700 mr-2 select-none">·</span>
      <p className="text-slate-300 whitespace-pre-wrap break-words">
        {message.content}
      </p>
    </div>
  )
}

function readName(payload: Record<string, unknown> | null): string {
  if (!payload) return 'item'
  const name = payload['itemName']
  if (typeof name === 'string' && name.length > 0) return name
  return 'item'
}
