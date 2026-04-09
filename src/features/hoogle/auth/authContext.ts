import { createContext } from 'react'
import type { User } from 'firebase/auth'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  configured: boolean
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  configured: false,
})
