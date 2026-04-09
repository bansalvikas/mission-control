import type Anthropic from '@anthropic-ai/sdk'
import { getClaude, MODEL_FAST, MODEL_SMART } from './claude'
import {
  ALL_TOOLS,
  SYSTEM_PROMPT,
} from './prompts'
import {
  appendMessage,
  loadAllItems,
  loadRecentMessages,
  writeItem,
  type StoredItem,
  type StoredMessage,
} from './firestore'

const MAX_TOOL_ITERATIONS = 3
const MEMORY_WINDOW = 10

type ClaudeMessage = Anthropic.Messages.MessageParam
type ClaudeContentBlockParam =
  | Anthropic.Messages.TextBlockParam
  | Anthropic.Messages.ToolUseBlockParam
  | Anthropic.Messages.ToolResultBlockParam

interface ToolCallSummary {
  name: 'store_item' | 'search_items'
  itemId?: string
  count?: number
}

export interface ChatInvokeInput {
  uid: string
  conversationId: string
  message: string
}

export interface ChatInvokeOutput {
  reply: string
  toolCalls: ToolCallSummary[]
}

export async function runChatTurn(
  input: ChatInvokeInput,
): Promise<ChatInvokeOutput> {
  const { uid, conversationId, message } = input

  // 1. Persist the user's message immediately so it shows in history.
  await appendMessage(uid, conversationId, {
    role: 'user',
    content: message,
    toolName: null,
    toolPayload: null,
    itemId: null,
  })

  // 2. Build the Claude message history.
  const history = await loadRecentMessages(uid, conversationId, MEMORY_WINDOW)
  const messages: ClaudeMessage[] = historyToClaudeMessages(history)

  const claude = getClaude()
  const toolCalls: ToolCallSummary[] = []
  let finalReplyText = ''
  let usedSmartModel = false

  for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter += 1) {
    const model = usedSmartModel ? MODEL_SMART : MODEL_FAST
    const response = await claude.messages.create({
      model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: ALL_TOOLS,
      messages,
    })

    // Accumulate assistant content for next loop iteration.
    const assistantBlocks: ClaudeContentBlockParam[] = []
    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []

    for (const block of response.content) {
      if (block.type === 'text') {
        assistantBlocks.push({ type: 'text', text: block.text })
        finalReplyText += (finalReplyText ? '\n' : '') + block.text
      } else if (block.type === 'tool_use') {
        assistantBlocks.push({
          type: 'tool_use',
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        })
        const toolResult = await executeTool({
          uid,
          conversationId,
          rawUserText: message,
          toolName: block.name,
          toolInput: (block.input as Record<string, unknown>) ?? {},
        })
        toolCalls.push(toolResult.summary)

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(toolResult.payload),
        })

        if (
          block.name === 'search_items' &&
          toolResult.ambiguous &&
          !usedSmartModel
        ) {
          // Escalate next iteration to the smarter model for disambiguation.
          usedSmartModel = true
        }
      }
    }

    // Push the assistant turn we just got.
    messages.push({ role: 'assistant', content: assistantBlocks })

    if (response.stop_reason !== 'tool_use') {
      // Claude produced a final answer — exit loop.
      break
    }

    // Feed tool results back in as the next user turn.
    messages.push({ role: 'user', content: toolResults })

    // Reset finalReplyText if this iteration was purely tool_use; the
    // next iteration will produce the real reply.
    if (assistantBlocks.every((b) => b.type !== 'text')) {
      finalReplyText = ''
    }
  }

  const reply = finalReplyText.trim() || 'Got it.'

  // 3. Persist the final assistant reply.
  await appendMessage(uid, conversationId, {
    role: 'assistant',
    content: reply,
    toolName: null,
    toolPayload: null,
    itemId: null,
  })

  return { reply, toolCalls }
}

function historyToClaudeMessages(history: StoredMessage[]): ClaudeMessage[] {
  // Only pass user + assistant text turns to Claude; skip our internal
  // `tool` rows since we persisted them for the UI, not for the model.
  const out: ClaudeMessage[] = []
  for (const m of history) {
    if (m.role === 'user') {
      out.push({ role: 'user', content: m.content })
    } else if (m.role === 'assistant' && m.content) {
      out.push({ role: 'assistant', content: m.content })
    }
  }
  return out
}

interface ExecuteToolArgs {
  uid: string
  conversationId: string
  rawUserText: string
  toolName: string
  toolInput: Record<string, unknown>
}

interface ExecuteToolResult {
  payload: unknown
  summary: ToolCallSummary
  ambiguous: boolean
}

async function executeTool(args: ExecuteToolArgs): Promise<ExecuteToolResult> {
  if (args.toolName === 'store_item') {
    const itemName = asString(args.toolInput.itemName, 'item')
    const locationRaw = asString(args.toolInput.locationRaw, '')
    const locationPath = asStringArray(args.toolInput.locationPath)
    const tags = asStringArray(args.toolInput.tags).map((t) =>
      t.toLowerCase().trim(),
    )
    const notes =
      typeof args.toolInput.notes === 'string' ? args.toolInput.notes : null

    const itemId = await writeItem(args.uid, {
      rawText: args.rawUserText,
      itemName,
      locationRaw,
      locationPath,
      tags,
      notes,
    })

    await appendMessage(args.uid, args.conversationId, {
      role: 'tool',
      content: `stored ${itemName}`,
      toolName: 'store_item',
      toolPayload: { itemName, locationPath, tags },
      itemId,
    })

    return {
      payload: { ok: true, itemId, itemName },
      summary: { name: 'store_item', itemId },
      ambiguous: false,
    }
  }

  if (args.toolName === 'search_items') {
    const items = await loadAllItems(args.uid)
    const compact = items.map(compactItemForClaude)

    await appendMessage(args.uid, args.conversationId, {
      role: 'tool',
      content: `searched ${items.length} items`,
      toolName: 'search_items',
      toolPayload: { query: args.toolInput.query, count: items.length },
      itemId: null,
    })

    const ambiguous = guessAmbiguity(items, asString(args.toolInput.query, ''))

    return {
      payload: { items: compact },
      summary: { name: 'search_items', count: items.length },
      ambiguous,
    }
  }

  return {
    payload: { error: `Unknown tool: ${args.toolName}` },
    summary: { name: 'search_items' },
    ambiguous: false,
  }
}

function compactItemForClaude(item: StoredItem) {
  return {
    id: item.id,
    itemName: item.itemName,
    locationRaw: item.locationRaw,
    locationPath: item.locationPath,
    tags: item.tags,
    notes: item.notes,
  }
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string' && v.length > 0)
}

function guessAmbiguity(items: StoredItem[], query: string): boolean {
  const q = query.toLowerCase()
  if (!q) return false
  const matches = items.filter((it) => {
    const hay = [it.itemName, it.locationRaw, ...it.tags].join(' ').toLowerCase()
    return q.split(/\s+/).some((token) => token.length > 2 && hay.includes(token))
  })
  return matches.length > 1
}
