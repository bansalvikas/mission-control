import { initializeApp } from 'firebase-admin/app'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { logger } from 'firebase-functions/v2'
import { runChatTurn } from './chat'

initializeApp()

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY')

interface ChatRequest {
  message: string
  conversationId: string
}

export const chat = onCall<ChatRequest>(
  {
    region: 'us-central1',
    secrets: [ANTHROPIC_API_KEY],
    enforceAppCheck: false,
    cors: true,
  },
  async (request) => {
    const uid = request.auth?.uid
    if (!uid) {
      throw new HttpsError('unauthenticated', 'You must be signed in.')
    }

    const { message, conversationId } = request.data ?? {}
    if (typeof message !== 'string' || message.trim().length === 0) {
      throw new HttpsError('invalid-argument', 'message is required.')
    }
    if (typeof conversationId !== 'string' || conversationId.length === 0) {
      throw new HttpsError('invalid-argument', 'conversationId is required.')
    }
    if (message.length > 2000) {
      throw new HttpsError('invalid-argument', 'message is too long.')
    }

    try {
      const result = await runChatTurn({
        uid,
        conversationId,
        message: message.trim(),
      })
      return result
    } catch (err) {
      logger.error('chat turn failed', err)
      const msg = err instanceof Error ? err.message : 'Unknown error'
      throw new HttpsError('internal', msg)
    }
  },
)
