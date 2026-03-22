interface StatusBarProps {
  projectCount: number
  liveCount: number
}

export function StatusBar({ projectCount, liveCount }: StatusBarProps) {
  return (
    <div className="flex items-center justify-center gap-6 sm:gap-8 py-4 px-6 mx-auto max-w-lg">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse-glow text-[#00ff88]" />
        <span className="font-mono text-xs sm:text-sm text-slate-400">
          SYSTEMS ONLINE
        </span>
      </div>
      <div className="h-4 w-px bg-slate-800" />
      <span className="font-mono text-xs sm:text-sm text-slate-400">
        PROJECTS: <span className="text-white">{projectCount}</span>
      </span>
      <div className="h-4 w-px bg-slate-800" />
      <span className="font-mono text-xs sm:text-sm text-slate-400">
        LIVE: <span className="text-[#00ff88]">{liveCount}</span>
      </span>
    </div>
  )
}
