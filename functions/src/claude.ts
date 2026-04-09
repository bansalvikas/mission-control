import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function getClaude(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY is not set. Run `firebase functions:secrets:set ANTHROPIC_API_KEY`.',
      )
    }
    client = new Anthropic({ apiKey })
  }
  return client
}

export const MODEL_FAST = process.env.ANTHROPIC_MODEL_FAST || 'claude-haiku-4-5'
export const MODEL_SMART =
  process.env.ANTHROPIC_MODEL_SMART || 'claude-sonnet-4-6'
