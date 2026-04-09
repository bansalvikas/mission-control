import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'

export interface StoredItem {
  id: string
  rawText: string
  itemName: string
  locationRaw: string
  locationPath: string[]
  tags: string[]
  notes: string | null
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export interface StoredMessage {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  toolName: 'store_item' | 'search_items' | null
  toolPayload: Record<string, unknown> | null
  itemId: string | null
  createdAt: Timestamp | null
}

function db() {
  return getFirestore()
}

function itemsCol(uid: string) {
  return db().collection('users').doc(uid).collection('items')
}

function messagesCol(uid: string, conversationId: string) {
  return db()
    .collection('users')
    .doc(uid)
    .collection('conversations')
    .doc(conversationId)
    .collection('messages')
}

function conversationDoc(uid: string, conversationId: string) {
  return db()
    .collection('users')
    .doc(uid)
    .collection('conversations')
    .doc(conversationId)
}

export async function loadAllItems(uid: string): Promise<StoredItem[]> {
  const snap = await itemsCol(uid).orderBy('updatedAt', 'desc').get()
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      rawText: (data.rawText as string) ?? '',
      itemName: (data.itemName as string) ?? '',
      locationRaw: (data.locationRaw as string) ?? '',
      locationPath: (data.locationPath as string[]) ?? [],
      tags: (data.tags as string[]) ?? [],
      notes: (data.notes as string | null) ?? null,
      createdAt: (data.createdAt as Timestamp) ?? null,
      updatedAt: (data.updatedAt as Timestamp) ?? null,
    }
  })
}

export async function loadRecentMessages(
  uid: string,
  conversationId: string,
  count: number,
): Promise<StoredMessage[]> {
  const snap = await messagesCol(uid, conversationId)
    .orderBy('createdAt', 'desc')
    .limit(count)
    .get()
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        role: data.role as StoredMessage['role'],
        content: (data.content as string) ?? '',
        toolName: (data.toolName as StoredMessage['toolName']) ?? null,
        toolPayload: (data.toolPayload as Record<string, unknown> | null) ?? null,
        itemId: (data.itemId as string | null) ?? null,
        createdAt: (data.createdAt as Timestamp) ?? null,
      }
    })
    .reverse()
}

export interface StoreItemInput {
  rawText: string
  itemName: string
  locationRaw: string
  locationPath: string[]
  tags: string[]
  notes: string | null
}

export async function writeItem(uid: string, input: StoreItemInput): Promise<string> {
  const ref = itemsCol(uid).doc()
  await ref.set({
    ...input,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function appendMessage(
  uid: string,
  conversationId: string,
  msg: Omit<StoredMessage, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = messagesCol(uid, conversationId).doc()
  await ref.set({
    ...msg,
    createdAt: FieldValue.serverTimestamp(),
  })
  await conversationDoc(uid, conversationId).set(
    { updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  )
  return ref.id
}
