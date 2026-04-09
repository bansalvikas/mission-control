import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth()
  const location = useLocation()

  if (!configured) {
    return <Navigate to="/hoogle/login" replace state={{ from: location }} />
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center font-mono text-sm text-slate-600">
        <span className="animate-blink">_</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/hoogle/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
