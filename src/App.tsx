import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GridBackground } from './components/GridBackground'
import { Hero } from './components/Hero'
import { StatusBar } from './components/StatusBar'
import { ProjectCard, type ProjectStatus } from './components/ProjectCard'
import { Github } from 'lucide-react'
import { HoogleApp } from './features/hoogle/HoogleApp'

interface Project {
  name: string
  description: string
  url?: string
  tech: string[]
  status: ProjectStatus
}

const projects: Project[] = [
  {
    name: 'FitLog',
    description: 'Personal workout tracker PWA — log strength & cardio workouts, track progressive overload, and visualize progress over time.',
    url: 'https://fitlog.vikasbansal.ai',
    tech: ['React', 'TypeScript', 'Tailwind', 'Firebase', 'PWA'],
    status: 'live',
  },
  {
    name: 'Hoogle',
    description: 'Google for my home — a natural-language PWA that remembers where I put physical stuff. Ask "where are my car keys?" and get an instant answer.',
    url: '/hoogle',
    tech: ['React', 'TypeScript', 'Firebase', 'Claude', 'PWA'],
    status: 'live',
  },
]

function Portfolio() {
  const liveCount = projects.filter((p) => p.status === 'live').length

  return (
    <div className="relative min-h-screen font-sans">
      <GridBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <Hero />

        {/* Divider */}
        <div className="border-t border-slate-800/50 max-w-xs mx-auto" />

        <StatusBar projectCount={projects.length} liveCount={liveCount} />

        {/* Divider */}
        <div className="border-t border-slate-800/50 max-w-xs mx-auto mb-12" />

        {/* Project label */}
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800" />
          <span className="font-mono text-[10px] tracking-widest text-slate-600 uppercase">
            Deployed Projects
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800" />
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {projects.map((project) => (
            <ProjectCard key={project.name} {...project} />
          ))}
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 py-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <a
              href="https://github.com/bansalvikas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-[#00ff88] transition-colors"
            >
              <Github size={18} />
            </a>
          </div>
          <p className="font-mono text-[10px] text-slate-700">
            BUILT WITH{' '}
            <a
              href="https://claude.ai/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-[#00ff88] transition-colors underline underline-offset-2"
            >
              CLAUDE CODE
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/hoogle/*" element={<HoogleApp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
