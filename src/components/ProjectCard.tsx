import { ExternalLink } from 'lucide-react'

export type ProjectStatus = 'live' | 'coming_soon' | 'wip'

interface ProjectCardProps {
  name: string
  description: string
  url?: string
  tech: string[]
  status: ProjectStatus
}

const statusConfig = {
  live: {
    label: 'LIVE',
    dotClass: 'bg-[#00ff88] animate-pulse-glow text-[#00ff88]',
    textClass: 'text-[#00ff88]',
  },
  wip: {
    label: 'WIP',
    dotClass: 'bg-yellow-400',
    textClass: 'text-yellow-400',
  },
  coming_soon: {
    label: 'COMING SOON',
    dotClass: 'bg-slate-600',
    textClass: 'text-slate-500',
  },
}

export function ProjectCard({ name, description, url, tech, status }: ProjectCardProps) {
  const config = statusConfig[status]
  const isClickable = status === 'live' && url

  const content = (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border
        bg-[#0f0f17] transition-all duration-300
        ${isClickable
          ? 'border-slate-800 hover:border-[#00ff88]/30 hover:shadow-[0_0_30px_rgba(0,255,136,0.05)] cursor-pointer'
          : 'border-slate-800/50 opacity-60'
        }
      `}
    >
      {/* Top accent line */}
      {status === 'live' && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff88]/50 to-transparent" />
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-mono text-xl font-bold text-white group-hover:text-[#00ff88] transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.dotClass}`} />
            <span className={`font-mono text-[10px] font-medium ${config.textClass}`}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-4 font-sans">
          {description}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tech.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Link */}
        {isClickable && (
          <div className="flex items-center gap-1 text-xs font-mono text-[#00ff88]/70 group-hover:text-[#00ff88] transition-colors">
            <span>LAUNCH</span>
            <ExternalLink size={12} />
          </div>
        )}
      </div>
    </div>
  )

  if (isClickable) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block no-underline">
        {content}
      </a>
    )
  }

  return content
}
