import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { getDb, getFns } from './firebase'
import type { ChatMessage, ChatResponse, Item } from './types'

const DEFAULT_CONVERSATION_ID = 'default'

function itemsCollection(uid: string) {
  return collection(getDb(), 'users', uid, 'items')
}

function messagesCollection(uid: string, conversationId = DEFAULT_CONVERSATION_ID) {
  return collection(
    getDb(),
    'users',
    uid,
    'conversations',
    conversationId,
    'messages',
  )
}

function conversationDoc(uid: string, conversationId = DEFAULT_CONVERSATION_ID) {
  return doc(getDb(), 'users', uid, 'conversations', conversationId)
}

export async function ensureDefaultConversation(uid: string): Promise<string> {
  await setDoc(
    conversationDoc(uid),
    {
      title: 'Hoogle',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
  return DEFAULT_CONVERSATION_ID
}

export function subscribeMessages(
  uid: string,
  onUpdate: (messages: ChatMessage[]) => void,
  conversationId = DEFAULT_CONVERSATION_ID,
): Unsubscribe {
  const q = query(
    messagesCollection(uid, conversationId),
    orderBy('createdAt', 'asc'),
    limit(200),
  )
  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ChatMessage, 'id'>),
    }))
    onUpdate(messages)
  })
}

export function subscribeItems(
  uid: string,
  onUpdate: (items: Item[]) => void,
): Unsubscribe {
  const q = query(itemsCollection(uid), orderBy('updatedAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const items: Item[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Item, 'id'>),
    }))
    onUpdate(items)
  })
}

export async function deleteItem(uid: string, itemId: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'users', uid, 'items', itemId))
}

export async function deleteAllUserData(uid: string): Promise<void> {
  const [itemsSnap, messagesSnap] = await Promise.all([
    getDocs(itemsCollection(uid)),
    getDocs(messagesCollection(uid)),
  ])
  await Promise.all([
    ...itemsSnap.docs.map((d) => deleteDoc(d.ref)),
    ...messagesSnap.docs.map((d) => deleteDoc(d.ref)),
  ])
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const callable = httpsCallable<
    { message: string; conversationId: string },
    ChatResponse
  >(getFns(), 'chat')
  const result = await callable({
    message,
    conversationId: DEFAULT_CONVERSATION_ID,
  })
  return result.data
}

export { DEFAULT_CONVERSATION_ID }
