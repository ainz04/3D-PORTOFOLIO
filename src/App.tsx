import { useCallback, useEffect, useState } from 'react'
import { WorkspaceScene } from './components/scene/WorkspaceScene'
import { Navbar } from './components/ui/Navbar'
import { OverlaySections } from './components/ui/OverlaySections'
import { InspectHud } from './components/ui/InspectHud'
import {
  PORTFOLIO_DATA,
  type ProjectItem,
  type SectionId,
} from './data/portfolio'

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('hero')
  const [isDark, setIsDark] = useState(true)
  const [isInspectingCard, setIsInspectingCard] = useState(false)
  const [flipSignal, setFlipSignal] = useState(0)
  const [resetSignal, setResetSignal] = useState(0)
  const [lampPulse, setLampPulse] = useState(0)
  const [selectedProject, setSelectedProject] = useState<ProjectItem>(
    PORTFOLIO_DATA.projects[0]
  )
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr))
    }, 2400)
  }, [])

  // Sync dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // Escape key closes ID Card Inspect Mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isInspectingCard) {
        setIsInspectingCard(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isInspectingCard])

  // Scroll-driven section observer for Hybrid camera transitions
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-section]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section') as SectionId
            if (id) setActiveSection(id)
          }
        })
      },
      { threshold: 0.45 }
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleNavigate = useCallback((section: SectionId) => {
    setIsInspectingCard(false)
    setActiveSection(section)
    const el = document.getElementById(section)
    el?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleToggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      showToast(next ? '🌙 Cozy Night Mode Aktif' : '☀️ Morning Daylight Mode Aktif')
      return next
    })
    setLampPulse((n) => n + 1)
  }, [showToast])

  const handleOpenInspect = useCallback(() => {
    setIsInspectingCard(true)
  }, [])

  const handleCoffeeClick = useCallback(() => {
    showToast('☕ Kopi hangat siap menemani sesi kerja.')
  }, [showToast])

  return (
    <div className="relative min-h-screen w-full">
      {/* Persistent Interactive 3D Workspace */}
      <WorkspaceScene
        activeSection={activeSection}
        isDark={isDark}
        isInspectingCard={isInspectingCard}
        flipSignal={flipSignal}
        resetSignal={resetSignal}
        lampPulse={lampPulse}
        selectedProject={selectedProject}
        onNavigate={handleNavigate}
        onToggleTheme={handleToggleTheme}
        onOpenInspect={handleOpenInspect}
        onCoffeeClick={handleCoffeeClick}
        onNotify={showToast}
      />

      {/* Top Glassmorphism Navbar */}
      <Navbar
        activeSection={activeSection}
        isDark={isDark}
        isInspectingCard={isInspectingCard}
        onNavigate={handleNavigate}
        onToggleTheme={handleToggleTheme}
        onOpenInspect={handleOpenInspect}
      />

      {/* Hybrid Scrollable Sections */}
      <OverlaySections
        isDark={isDark}
        isInspectingCard={isInspectingCard}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onNavigate={handleNavigate}
        onOpenInspect={handleOpenInspect}
      />

      {/* ID Card 360° Inspect Mode HUD */}
      <InspectHud
        isInspecting={isInspectingCard}
        onFlip={() => setFlipSignal((n) => n + 1)}
        onReset={() => setResetSignal((n) => n + 1)}
        onClose={() => setIsInspectingCard(false)}
      />

      {/* Micro-interaction Toast (Solid opaque, zero blur) */}
      {toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 rounded-2xl border border-amber-400 bg-[#0d1322] px-4 py-2.5 text-xs font-semibold text-amber-200 shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  )
}
