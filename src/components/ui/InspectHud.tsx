import { Move, RefreshCw, RotateCcw, X } from 'lucide-react'
import { PORTFOLIO_DATA } from '../../data/portfolio'

interface InspectHudProps {
  isInspecting: boolean
  onFlip: () => void
  onReset: () => void
  onClose: () => void
}

export function InspectHud({
  isInspecting,
  onFlip,
  onReset,
  onClose,
}: InspectHudProps) {
  if (!isInspecting) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-6">
      {/* Top Bar (Solid opaque styling, zero backdrop-blur) */}
      <div className="flex items-start justify-between">
        <div className="pointer-events-auto rounded-2xl border border-amber-400/50 bg-[#0d1322] px-4 py-3 shadow-xl">
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400">
            ID CARD INSPECT MODE
          </div>
          <div className="mt-0.5 font-display text-lg font-bold text-white">
            {PORTFOLIO_DATA.identity.name}{' '}
            <span className="text-amber-400">— {PORTFOLIO_DATA.identity.role}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-[#0d1322] px-4 py-2.5 text-xs font-bold text-slate-100 shadow-xl transition hover:border-amber-400 hover:text-amber-300"
        >
          <X className="h-4 w-4" />
          <span>Kembali ke Meja (Esc)</span>
        </button>
      </div>

      {/* Bottom Controls & Hint */}
      <div className="flex flex-col items-center gap-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-slate-700 bg-[#0d1322] p-2 shadow-2xl">
          <button
            onClick={onFlip}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-300"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Balik Kartu (Depan / Belakang)
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Sudut
          </button>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-[#0d1322] px-4 py-1.5 font-mono text-xs text-slate-200 shadow-lg">
          <Move className="h-3.5 w-3.5 text-amber-400" />
          <span>Klik &amp; Drag di mana saja untuk memutar ID Card 360°</span>
        </div>
      </div>
    </div>
  )
}
