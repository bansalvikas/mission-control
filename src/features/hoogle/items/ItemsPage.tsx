import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { deleteItem, subscribeItems } from '../lib/api'
import type { Item } from '../lib/types'
import { PageShell } from '../ui/PageShell'

export function ItemsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loaded, setLoaded] = useState(false)
  const [filter, setFilter] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeItems(user.uid, (next) => {
      setItems(next)
      setLoaded(true)
    })
    return unsub
  }, [user])

  const visible = items.filter((it) => {
    if (!filter.trim()) return true
    const hay = [
      it.itemName,
      it.locationRaw,
      it.rawText,
      ...it.locationPath,
      ...it.tags,
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(filter.trim().toLowerCase())
  })

  async function handleDelete(itemId: string) {
    if (!user) return
    setBusyId(itemId)
    try {
      await deleteItem(user.uid, itemId)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <PageShell activeRoute="items">
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-4">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="filter items..."
            className="w-full bg-transparent border border-slate-900 focus:border-[#00ff88]/50 text-sm text-slate-200 placeholder:text-slate-700 px-3 py-2 focus:outline-none"
          />
        </div>

        {!loaded && <p className="text-[11px] text-slate-700">loading items...</p>}

        {loaded && visible.length === 0 && (
          <p className="text-[12px] text-slate-600">
            {items.length === 0
              ? 'No items yet. Head to chat and tell hoogle where you put something.'
              : 'No items match that filter.'}
          </p>
        )}

        <ul className="space-y-2">
          {visible.map((item) => (
            <li
              key={item.id}
              className="border border-slate-900 hover:border-slate-800 px-3 py-3 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm truncate">{item.itemName}</p>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  {item.locationRaw || item.locationPath.join(' / ')}
                </p>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] tracking-wider uppercase text-slate-600 border border-slate-900 px-1.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                disabled={busyId === item.id}
                className="text-[10px] tracking-widest uppercase text-slate-700 hover:text-red-400 disabled:opacity-50"
              >
                {busyId === item.id ? '...' : 'delete'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  )
}
