import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { LoginPage } from './auth/LoginPage'
import { RequireAuth } from './auth/RequireAuth'
import { ChatPage } from './chat/ChatPage'
import { ItemsPage } from './items/ItemsPage'
import { SettingsPage } from './settings/SettingsPage'

export function HoogleApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route index element={<Navigate to="chat" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="chat"
          element={
            <RequireAuth>
              <ChatPage />
            </RequireAuth>
          }
        />
        <Route
          path="items"
          element={
            <RequireAuth>
              <ItemsPage />
            </RequireAuth>
          }
        />
        <Route
          path="settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="chat" replace />} />
      </Routes>
    </AuthProvider>
  )
}
