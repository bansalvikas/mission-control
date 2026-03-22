import { Terminal } from 'lucide-react'

export function Hero() {
  return (
    <section className="pt-24 pb-12 px-6 text-center relative">
      {/* Terminal icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/20 mb-8">
        <Terminal size={28} className="text-[#00ff88]" />
      </div>

      {/* Title */}
      <h1 className="font-mono text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
        MISSION CONTROL
      </h1>

      {/* Subtitle with blinking cursor */}
      <p className="font-mono text-lg sm:text-xl text-[#00ff88]/70">
        vikasbansal.ai
        <span className="animate-blink text-[#00ff88] ml-0.5">_</span>
      </p>

      {/* Tagline */}
      <p className="mt-6 text-slate-400 text-sm sm:text-base max-w-md mx-auto font-sans">
        Projects, experiments, and things I build.
      </p>
    </section>
  )
}
