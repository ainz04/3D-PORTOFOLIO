import { BadgeCheck, Moon, Sun } from 'lucide-react'
import { PORTFOLIO_DATA, type SectionId } from '../../data/portfolio'

interface NavbarProps {
  activeSection: SectionId
  isDark: boolean
  isInspectingCard: boolean
  onNavigate: (section: SectionId) => void
  onToggleTheme: () => void
  onOpenInspect: () => void
}

const NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: 'hero', label: 'Desk' },
  { id: 'about', label: 'About & Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

export function Navbar({
  activeSection,
  isDark,
  isInspectingCard,
  onNavigate,
  onToggleTheme,
  onOpenInspect,
}: NavbarProps) {
  if (isInspectingCard) return null

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center px-4 pt-4">
      {/* Solid opaque navbar (zero transparency/blur overhead) */}
      <nav
        className={`pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border px-4 py-2.5 shadow-xl transition-colors ${
          isDark
            ? 'border-slate-700 bg-[#0d1322] text-slate-100'
            : 'border-slate-300 bg-[#f8fafc] text-slate-900'
        }`}
      >
        {/* Brand */}
        <button
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-2.5 text-left transition hover:opacity-85"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 font-display text-sm font-extrabold text-slate-950">
            J
          </span>
          <div className="flex items-center gap-1.5 font-display text-sm font-bold tracking-wide">
            <span>{PORTFOLIO_DATA.identity.name}</span>
            <span className="rounded bg-amber-400 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-slate-950">
              {PORTFOLIO_DATA.identity.role}
            </span>
          </div>
        </button>

        {/* Section Links */}
        <div className="hidden items-center gap-1.5 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? isDark
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-sky-600 text-white'
                    : isDark
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInspect}
            className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-amber-300"
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            <span>ID Card</span>
          </button>

          <button
            onClick={onToggleTheme}
            title="Toggle Day / Cozy Night Mode (atau klik Lampu Meja 3D)"
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
              isDark
                ? 'border-slate-700 bg-slate-900 text-amber-300 hover:border-amber-400'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
            }`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </nav>
    </header>
  )
}
