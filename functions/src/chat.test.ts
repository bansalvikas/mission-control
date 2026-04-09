import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the Firestore helper module so tests never touch a real database.
// The mock factory must not reference outer variables — vi.mock is hoisted.
vi.mock('./firestore', () => ({
  loadRecentMessages: vi.fn().mockResolvedValue([]),
  loadAllItems: vi.fn().mockResolvedValue([]),
  writeItem: vi.fn().mockResolvedValue('mock-item-id'),
  appendMessage: vi.fn().mockResolvedValue('mock-msg-id'),
}))

// Mock the Anthropic client so we can control what Claude "returns".
const createMock = vi.fn()
vi.mock('./claude', () => ({
  getClaude: () => ({ messages: { create: createMock } }),
  MODEL_FAST: 'mock-haiku',
  MODEL_SMART: 'mock-sonnet',
}))

// Imports MUST come after vi.mock calls so the mocks are applied.
import { runChatTurn } from './chat'
import * as firestore from './firestore'

describe('runChatTurn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createMock.mockReset()
    vi.mocked(firestore.loadAllItems).mockResolvedValue([])
    vi.mocked(firestore.loadRecentMessages).mockResolvedValue([])
    vi.mocked(firestore.writeItem).mockResolvedValue('mock-item-id')
    vi.mocked(firestore.appendMessage).mockResolvedValue('mock-msg-id')
  })

  it('routes declarative input through the store_item tool', async () => {
    createMock
      .mockResolvedValueOnce({
        stop_reason: 'tool_use',
        content: [
          {
            type: 'tool_use',
            id: 'tu_store',
            name: 'store_item',
            input: {
              itemName: 'passport',
              locationPath: ['study', 'safe'],
              locationRaw: 'safe in the study',
              tags: ['passport', 'documents'],
              notes: null,
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        stop_reason: 'end_turn',
        content: [
          { type: 'text', text: 'Got it, stored your passport in the study safe.' },
        ],
      })

    const result = await runChatTurn({
      uid: 'user-1',
      conversationId: 'default',
      message: 'Put my passport in the safe in the study.',
    })

    expect(firestore.writeItem).toHaveBeenCalledOnce()
    expect(firestore.writeItem).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        itemName: 'passport',
        locationPath: ['study', 'safe'],
        tags: ['passport', 'documents'],
      }),
    )
    expect(result.toolCalls).toHaveLength(1)
    expect(result.toolCalls[0].name).toBe('store_item')
    expect(result.reply.toLowerCase()).toContain('passport')
    expect(createMock).toHaveBeenCalledTimes(2)
  })

  it('routes interrogative input through the search_items tool', async () => {
    vi.mocked(firestore.loadAllItems).mockResolvedValueOnce([
      {
        id: 'item-1',
        rawText: 'Put my passport in the safe in the study.',
        itemName: 'passport',
        locationRaw: 'safe in the study',
        locationPath: ['study', 'safe'],
        tags: ['passport'],
        notes: null,
        createdAt: null,
        updatedAt: null,
      },
    ])

    createMock
      .mockResolvedValueOnce({
        stop_reason: 'tool_use',
        content: [
          {
            type: 'tool_use',
            id: 'tu_search',
            name: 'search_items',
            input: { query: 'passport' },
          },
        ],
      })
      .mockResolvedValueOnce({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'In the safe in your study.' }],
      })

    const result = await runChatTurn({
      uid: 'user-1',
      conversationId: 'default',
      message: 'where is my passport?',
    })

    expect(firestore.loadAllItems).toHaveBeenCalledWith('user-1')
    expect(firestore.writeItem).not.toHaveBeenCalled()
    expect(result.toolCalls).toHaveLength(1)
    expect(result.toolCalls[0].name).toBe('search_items')
    expect(result.reply.toLowerCase()).toMatch(/study|safe/)
  })

  it('persists the user message before calling Claude', async () => {
    createMock.mockResolvedValueOnce({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Hello.' }],
    })

    await runChatTurn({
      uid: 'user-1',
      conversationId: 'default',
      message: 'hi',
    })

    // First appendMessage call should be the user's message.
    const firstCall = vi.mocked(firestore.appendMessage).mock.calls[0]
    expect(firstCall[2]).toMatchObject({ role: 'user', content: 'hi' })
  })
})
