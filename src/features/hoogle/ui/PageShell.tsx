import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

interface Props {
  children: ReactNode
  activeRoute: 'chat' | 'items' | 'settings'
}

const tabs = [
  { key: 'chat' as const, label: 'chat', to: '/hoogle/chat' },
  { key: 'items' as const, label: 'items', to: '/hoogle/items' },
  { key: 'settings' as const, label: 'settings', to: '/hoogle/settings' },
]

export function PageShell({ children, activeRoute }: Props) {
  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-[#0a0a0f] font-mono">
      <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden />

      <header className="relative z-10 border-b border-slate-900 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-slate-200 text-sm tracking-wide">
              hoogle
              <span className="text-[#00ff88] animate-blink">_</span>
            </span>
          </a>
          <nav className="flex items-center gap-4 text-[11px] tracking-widest uppercase">
            {tabs.map((tab) => (
              <NavLink
                key={tab.key}
                to={tab.to}
                className={
                  activeRoute === tab.key
                    ? 'text-[#00ff88]'
                    : 'text-slate-600 hover:text-slate-300'
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex flex-col flex-1 min-h-0">{children}</main>
    </div>
  )
}
