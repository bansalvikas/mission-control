import { useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured()
  const [user, setUser] = useState<User | null>(null)
  // If Firebase isn't configured there is nothing to wait for, so we start
  // in the loaded state. If it is configured we wait for the first auth
  // callback to fire.
  const [loading, setLoading] = useState(configured)

  useEffect(() => {
    if (!configured) return
    const unsub = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
    return unsub
  }, [configured])

  return (
    <AuthContext.Provider value={{ user, loading, configured }}>
      {children}
    </AuthContext.Provider>
  )
}
