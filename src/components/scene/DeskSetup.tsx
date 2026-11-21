import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { PORTFOLIO_DATA, type ProjectItem, type SectionId } from '../../data/portfolio'
import {
  createFloorTexture,
  createKeyboardTexture,
  createPegboardTexture,
  createPhoneTexture,
  createRugTexture,
  createSkyTexture,
  createWoodTexture,
} from './proceduralTextures'

interface DeskSetupProps {
  isDark: boolean
  isInspectingCard: boolean
  selectedProject: ProjectItem
  onNavigate: (section: SectionId) => void
  onCoffeeClick: () => void
  onNotify: (msg: string) => void
}

const PC_RGB_MODES = [
  { name: 'Cyber Cyan', color: '#38bdf8', secondary: '#a855f7' },
  { name: 'Executive Gold', color: '#fbbf24', secondary: '#f59e0b' },
  { name: 'Matrix Emerald', color: '#10b981', secondary: '#2dd4bf' },
  { name: 'Synthwave Violet', color: '#c084fc', secondary: '#ec4899' },
]

function createMonitorTexture(project: ProjectItem): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 330
  const ctx = canvas.getContext('2d')!
  ctx.scale(768 / 1024, 330 / 440)

  const bg = ctx.createLinearGradient(0, 0, 1024, 440)
  bg.addColorStop(0, '#070b14')
  bg.addColorStop(1, '#0f172a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 1024, 440)

  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, 1024, 38)
  const dots = ['#ef4444', '#f59e0b', '#10b981']
  dots.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(24 + i * 22, 19, 6, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.fillStyle = '#94a3b8'
  ctx.font = '600 16px "JetBrains Mono", monospace'
  ctx.fillText(`juda@boss-workstation: ~/projects/${project.id}`, 108, 25)

  ctx.fillStyle = '#0c1322'
  ctx.fillRect(20, 56, 310, 360)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'
  ctx.strokeRect(20, 56, 310, 360)

  const codeLines = [
    { color: '#c084fc', text: 'const role = "AI Developer";' },
    { color: '#38bdf8', text: 'async function runAgent() {' },
    { color: '#94a3b8', text: '  const ctx = buildPrompt();' },
    { color: '#34d399', text: `  return "${project.status}";` },
    { color: '#38bdf8', text: '}' },
    { color: '#fbbf24', text: '// AI Pipeline Active' },
    { color: '#64748b', text: '> syncing LLM context...' },
    { color: '#10b981', text: '✓ system ready' },
  ]
  ctx.font = '500 15px "JetBrains Mono", monospace'
  codeLines.forEach((line, i) => {
    ctx.fillStyle = line.color
    ctx.fillText(line.text, 38, 96 + i * 36)
  })

  ctx.fillStyle = '#131d31'
  ctx.beginPath()
  ctx.roundRect(354, 56, 648, 360, 18)
  ctx.fill()
  ctx.strokeStyle = project.accent
  ctx.lineWidth = 2.5
  ctx.stroke()

  ctx.fillStyle = `${project.accent}28`
  ctx.beginPath()
  ctx.roundRect(388, 86, 170, 34, 17)
  ctx.fill()
  ctx.fillStyle = project.accent
  ctx.font = '700 15px "JetBrains Mono", monospace'
  ctx.fillText(project.status, 408, 108)

  ctx.fillStyle = '#f8fafc'
  ctx.font = '800 40px "Space Grotesk", sans-serif'
  ctx.fillText(project.title, 388, 176)

  ctx.fillStyle = '#cbd5e1'
  ctx.font = '500 20px "Inter", sans-serif'
  ctx.fillText(project.category, 388, 214)

  let px = 388
  ctx.font = '600 16px "JetBrains Mono", monospace'
  project.tech.forEach((t) => {
    const w = ctx.measureText(t).width + 30
    ctx.fillStyle = '#0b1220'
    ctx.beginPath()
    ctx.roundRect(px, 252, w, 38, 10)
    ctx.fill()
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillStyle = '#e2e8f0'
    ctx.fillText(t, px + 15, 276)
    px += w + 12
  })

  const bars = [42, 72, 58, 96, 84, 110, 92, 128]
  bars.forEach((h, i) => {
    ctx.fillStyle = i % 2 === 0 ? project.accent : 'rgba(148, 163, 184, 0.35)'
    ctx.beginPath()
    ctx.roundRect(388 + i * 36, 392 - h * 0.65, 22, h * 0.65, 6)
    ctx.fill()
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function createLightShaftTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createLinearGradient(0, 0, 256, 0)
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.48)')
  grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.14)')
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)

  ctx.globalCompositeOperation = 'destination-in'
  const vGrad = ctx.createLinearGradient(0, 0, 0, 256)
  vGrad.addColorStop(0, 'rgba(0,0,0,0)')
  vGrad.addColorStop(0.22, 'rgba(0,0,0,1)')
  vGrad.addColorStop(0.78, 'rgba(0,0,0,1)')
  vGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = vGrad
  ctx.fillRect(0, 0, 256, 256)

  return new THREE.CanvasTexture(canvas)
}

