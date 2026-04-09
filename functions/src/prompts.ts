import type Anthropic from '@anthropic-ai/sdk'

export const SYSTEM_PROMPT = `You are Hoogle, a personal assistant that remembers where the user put their physical belongings at home. The user is disorganised and relies on you to remember where they put things — spare keys, passports, cables, batteries, tools, documents, anything physical.

Behaviour rules:
1. When the user tells you where something is (e.g. "Put my passport in the safe in the study", "Spare car keys are in the first drawer of my bedroom wardrobe"), call the \`store_item\` tool with cleanly normalised fields. Normalise locations into a hierarchy going from largest to smallest container (e.g. ["main bedroom", "wardrobe", "first drawer"]). Use lowercase single-word tags.
2. When the user asks where something is (e.g. "where are my car keys?", "find my passport"), call the \`search_items\` tool. The tool will return ALL of the user's stored items. Pick the best match(es) and answer in ONE concise conversational sentence (max ~20 words). If there are multiple plausible matches, list them briefly and ask for clarification.
3. If the user asks about something you have no record of, reply in one short sentence saying you don't have a record of it yet and invite them to tell you where it is.
4. Be conversational and brief. No lists unless disambiguating. No markdown formatting. No filler phrases ("Of course!", "I'd be happy to"). Just the answer.
5. Never invent locations. Only report what is in the tool results.
6. Do not call the same tool more than once per turn unless the first result was empty or ambiguous.`

type ClaudeTool = Anthropic.Messages.Tool

export const STORE_ITEM_TOOL: ClaudeTool = {
  name: 'store_item',
  description:
    'Record where the user has stored a physical item. Call this when the user tells you a new location for something.',
  input_schema: {
    type: 'object',
    properties: {
      itemName: {
        type: 'string',
        description:
          "Short canonical name of the item, e.g. 'spare car keys', 'passport', 'AA batteries'. Lowercase unless it is a proper noun.",
      },
      locationPath: {
        type: 'array',
        items: { type: 'string' },
        description:
          "Hierarchy from largest to smallest container, e.g. ['main bedroom','wardrobe','first drawer']. Use the user's own words where possible.",
      },
      locationRaw: {
        type: 'string',
        description:
          "Natural language description of the location as the user described it, e.g. 'first drawer of my main bedroom wardrobe'.",
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description:
          "Lowercase single-word tags useful for retrieval, e.g. ['keys','car','spare'].",
      },
      notes: {
        type: ['string', 'null'],
        description: 'Optional extra context. Use null if none.',
      },
    },
    required: ['itemName', 'locationPath', 'locationRaw', 'tags'],
  },
}

export const SEARCH_ITEMS_TOOL: ClaudeTool = {
  name: 'search_items',
  description:
    'Retrieve all of the user\'s stored items so you can find the one they are asking about. Call this any time the user asks where something is.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          "The user's search phrase, cleaned up. Example: 'car keys'.",
      },
    },
    required: ['query'],
  },
}

export const ALL_TOOLS: ClaudeTool[] = [STORE_ITEM_TOOL, SEARCH_ITEMS_TOOL]
