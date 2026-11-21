import { useState } from 'react'
import {
  ArrowDown,
  BadgeCheck,
  Check,
  Copy,
  ExternalLink,
  Github,
  Instagram,
  Send,
  Sparkles,
} from 'lucide-react'
import {
  PORTFOLIO_DATA,
  type ProjectItem,
  type SectionId,
} from '../../data/portfolio'

interface OverlaySectionsProps {
  isDark: boolean
  isInspectingCard: boolean
  selectedProject: ProjectItem
  onSelectProject: (project: ProjectItem) => void
  onNavigate: (section: SectionId) => void
  onOpenInspect: () => void
}

export function OverlaySections({
  isDark,
  isInspectingCard,
  selectedProject,
  onSelectProject,
  onNavigate,
  onOpenInspect,
}: OverlaySectionsProps) {
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)
  const [senderName, setSenderName] = useState('')
  const [senderMessage, setSenderMessage] = useState('')

  // Solid, rich opaque card styling (zero transparency / zero blur = ultra smooth 60fps!)
  const cardSurface = isDark
    ? 'border-slate-700 bg-[#0d1322] text-slate-100 shadow-2xl shadow-black/50'
    : 'border-slate-300 bg-[#f8fafc] text-slate-900 shadow-xl shadow-slate-900/15'

  const subSurface = isDark
    ? 'border-slate-800 bg-[#131c31]'
    : 'border-slate-200 bg-[#eef2f7]'

  const mutedText = isDark ? 'text-slate-400' : 'text-slate-600'

  const handleCopyTelegram = () => {
    navigator.clipboard?.writeText(PORTFOLIO_DATA.identity.telegramUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendToTelegram = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = senderName.trim()
    const cleanMsg = senderMessage.trim()
    if (!cleanName || !cleanMsg) return

    const template = `Halo ${PORTFOLIO_DATA.identity.name}, saya ${cleanName}.\n\nKebutuhan saya:\n${cleanMsg}`
    const url = `${PORTFOLIO_DATA.identity.telegramUrl}?text=${encodeURIComponent(template)}`

    window.open(url, '_blank', 'noopener,noreferrer')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <main
      className={`pointer-events-none relative z-10 space-y-28 pb-24 transition-opacity duration-300 ${
        isInspectingCard ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* ==================== 1. HERO SECTION (FAR LEFT) ==================== */}
      <section
        id="hero"
        data-section="hero"
        className="mx-auto flex min-h-screen max-w-[1440px] flex-col justify-end px-4 pb-12 pt-28 md:justify-center md:px-8"
      >
        <div
          className={`pointer-events-auto w-full max-w-[370px] overflow-hidden rounded-2xl border ${cardSurface}`}
        >
          <div className="h-1.5 w-full bg-amber-400" />
          <div className="p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1 font-mono text-[11px] font-bold text-slate-950">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI DEVELOPER &amp; PROMPTER</span>
            </div>

            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {PORTFOLIO_DATA.identity.name}{' '}
              <span className="text-amber-400">— {PORTFOLIO_DATA.identity.role}</span>
            </h1>

            <p className={`mt-3 text-xs leading-relaxed sm:text-sm ${mutedText}`}>
              {PORTFOLIO_DATA.identity.tagline}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                onClick={onOpenInspect}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-amber-300"
              >
                <BadgeCheck className="h-4 w-4" />
                Inspect ID Card
              </button>

              <button
                onClick={() => onNavigate('projects')}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                  isDark
                    ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-400 hover:text-cyan-300'
                    : 'border-slate-300 bg-white text-slate-800 hover:border-sky-600'
                }`}
              >
                Lihat Projects
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <div
              className={`mt-5 rounded-xl border p-3 text-center font-mono text-xs tracking-widest ${subSurface} ${mutedText}`}
            >
              .. / .-.. --- ...- . / -.-- --- ..-
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 2. ABOUT & SKILLS SECTION (FAR RIGHT) ==================== */}
      <section
        id="about"
        data-section="about"
        className="mx-auto flex min-h-screen max-w-[1440px] items-center justify-end px-4 py-28 md:px-8"
      >
        <div
          className={`pointer-events-auto w-full max-w-[390px] overflow-hidden rounded-2xl border ${cardSurface}`}
        >
          <div className="h-1.5 w-full bg-purple-500" />
          <div className="p-6">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-purple-400">
              01 // Tentang &amp; Keahlian
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold">
              {PORTFOLIO_DATA.about.headline}
            </h2>
            <p className={`mt-2.5 text-xs leading-relaxed ${mutedText}`}>
              {PORTFOLIO_DATA.about.bio}
            </p>

            {/* Mini Stats */}
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {PORTFOLIO_DATA.about.stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-xl border p-2.5 text-center ${subSurface}`}
                >
                  <div className="font-display text-base font-bold text-amber-400">
                    {stat.value}
                  </div>
                  <div className={`text-[10px] font-medium ${mutedText}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Skill Groups */}
            <div className="mt-5 space-y-3">
              {PORTFOLIO_DATA.skills.map((group) => (
                <div key={group.name}>
                  <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <span>{group.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((skill) => (
                      <span
                        key={skill}
                        className={`rounded-lg border px-2 py-0.5 font-mono text-[11px] font-medium ${subSurface}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 3. PROJECTS SECTION (FAR LEFT) ==================== */}
      <section
        id="projects"
        data-section="projects"
        className="mx-auto flex min-h-screen max-w-[1440px] items-center justify-start px-4 py-28 md:px-8"
      >
        <div
          className={`pointer-events-auto w-full max-w-[390px] overflow-hidden rounded-2xl border ${cardSurface}`}
        >
          <div className="h-1.5 w-full bg-cyan-400" />
          <div className="p-6">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">
              02 // Projek Pilihan
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold">
              Karya &amp; Solusi Berbasis AI
            </h2>
            <p className={`mt-1 text-xs ${mutedText}`}>
              Pilih projek di bawah untuk melihat pratinjaunya pada layar monitor.
            </p>

            <div className="mt-4 space-y-2.5">
              {PORTFOLIO_DATA.projects.map((project) => {
                const active = project.id === selectedProject.id
                return (
                  <div
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition ${
                      active
                        ? isDark
                          ? 'border-cyan-400 bg-[#13253d]'
                          : 'border-sky-600 bg-sky-50'
                        : `${subSurface} hover:border-slate-500`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="font-display text-sm font-bold">
                          {project.title}
                        </h3>
                        <p className={`text-[11px] ${mutedText}`}>{project.category}</p>
                      </div>
                      <span
                        className="rounded-md px-2 py-0.5 font-mono text-[10px] font-bold text-slate-950"
                        style={{ backgroundColor: project.accent }}
                      >
                        {project.status}
                      </span>
                    </div>

                    <p className={`mt-2 text-xs leading-relaxed ${mutedText}`}>
                      {project.description}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {project.tech.map((t) => (
                          <span
                            key={t}
                            className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                              isDark
                                ? 'bg-slate-800 text-slate-200'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={project.repoUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-lg p-1 opacity-80 transition hover:opacity-100"
                          title="Repository"
                        >
                          <Github className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={project.demoUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-lg p-1 opacity-80 transition hover:opacity-100"
                          title="Live Demo"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4. CONTACT SECTION (FAR LEFT) ==================== */}
      <section
        id="contact"
        data-section="contact"
        className="mx-auto flex min-h-screen max-w-[1440px] items-center justify-start px-4 py-28 md:px-8"
      >
        <div
          className={`pointer-events-auto w-full max-w-[375px] overflow-hidden rounded-2xl border ${cardSurface}`}
        >
          <div className="h-1.5 w-full bg-emerald-400" />
          <div className="p-6">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              03 // Kontak
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold">
              Mari Berkolaborasi
            </h2>
            <p className={`mt-2 text-xs leading-relaxed ${mutedText}`}>
              Butuh pengembangan website, aplikasi berbasis AI, atau perancangan sistem prompt?
              Hubungi <b>{PORTFOLIO_DATA.identity.name}</b> melalui formulir di bawah ini.
            </p>

            {/* Quick Telegram Link & Copy */}
            <div
              className={`mt-4 flex items-center justify-between rounded-xl border px-3.5 py-2.5 ${subSurface}`}
            >
              <a
                href={PORTFOLIO_DATA.identity.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 font-mono text-xs transition hover:text-cyan-400"
              >
                <Send className="h-4 w-4 text-cyan-400" />
                <span>{PORTFOLIO_DATA.identity.telegramHandle}</span>
              </a>
              <button
                type="button"
                onClick={handleCopyTelegram}
                className="inline-flex items-center gap-1 rounded-lg bg-cyan-500 px-2.5 py-1 text-[11px] font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Interactive Message Form -> Direct Pre-filled Telegram Chat */}
            <form className="mt-3.5 space-y-2.5" onSubmit={handleSendToTelegram}>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Nama lengkap"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:border-cyan-400 ${subSurface}`}
              />
              <textarea
                rows={3}
                required
                value={senderMessage}
                onChange={(e) => setSenderMessage(e.target.value)}
                placeholder="Ceritakan kebutuhan website, aplikasi, atau projek AI kamu..."
                className={`w-full resize-none rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:border-cyan-400 ${subSurface}`}
              />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-300"
              >
                <Send className="h-3.5 w-3.5" />
                {sent ? 'Membuka Telegram...' : 'Kirim Pesan via Telegram'}
              </button>
            </form>

            {/* Social Links */}
            <div className="mt-4 flex items-center justify-center gap-2.5">
              <a
                href={PORTFOLIO_DATA.identity.github}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition hover:border-slate-500 ${subSurface}`}
              >
                <Github className="h-3.5 w-3.5" />
                GitHub
              </a>
              <a
                href={PORTFOLIO_DATA.identity.instagram}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition hover:border-pink-400 ${subSurface}`}
              >
                <Instagram className="h-3.5 w-3.5 text-pink-400" />
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