// Subtle horizontal scanlines + corner HUD ticks for full-color hologram overlay
function createHoloScanlineTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 192
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, 256, 192)

  // Very delicate scanlines
  ctx.fillStyle = 'rgba(186, 230, 253, 0.22)'
  for (let y = 0; y < 192; y += 6) {
    ctx.fillRect(0, y, 256, 1)
  }

  // Crisp glowing holographic corner brackets
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.95)'
  ctx.lineWidth = 4
  const len = 24
  // Top-left
  ctx.beginPath()
  ctx.moveTo(4, len)
  ctx.lineTo(4, 4)
  ctx.lineTo(len, 4)
  // Top-right
  ctx.moveTo(256 - len, 4)
  ctx.lineTo(252, 4)
  ctx.lineTo(252, len)
  // Bottom-left
  ctx.moveTo(4, 192 - len)
  ctx.lineTo(4, 188)
  ctx.lineTo(len, 188)
  // Bottom-right
  ctx.moveTo(256 - len, 188)
  ctx.lineTo(252, 188)
  ctx.lineTo(252, 192 - len)
  ctx.stroke()

  return new THREE.CanvasTexture(canvas)
}

export const DeskSetup = memo(function DeskSetup({
  isDark,
  isInspectingCard,
  selectedProject,
  onNavigate,
  onCoffeeClick,
  onNotify,
}: DeskSetupProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [pcRgbIdx, setPcRgbIdx] = useState(0)

  const steamBoostRef = useRef(0)
  const keyboardBounceRef = useRef(0)
  const keyboardGroupRef = useRef<THREE.Group>(null)

  const steamRefs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ]
  const holoRefs = [
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
  ]
  const pcRingRef = useRef<THREE.Mesh>(null)

  // Cached lightweight procedural textures
  const woodTexture = useMemo(() => createWoodTexture(isDark), [isDark])
  const floorTexture = useMemo(() => createFloorTexture(isDark), [isDark])
  const rugTexture = useMemo(() => createRugTexture(isDark), [isDark])
  const skyTexture = useMemo(() => createSkyTexture(isDark), [isDark])
  const pegboardTexture = useMemo(() => createPegboardTexture(), [])
  const keyboardTexture = useMemo(() => createKeyboardTexture(), [])
  const phoneTexture = useMemo(() => createPhoneTexture(), [])
  const lightShaftTexture = useMemo(() => createLightShaftTexture(), [])
  const holoScanlineTexture = useMemo(() => createHoloScanlineTexture(), [])
  const monitorTexture = useMemo(
    () => createMonitorTexture(selectedProject),
    [selectedProject]
  )

  // Preloaded textures via drei useTexture (BASE_URL-safe for GitHub Pages & Vercel)
  const baseUrl = import.meta.env.BASE_URL
  const wallPhotoTexture = useTexture(`${baseUrl}wall-photo.jpg`)
  const holoTextures = useTexture([
    `${baseUrl}holo-1.jpg`,
    `${baseUrl}holo-2.jpg`,
    `${baseUrl}holo-3.jpg`,
    `${baseUrl}holo-4.jpg`,
  ])

  useEffect(() => {
    wallPhotoTexture.colorSpace = THREE.SRGBColorSpace
    wallPhotoTexture.anisotropy = 4
    wallPhotoTexture.needsUpdate = true
  }, [wallPhotoTexture])

  useEffect(() => {
    holoTextures.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 4
      tex.needsUpdate = true
    })
  }, [holoTextures])

  // Proper disposal of procedural textures only
  useEffect(() => () => woodTexture.dispose(), [woodTexture])
  useEffect(() => () => floorTexture.dispose(), [floorTexture])
  useEffect(() => () => rugTexture.dispose(), [rugTexture])
  useEffect(() => () => skyTexture.dispose(), [skyTexture])
  useEffect(() => () => monitorTexture.dispose(), [monitorTexture])
  useEffect(
    () => () => {
      pegboardTexture.dispose()
      keyboardTexture.dispose()
      phoneTexture.dispose()
      lightShaftTexture.dispose()
      holoScanlineTexture.dispose()
    },
    [pegboardTexture, keyboardTexture, phoneTexture, lightShaftTexture, holoScanlineTexture]
  )

  const currentRgb = PC_RGB_MODES[pcRgbIdx]

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const t = state.clock.elapsedTime

    if (steamBoostRef.current > 0) {
      steamBoostRef.current = Math.max(0, steamBoostRef.current - delta * 1.1)
    }
    const boost = steamBoostRef.current

    // Smooth coffee steam
    steamRefs.forEach((ref, i) => {
      if (!ref.current) return
      const speed = 0.4 + boost * 0.55
      const phase = (t * speed + i * 0.33) % 1
      ref.current.position.y = 0.25 + phase * 0.36
      ref.current.position.x = Math.sin(t * 2 + i * 2) * 0.025
      const scale = 0.38 + Math.sin(phase * Math.PI) * (0.78 + boost * 0.35)
      ref.current.scale.setScalar(scale)
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.opacity = Math.sin(phase * Math.PI) * (0.35 + boost * 0.22)
    })

    // Subtle floating holographic levitation on the 4 pegboard photo projections
    holoRefs.forEach((ref, i) => {
      if (!ref.current) return
      ref.current.position.y = 0.08 + Math.sin(t * 1.45 + i * 1.25) * 0.016
      ref.current.rotation.y = Math.sin(t * 0.65 + i * 1.1) * 0.075
    })

    // Tactile keyboard bounce when clicked
    if (keyboardBounceRef.current > 0) {
      keyboardBounceRef.current = Math.max(0, keyboardBounceRef.current - delta * 4.5)
      if (keyboardGroupRef.current) {
        keyboardGroupRef.current.position.y =
          0.032 - Math.sin(keyboardBounceRef.current * Math.PI) * 0.014
      }
    }

    // Subtle breathing glow on Mini PC fan ring
    if (pcRingRef.current) {
      const mat = pcRingRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = (isDark ? 1.9 : 0.45) + Math.sin(t * 2.2) * 0.3
    }
  })

  const setCursor = (item: string | null) => {
    setHoveredItem(item)
    if (!isInspectingCard) {
      document.body.style.cursor = item ? 'pointer' : 'auto'
    }
  }

  return (
    <group>
      {/* ==================== ARCHITECTURAL STUDIO ROOM ==================== */}
      {/* Back Accent Wall */}
      <mesh position={[0.4, 1.35, -1.45]} receiveShadow>
        <boxGeometry args={[8.4, 7.2, 0.14]} />
        <meshStandardMaterial
          color={isDark ? '#0e1526' : '#e8eef5'}
          roughness={0.92}
        />
      </mesh>

      {/* Architectural Acoustic Wood Slats Panel (Back-Left behind Desk Lamp) */}
      <group position={[-2.45, 1.35, -1.36]}>
        <mesh>
          <boxGeometry args={[1.55, 3.6, 0.025]} />
          <meshStandardMaterial color="#090d16" roughness={0.95} />
        </mesh>
        {Array.from({ length: 11 }).map((_, i) => (
          <mesh key={i} position={[-0.7 + i * 0.14, 0, 0.025]} castShadow>
            <boxGeometry args={[0.075, 3.55, 0.035]} />
            <meshStandardMaterial
              color={isDark ? '#4a3222' : '#9c6b43'}
              roughness={0.68}
            />
          </mesh>
        ))}
      </group>

      {/* Left Side Wall with Realistic Window */}
      <group position={[-3.72, 1.35, 1.15]}>
        <mesh position={[0, -1.85, 0]} receiveShadow>
          <boxGeometry args={[0.14, 3.5, 5.3]} />
          <meshStandardMaterial color={isDark ? '#0b1120' : '#dde6f0'} roughness={0.92} />
        </mesh>
        <mesh position={[0, 2.55, 0]} receiveShadow>
          <boxGeometry args={[0.14, 2.1, 5.3]} />
          <meshStandardMaterial color={isDark ? '#0b1120' : '#dde6f0'} roughness={0.92} />
        </mesh>
        <mesh position={[0, 0.7, -2.05]} receiveShadow>
          <boxGeometry args={[0.14, 2.2, 1.2]} />
          <meshStandardMaterial color={isDark ? '#0b1120' : '#dde6f0'} roughness={0.92} />
        </mesh>
        <mesh position={[0, 0.7, 1.85]} receiveShadow>
          <boxGeometry args={[0.14, 2.2, 1.6]} />
          <meshStandardMaterial color={isDark ? '#0b1120' : '#dde6f0'} roughness={0.92} />
        </mesh>

        {/* Window Assembly */}
        <group position={[0.04, 0.7, -0.2]}>
          {/* Outdoor Sky Gradient */}
          <mesh position={[-0.07, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[2.54, 1.94]} />
            <meshBasicMaterial map={skyTexture} />
          </mesh>

          {/* Top Venetian Blinds Louvers (semi-open) */}
          {[0.82, 0.68, 0.54].map((by, idx) => (
            <mesh key={idx} position={[0.03, by, 0]} rotation={[0, 0, 0.35]}>
              <boxGeometry args={[0.08, 0.015, 2.52]} />
              <meshStandardMaterial color={isDark ? '#334155' : '#f1f5f9'} roughness={0.5} />
            </mesh>
          ))}

          {/* Window Frame & Deep Sill */}
          <mesh position={[0.02, 0.98, 0]}>
            <boxGeometry args={[0.18, 0.09, 2.68]} />
            <meshStandardMaterial color={isDark ? '#1e293b' : '#cbd5e1'} roughness={0.45} />
          </mesh>
          <mesh position={[0.07, -0.98, 0]}>
            <boxGeometry args={[0.28, 0.09, 2.78]} />
            <meshStandardMaterial color={isDark ? '#334155' : '#f8fafc'} roughness={0.4} />
          </mesh>
          <mesh position={[0.02, 0, -1.29]}>
            <boxGeometry args={[0.18, 2.02, 0.09]} />
            <meshStandardMaterial color={isDark ? '#1e293b' : '#cbd5e1'} roughness={0.45} />
          </mesh>
          <mesh position={[0.02, 0, 1.29]}>
            <boxGeometry args={[0.18, 2.02, 0.09]} />
            <meshStandardMaterial color={isDark ? '#1e293b' : '#cbd5e1'} roughness={0.45} />
          </mesh>
          {/* Mullions */}
          <mesh position={[0.01, 0.05, 0]}>
            <boxGeometry args={[0.06, 0.045, 2.55]} />
            <meshStandardMaterial color={isDark ? '#1e293b' : '#cbd5e1'} roughness={0.45} />
          </mesh>
          <mesh position={[0.01, 0, 0]}>
            <boxGeometry args={[0.06, 1.92, 0.045]} />
            <meshStandardMaterial color={isDark ? '#1e293b' : '#cbd5e1'} roughness={0.45} />
          </mesh>

          {/* Soft Volumetric Light Shafts Streaming Onto the Desk */}
          <mesh position={[2.1, -0.82, 0.15]} rotation={[0, 0.12, -0.44]}>
            <planeGeometry args={[4.8, 1.85]} />
            <meshBasicMaterial
              map={lightShaftTexture}
              color={isDark ? '#93c5fd' : '#fff3c4'}
              transparent
              opacity={isDark ? 0.14 : 0.24}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[2.0, -0.95, 0.65]} rotation={[0.25, 0.18, -0.46]}>
            <planeGeometry args={[4.4, 1.35]} />
            <meshBasicMaterial
              map={lightShaftTexture}
              color={isDark ? '#bae6fd' : '#fde68a'}
              transparent
              opacity={isDark ? 0.1 : 0.18}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Window Fill Light */}
          <pointLight
            position={[0.7, 0.1, 0.2]}
            color={isDark ? '#7dd3fc' : '#ffedd5'}
            intensity={isDark ? 2.4 : 4.0}
            distance={9}
            decay={2}
          />
        </group>
      </group>

      {/* Wall Baseboard Trim */}
      <mesh position={[0.4, -2.12, -1.36]}>
        <boxGeometry args={[8.3, 0.16, 0.04]} />
        <meshStandardMaterial color={isDark ? '#1e293b' : '#cbd5e1'} roughness={0.65} />
      </mesh>

      {/* Textured Hardwood Plank Floor */}
      <mesh position={[0, -2.2, 0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial map={floorTexture} roughness={0.82} />
      </mesh>

      {/* Woven Studio Rug under Desk */}
      <mesh position={[0.1, -2.185, 0.25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.4, 3.8]} />
        <meshStandardMaterial map={rugTexture} roughness={0.96} />
      </mesh>

      {/* ==================== FRAMED WALL PHOTO (BACK-RIGHT) ==================== */}
      <group position={[2.25, 1.95, -1.36]}>
        <mesh castShadow>
          <boxGeometry args={[0.96, 1.24, 0.05]} />
          <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[0.88, 1.16]} />
          <meshStandardMaterial color={isDark ? '#e2e8f0' : '#ffffff'} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0, 0.029]}>
          <planeGeometry args={[0.8, 1.06]} />
          <meshStandardMaterial
            map={wallPhotoTexture}
            color="#ffffff"
            roughness={0.28}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* ==================== TEXTURED WALNUT DESK TABLETOP (y = 0) ==================== */}
      <RoundedBox
        args={[5.4, 0.14, 2.55]}
        radius={0.028}
        smoothness={2}
        position={[0, -0.07, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial map={woodTexture} roughness={0.56} metalness={0.06} />
      </RoundedBox>

      {/* Under-Desk Steel Cable Tray & Rear LED Strip */}
      <mesh position={[0, -0.18, -0.95]}>
        <boxGeometry args={[4.7, 0.08, 0.16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.02, -1.29]}>
        <boxGeometry args={[5.1, 0.03, 0.025]} />
        <meshStandardMaterial
          color={currentRgb.color}
          emissive={currentRgb.color}
          emissiveIntensity={isDark ? 2.2 : 0.45}
        />
      </mesh>

      {/* 4 Matte Metal Desk Legs with Crossbar */}
      {[
        [-2.42, -1.14, -1.04],
        [2.42, -1.14, -1.04],
        [-2.42, -1.14, 1.04],
        [2.42, -1.14, 1.04],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.1, 2.12, 0.1]} />
          <meshStandardMaterial color="#111827" metalness={0.78} roughness={0.28} />
        </mesh>
      ))}
      <mesh position={[-2.42, -2.14, 0]}>
        <boxGeometry args={[0.1, 0.06, 2.18]} />
        <meshStandardMaterial color="#111827" metalness={0.78} roughness={0.28} />
      </mesh>
      <mesh position={[2.42, -2.14, 0]}>
        <boxGeometry args={[0.1, 0.06, 2.18]} />
        <meshStandardMaterial color="#111827" metalness={0.78} roughness={0.28} />
      </mesh>

      {/* ==================== ULTRAWIDE MONITOR (PROJECTS) ==================== */}
      <group
        position={[0.15, 0, -0.68]}
        onClick={(e) => {
          e.stopPropagation()
          onNavigate('projects')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setCursor('monitor')
        }}
        onPointerOut={() => setCursor(null)}
      >
        <mesh position={[0, 0.018, 0]} castShadow>
          <boxGeometry args={[0.78, 0.036, 0.34]} />
          <meshStandardMaterial color="#1e293b" metalness={0.78} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.42, -0.06]} castShadow>
          <boxGeometry args={[0.11, 0.8, 0.06]} />
          <meshStandardMaterial color="#1e293b" metalness={0.78} roughness={0.25} />
        </mesh>
        {/* Monitor Light Bar on Top (rotated horizontally) */}
        <mesh position={[0, 1.49, 0.07]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 1.15, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Outer Bezel */}
        <RoundedBox
          args={[2.32, 1.0, 0.07]}
          radius={0.02}
          smoothness={2}
          position={[0, 0.96, 0.02]}
          castShadow
        >
          <meshStandardMaterial
            color={hoveredItem === 'monitor' ? '#334155' : '#0f172a'}
            metalness={0.68}
            roughness={0.24}
          />
        </RoundedBox>
        {/* Display */}
        <mesh position={[0, 0.96, 0.058]}>
          <planeGeometry args={[2.22, 0.9]} />
          <meshStandardMaterial
            map={monitorTexture}
            emissive="#ffffff"
            emissiveMap={monitorTexture}
            emissiveIntensity={isDark ? 0.72 : 0.42}
            roughness={0.18}
          />
        </mesh>

        {hoveredItem === 'monitor' && !isInspectingCard && (
          <Html position={[0, 1.66, 0.06]} center distanceFactor={8}>
            <div className="pointer-events-none whitespace-nowrap rounded-full border border-cyan-400 bg-slate-950 px-3 py-1 text-xs font-semibold text-cyan-200 shadow-lg">
              🖥️ Monitor • Lihat Projects
            </div>
          </Html>
        )}
      </group>

      {/* ==================== DESK MAT, INTERACTIVE KEYBOARD & MOUSE ==================== */}
      <group position={[0.15, 0, 0.28]}>
        {/* Felt Desk Mat with Subtle Accent Trim */}
        <mesh position={[0, 0.008, 0]} receiveShadow>
          <boxGeometry args={[2.6, 0.016, 1.04]} />
          <meshStandardMaterial color="#111827" roughness={0.94} />
        </mesh>

        {/* Interactive Mechanical Keyboard (Click to type!) */}
        <group
          ref={keyboardGroupRef}
          position={[-0.18, 0.032, 0.04]}
          rotation={[0.07, 0, 0]}
          onClick={(e) => {
            e.stopPropagation()
            keyboardBounceRef.current = 1
            onNotify('⌨️ Menulis prompt & membangun aplikasi AI...')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setCursor('keyboard')
          }}
          onPointerOut={() => setCursor(null)}
        >
          {/* Aluminum Case */}
          <RoundedBox args={[1.1, 0.048, 0.4]} radius={0.012} smoothness={2} castShadow>
            <meshStandardMaterial
              color={hoveredItem === 'keyboard' ? '#334155' : '#1e293b'}
              metalness={0.62}
              roughness={0.3}
            />
          </RoundedBox>
          {/* Textured Individual Keycaps Top Surface */}
          <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.02, 0.34]} />
            <meshStandardMaterial map={keyboardTexture} roughness={0.48} />
          </mesh>
          {/* RGB Front Underglow */}
          <mesh position={[0, -0.015, 0.2]}>
            <boxGeometry args={[1.04, 0.012, 0.012]} />
            <meshStandardMaterial
              color={currentRgb.color}
              emissive={currentRgb.color}
              emissiveIntensity={isDark ? 2.2 : 0.45}
            />
          </mesh>

          {hoveredItem === 'keyboard' && !isInspectingCard && (
            <Html position={[0, 0.26, 0]} center distanceFactor={8}>
              <div className="pointer-events-none whitespace-nowrap rounded-full border border-amber-400 bg-slate-950 px-3 py-1 text-xs font-semibold text-amber-200 shadow-lg">
                ⌨️ Mechanical Keyboard • Klik untuk Test
              </div>
            </Html>
          )}
        </group>

        {/* Ergonomic Wireless Mouse */}
        <group position={[0.78, 0.038, 0.05]}>
          <RoundedBox args={[0.17, 0.06, 0.28]} radius={0.028} smoothness={2} castShadow>
            <meshStandardMaterial color="#1e293b" roughness={0.32} metalness={0.35} />
          </RoundedBox>
          {/* Scroll Wheel */}
          <mesh position={[0, 0.03, -0.07]}>
            <boxGeometry args={[0.022, 0.016, 0.05]} />
            <meshStandardMaterial color={currentRgb.color} emissive={currentRgb.color} emissiveIntensity={1.2} />
          </mesh>
        </group>
      </group>

      {/* ==================== PERFORATED PEGBOARD & 4 HOLOGRAM PHOTOS ==================== */}
      <group
        position={[-0.15, 2.1, -1.35]}
        onClick={(e) => {
          e.stopPropagation()
          onNavigate('about')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setCursor('pegboard')
        }}
        onPointerOut={() => setCursor(null)}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.35, 0.92, 0.05]} />
          <meshStandardMaterial
            map={pegboardTexture}
            color={hoveredItem === 'pegboard' ? '#e2e8f0' : '#cbd5e1'}
            roughness={0.72}
          />
        </mesh>
        {/* Metal Shelf Ledge */}
        <mesh position={[0, -0.25, 0.14]} castShadow>
          <boxGeometry args={[2.22, 0.04, 0.26]} />
          <meshStandardMaterial color="#0f172a" metalness={0.65} roughness={0.32} />
        </mesh>

        {/* 4 Full-Color Holographic Photo Projections */}
        {[-0.81, -0.27, 0.27, 0.81].map((xPos, i) => (
          <group key={i} position={[xPos, 0, 0.15]}>
            {/* Mini Hologram Projector Emitter Base on Shelf */}
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.075, 0.09, 0.022, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.22} />
            </mesh>
            {/* Glowing Cyan Emitter Lens */}
            <mesh position={[0, -0.207, 0]}>
              <cylinderGeometry args={[0.048, 0.048, 0.008, 16]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#38bdf8"
                emissiveIntensity={isDark ? 2.4 : 1.1}
              />
            </mesh>

            {/* Soft Translucent Projection Light Cone from Emitter up to Photo */}
            <mesh position={[0, -0.14, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.17, 0.14, 12, 1, true]} />
              <meshBasicMaterial
                color="#38bdf8"
                transparent
                opacity={isDark ? 0.14 : 0.08}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Floating Full-Color Hologram Photo (4:3 ratio, balanced size 0.44 x 0.33) */}
            <group ref={holoRefs[i]} position={[0, 0.08, 0.02]}>
              {/* Subtle Glowing Hologram Rim Halo Behind */}
              <mesh position={[0, 0, -0.004]}>
                <planeGeometry args={[0.462, 0.352]} />
                <meshBasicMaterial
                  color="#38bdf8"
                  transparent
                  opacity={isDark ? 0.35 : 0.22}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Main Full-Color Photo Plane (100% original natural colors!) */}
              <mesh>
                <planeGeometry args={[0.44, 0.33]} />
                <meshStandardMaterial
                  map={holoTextures[i]}
                  color="#ffffff"
                  emissive="#ffffff"
                  emissiveMap={holoTextures[i]}
                  emissiveIntensity={isDark ? 0.46 : 0.2}
                  roughness={0.2}
                  metalness={0.05}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Delicate Holographic Scanlines & Corner Brackets Overlay */}
              <mesh position={[0, 0, 0.004]}>
                <planeGeometry args={[0.444, 0.334]} />
                <meshBasicMaterial
                  map={holoScanlineTexture}
                  transparent
                  opacity={0.55}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            </group>
          </group>
        ))}

        {hoveredItem === 'pegboard' && !isInspectingCard && (
          <Html position={[0, 0.66, 0.15]} center distanceFactor={8}>
            <div className="pointer-events-none whitespace-nowrap rounded-full border border-cyan-400 bg-slate-950 px-3 py-1 text-xs font-semibold text-cyan-200 shadow-lg">
              ✨ Holo Gallery • About &amp; Skills
            </div>
          </Html>
        )}
      </group>

      {/* ==================== CERAMIC COFFEE MUG WITH ANIMATED STEAM ==================== */}
      <group
        position={[1.64, 0, 0.48]}
        onClick={(e) => {
          e.stopPropagation()
          steamBoostRef.current = 1.4
          onCoffeeClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setCursor('coffee')
        }}
        onPointerOut={() => setCursor(null)}
      >
        {/* Cork Coaster */}
        <mesh position={[0, 0.008, 0]} receiveShadow>
          <cylinderGeometry args={[0.165, 0.165, 0.016, 20]} />
          <meshStandardMaterial color="#92400e" roughness={0.92} />
        </mesh>
        {/* Matte Ceramic Mug */}
        <mesh position={[0, 0.13, 0]} castShadow>
          <cylinderGeometry args={[0.115, 0.1, 0.23, 20]} />
          <meshStandardMaterial
            color={hoveredItem === 'coffee' ? '#fbbf24' : '#f1f5f9'}
            roughness={0.25}
          />
        </mesh>
        {/* Gold Rim Accent Band */}
        <mesh position={[0, 0.235, 0]}>
          <torusGeometry args={[0.114, 0.007, 8, 22]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Espresso Crema */}
        <mesh position={[0, 0.225, 0]}>
          <cylinderGeometry args={[0.102, 0.102, 0.015, 18]} />
          <meshStandardMaterial color="#3b1d0f" roughness={0.14} />
        </mesh>
        {/* Handle */}
        <mesh position={[0.12, 0.13, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.062, 0.016, 10, 16, Math.PI]} />
          <meshStandardMaterial
            color={hoveredItem === 'coffee' ? '#fbbf24' : '#f1f5f9'}
            roughness={0.25}
          />
        </mesh>
        {steamRefs.map((ref, i) => (
          <mesh key={i} ref={ref} position={[0, 0.28, 0]}>
            <sphereGeometry args={[0.042, 8, 8]} />
            <meshStandardMaterial color="#e2e8f0" transparent opacity={0.35} depthWrite={false} />
          </mesh>
        ))}

        {hoveredItem === 'coffee' && !isInspectingCard && (
          <Html position={[0, 0.56, 0]} center distanceFactor={8}>
            <div className="pointer-events-none whitespace-nowrap rounded-full border border-amber-400 bg-slate-950 px-3 py-1 text-xs font-semibold text-amber-200 shadow-lg">
              ☕ Kopi BOSS • Klik untuk Refill
            </div>
          </Html>
        )}
      </group>

      {/* ==================== SMARTPHONE ON CHARGING DOCK (CONTACT) ==================== */}
      <group
        position={[1.92, 0, -0.12]}
        rotation={[0, -0.45, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onNavigate('contact')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setCursor('phone')
        }}
        onPointerOut={() => setCursor(null)}
      >
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.24, 0.04, 0.26]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.28} />
        </mesh>
        <group position={[0, 0.19, -0.02]} rotation={[-0.3, 0, 0]}>
          <RoundedBox args={[0.18, 0.34, 0.024]} radius={0.016} smoothness={2} castShadow>
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </RoundedBox>
          <mesh position={[0, 0, 0.013]}>
            <planeGeometry args={[0.156, 0.312]} />
            <meshStandardMaterial
              map={phoneTexture}
              emissive="#ffffff"
              emissiveMap={phoneTexture}
              emissiveIntensity={isDark ? 0.65 : 0.35}
              roughness={0.18}
            />
          </mesh>
        </group>

        {hoveredItem === 'phone' && !isInspectingCard && (
          <Html position={[0, 0.54, 0]} center distanceFactor={8}>
            <div className="pointer-events-none whitespace-nowrap rounded-full border border-sky-400 bg-slate-950 px-3 py-1 text-xs font-semibold text-sky-200 shadow-lg">
              📱 Hubungi {PORTFOLIO_DATA.identity.name}
            </div>
          </Html>
        )}
      </group>

      {/* ==================== INTERACTIVE MINI PC TOWER (CLICK FOR RGB) ==================== */}
      <group
        position={[2.12, 0, -0.78]}
        onClick={(e) => {
          e.stopPropagation()
          const next = (pcRgbIdx + 1) % PC_RGB_MODES.length
          setPcRgbIdx(next)
          onNotify(`🖥️ PC RGB Mode: ${PC_RGB_MODES[next].name}`)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setCursor('pc')
        }}
        onPointerOut={() => setCursor(null)}
      >
        {/* Main Chassis */}
        <RoundedBox args={[0.52, 0.92, 0.72]} radius={0.02} smoothness={2} position={[0, 0.46, 0]} castShadow>
          <meshStandardMaterial
            color={hoveredItem === 'pc' ? '#1e293b' : '#0f172a'}
            metalness={0.72}
            roughness={0.28}
          />
        </RoundedBox>
        {/* Front Glowing Accent Strip */}
        <mesh position={[0, 0.46, 0.365]}>
          <boxGeometry args={[0.025, 0.76, 0.012]} />
          <meshStandardMaterial
            color={currentRgb.color}
            emissive={currentRgb.color}
            emissiveIntensity={isDark ? 2.4 : 0.6}
          />
        </mesh>
        {/* Side Window Recess + Cooling Ring + RAM Bars */}
        <mesh position={[-0.262, 0.48, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.54, 0.72]} />
          <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh ref={pcRingRef} position={[-0.266, 0.56, -0.06]} rotation={[0, -Math.PI / 2, 0]}>
          <torusGeometry args={[0.125, 0.016, 10, 22]} />
          <meshStandardMaterial
            color={currentRgb.secondary}
            emissive={currentRgb.secondary}
            emissiveIntensity={isDark ? 2.0 : 0.5}
          />
        </mesh>
        {/* Dual Glowing RAM Sticks */}
        <mesh position={[-0.266, 0.58, 0.14]}>
          <boxGeometry args={[0.01, 0.22, 0.022]} />
          <meshStandardMaterial color={currentRgb.color} emissive={currentRgb.color} emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.266, 0.58, 0.18]}>
          <boxGeometry args={[0.01, 0.22, 0.022]} />
          <meshStandardMaterial color={currentRgb.color} emissive={currentRgb.color} emissiveIntensity={2} />
        </mesh>

        {hoveredItem === 'pc' && !isInspectingCard && (
          <Html position={[0, 1.12, 0]} center distanceFactor={8}>
            <div className="pointer-events-none whitespace-nowrap rounded-full border border-cyan-400 bg-slate-950 px-3 py-1 text-xs font-semibold text-cyan-200 shadow-lg">
              ⚡ Mini PC • Klik Ganti RGB ({currentRgb.name})
            </div>
          </Html>
        )}
      </group>

      {/* ==================== DETAILED POTTED PLANT (LEFT FRONT) ==================== */}
      <group position={[-2.18, 0, 0.56]}>
        {/* Terracotta Ceramic Pot + Rim */}
        <mesh position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.12, 0.28, 18]} />
          <meshStandardMaterial color="#b45309" roughness={0.68} />
        </mesh>
        <mesh position={[0, 0.27, 0]}>
          <torusGeometry args={[0.155, 0.018, 8, 20]} />
          <meshStandardMaterial color="#c2410c" roughness={0.62} />
        </mesh>
        {/* Soil */}
        <mesh position={[0, 0.265, 0]}>
          <cylinderGeometry args={[0.145, 0.145, 0.02, 14]} />
          <meshStandardMaterial color="#3b2618" roughness={0.95} />
        </mesh>
        {/* Layered Sculpted Foliage Leaves */}
        {[
          { pos: [0, 0.43, 0], rot: [0.2, 0, 0.1], s: [0.16, 0.2, 0.14], c: '#10b981' },
          { pos: [-0.12, 0.39, 0.07], rot: [0.3, 0.5, 0.45], s: [0.13, 0.17, 0.12], c: '#059669' },
          { pos: [0.12, 0.4, -0.05], rot: [-0.2, 0.2, -0.4], s: [0.13, 0.17, 0.12], c: '#047857' },
          { pos: [0.02, 0.54, -0.06], rot: [-0.35, 0.3, 0.1], s: [0.12, 0.16, 0.11], c: '#34d399' },
          { pos: [-0.04, 0.48, 0.1], rot: [0.45, -0.2, 0.2], s: [0.11, 0.15, 0.1], c: '#10b981' },
        ].map((leaf, i) => (
          <mesh
            key={i}
            position={leaf.pos as [number, number, number]}
            rotation={leaf.rot as [number, number, number]}
            scale={leaf.s as [number, number, number]}
            castShadow
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={leaf.c} roughness={0.65} />
          </mesh>
        ))}
      </group>
    </group>
  )
})
