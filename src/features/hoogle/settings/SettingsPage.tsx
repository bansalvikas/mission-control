import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAuth } from '../auth/useAuth'
import { getFirebaseAuth } from '../lib/firebase'
import { deleteAllUserData } from '../lib/api'
import { PageShell } from '../ui/PageShell'

export function SettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleSignOut() {
    setBusy(true)
    try {
      await signOut(getFirebaseAuth())
      navigate('/hoogle/login', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteAll() {
    if (!user) return
    if (!confirming) {
      setConfirming(true)
      return
    }
    setBusy(true)
    try {
      await deleteAllUserData(user.uid)
      setConfirming(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell activeRoute="settings">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        <section>
          <h2 className="text-[10px] tracking-[0.3em] text-slate-600 uppercase mb-3">
            account
          </h2>
          <p className="text-sm text-slate-300 truncate">{user?.email ?? '—'}</p>
          {user?.displayName && (
            <p className="text-[11px] text-slate-600 mt-1">{user.displayName}</p>
          )}
        </section>

        <section>
          <h2 className="text-[10px] tracking-[0.3em] text-slate-600 uppercase mb-3">
            session
          </h2>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={busy}
            className="border border-slate-800 hover:border-[#00ff88]/50 hover:text-[#00ff88] text-slate-300 text-xs tracking-wide px-4 py-2 disabled:opacity-50"
          >
            sign out
          </button>
        </section>

        <section>
          <h2 className="text-[10px] tracking-[0.3em] text-slate-600 uppercase mb-3">
            danger zone
          </h2>
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={busy}
            className="border border-red-900/50 hover:border-red-500/70 hover:text-red-400 text-slate-400 text-xs tracking-wide px-4 py-2 disabled:opacity-50"
          >
            {confirming ? 'tap again to confirm wipe' : 'delete all my data'}
          </button>
          <p className="text-[11px] text-slate-700 mt-3 leading-relaxed">
            Wipes every item and every chat message for your account. Cannot be
            undone.
          </p>
        </section>
      </div>
    </PageShell>
  )
}
