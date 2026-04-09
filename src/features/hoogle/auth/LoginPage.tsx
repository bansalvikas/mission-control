import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { getFirebaseAuth, googleProvider } from '../lib/firebase'
import { useAuth } from './useAuth'

export function LoginPage() {
  const { user, loading, configured } = useAuth()
  const navigate = useNavigate()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) navigate('/hoogle/chat', { replace: true })
  }, [user, navigate])

  if (loading) return null
  if (user) return <Navigate to="/hoogle/chat" replace />

  async function handleSignIn() {
    if (!configured) {
      setError(
        'Firebase is not configured. Set VITE_FIREBASE_* variables in .env.local.',
      )
      return
    }
    setError(null)
    setSigningIn(true)
    try {
      await signInWithPopup(getFirebaseAuth(), googleProvider())
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed.'
      setError(msg)
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center px-6 font-mono">
      <div className="absolute inset-0 grid-bg" aria-hidden />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.3em] text-slate-600 uppercase mb-2">
            vikasbansal.ai / hoogle
          </p>
          <h1 className="text-3xl text-slate-200">
            Hoogle<span className="text-[#00ff88] animate-blink">_</span>
          </h1>
          <p className="text-xs text-slate-500 mt-3">
            Google for your home. Remember where you put everything.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full border border-slate-800 hover:border-[#00ff88]/50 hover:bg-[#00ff88]/5 text-slate-300 hover:text-[#00ff88] transition-colors py-3 px-4 text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {signingIn ? 'authenticating...' : '> continue with google'}
        </button>

        {error && (
          <p className="mt-4 text-[11px] text-red-400 border border-red-900/50 px-3 py-2">
            ! {error}
          </p>
        )}

        {!configured && (
          <p className="mt-4 text-[11px] text-slate-600 leading-relaxed">
            Not configured yet. Copy <code className="text-slate-400">.env.example</code> to{' '}
            <code className="text-slate-400">.env.local</code> and fill in your Firebase
            config.
          </p>
        )}

        <div className="mt-12 text-center">
          <a href="/" className="text-[10px] text-slate-700 hover:text-slate-400 tracking-widest uppercase">
            ← back to portfolio
          </a>
        </div>
      </div>
    </div>
  )
}
