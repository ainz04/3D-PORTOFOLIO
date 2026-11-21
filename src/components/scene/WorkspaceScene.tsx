import { memo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { CameraRig } from './CameraRig'
import { DeskSetup } from './DeskSetup'
import { DeskLamp } from './DeskLamp'
import { HangingIdCard } from './HangingIdCard'
import type { ProjectItem, SectionId } from '../../data/portfolio'

interface WorkspaceSceneProps {
  activeSection: SectionId
  isDark: boolean
  isInspectingCard: boolean
  flipSignal: number
  resetSignal: number
  lampPulse: number
  selectedProject: ProjectItem
  onNavigate: (section: SectionId) => void
  onToggleTheme: () => void
  onOpenInspect: () => void
  onCoffeeClick: () => void
  onNotify: (msg: string) => void
}

// Memoized lighting & environment so changing menu NEVER re-bakes or re-reconciles them
const SceneEnvironment = memo(function SceneEnvironment({
  isDark,
  isInspectingCard,
}: {
  isDark: boolean
  isInspectingCard: boolean
}) {
  return (
    <>
      <color attach="background" args={[isDark ? '#090d16' : '#dbeafe']} />
      <fog attach="fog" args={[isDark ? '#090d16' : '#dbeafe', 10, 23]} />

      <hemisphereLight
        args={[
          isDark ? '#60a5fa' : '#fff7ed',
          isDark ? '#0f172a' : '#94a3b8',
          isDark ? 0.55 : 0.95,
        ]}
      />
      <directionalLight
        position={[-4.5, 5.2, 3.2]}
        intensity={isDark ? 1.15 : 2.1}
        color={isDark ? '#93c5fd' : '#ffedd5'}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-near={1}
        shadow-camera-far={16}
        shadow-camera-left={-4.5}
        shadow-camera-right={4.5}
        shadow-camera-top={4.5}
        shadow-camera-bottom={-4.5}
        shadow-bias={-0.0005}
      />

      {isInspectingCard && (
        <>
          <pointLight position={[0.9, 1.5, 2.8]} intensity={3.0} color="#fef3c7" />
          <pointLight position={[-1.1, 0.8, 2.4]} intensity={2.0} color="#38bdf8" />
        </>
      )}

      <Environment resolution={64} frames={1}>
        <Lightformer
          form="rect"
          intensity={isDark ? 1.8 : 3.2}
          color={isDark ? '#7dd3fc' : '#fef3c7'}
          scale={[3, 2.2, 1]}
          position={[-5, 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Lightformer
          form="circle"
          intensity={isDark ? 1.2 : 1.5}
          color="#fbbf24"
          scale={2.5}
          position={[2, 4, 3]}
        />
        <Lightformer
          form="rect"
          intensity={0.8}
          color="#38bdf8"
          scale={[6, 2, 1]}
          position={[0, 3, -5]}
        />
      </Environment>

      <ContactShadows
        position={[0, -2.18, 0]}
        frames={1}
        resolution={256}
        opacity={isDark ? 0.55 : 0.3}
        scale={11}
        blur={2}
        far={4.5}
      />
    </>
  )
})

export function WorkspaceScene({
  activeSection,
  isDark,
  isInspectingCard,
  flipSignal,
  resetSignal,
  lampPulse,
  selectedProject,
  onNavigate,
  onToggleTheme,
  onOpenInspect,
  onCoffeeClick,
  onNotify,
}: WorkspaceSceneProps) {
  return (
    <div className="fixed inset-0 z-0 h-screen w-screen">
      <Canvas
        shadows
        dpr={[1, 1.25]}
        camera={{ position: [4.75, 3.2, 5.45], fov: 38, near: 0.1, far: 45 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <Suspense fallback={null}>
          <SceneEnvironment
            isDark={isDark}
            isInspectingCard={isInspectingCard}
          />

          <DeskSetup
            isDark={isDark}
            isInspectingCard={isInspectingCard}
            selectedProject={selectedProject}
            onNavigate={onNavigate}
            onCoffeeClick={onCoffeeClick}
            onNotify={onNotify}
          />

          <DeskLamp
            isDark={isDark}
            isInspectingCard={isInspectingCard}
            onToggleTheme={onToggleTheme}
          />

          <HangingIdCard
            isInspecting={isInspectingCard}
            flipSignal={flipSignal}
            resetSignal={resetSignal}
            lampPulse={lampPulse}
            onOpenInspect={onOpenInspect}
          />
        </Suspense>

        <CameraRig
          activeSection={activeSection}
          isInspectingCard={isInspectingCard}
        />
      </Canvas>
    </div>
  )
}
