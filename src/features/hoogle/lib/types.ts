import type { Timestamp } from 'firebase/firestore'

export interface Item {
  id: string
  rawText: string
  itemName: string
  locationRaw: string
  locationPath: string[]
  tags: string[]
  notes: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type MessageRole = 'user' | 'assistant' | 'tool'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  toolName: 'store_item' | 'search_items' | null
  toolPayload: Record<string, unknown> | null
  itemId: string | null
  createdAt: Timestamp
}

export interface Conversation {
  id: string
  title: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ChatResponse {
  reply: string
  toolCalls: Array<{
    name: 'store_item' | 'search_items'
    itemId?: string
    count?: number
  }>
}
