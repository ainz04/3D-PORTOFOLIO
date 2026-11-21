import { memo, useState } from 'react'
import { Html } from '@react-three/drei'

interface DeskLampProps {
  isDark: boolean
  isInspectingCard: boolean
  onToggleTheme: () => void
}

export const DeskLamp = memo(function DeskLamp({
  isDark,
  isInspectingCard,
  onToggleTheme,
}: DeskLampProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <group position={[-1.85, 0, -0.55]}>
      {/* Weighted Metal Base */}
      <mesh
        position={[0, 0.035, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          onToggleTheme()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <cylinderGeometry args={[0.24, 0.27, 0.07, 24]} />
        <meshStandardMaterial
          color={hovered ? '#334155' : '#1e293b'}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Power Switch Button on Base */}
      <mesh position={[0.12, 0.075, 0.1]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
        <meshStandardMaterial
          color={isDark ? '#f59e0b' : '#38bdf8'}
          emissive={isDark ? '#f59e0b' : '#38bdf8'}
          emissiveIntensity={1.6}
        />
      </mesh>

      {/* Lower Articulated Arm */}
      <mesh position={[-0.1, 0.46, -0.05]} rotation={[0.1, 0, 0.22]} castShadow>
        <cylinderGeometry args={[0.022, 0.025, 0.88, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Mid Elbow Joint */}
      <mesh position={[-0.2, 0.88, -0.1]}>
        <sphereGeometry args={[0.045, 14, 14]} />
        <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Upper Articulated Arm */}
      <mesh position={[0.12, 1.22, 0.06]} rotation={[0.28, 0, -0.78]} castShadow>
        <cylinderGeometry args={[0.02, 0.022, 0.92, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Hook Ring on Upper Arm where the ID Card Hangs */}
      <mesh position={[0.27, 1.34, 0.13]} rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[0.032, 0.008, 10, 18]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.18} />
      </mesh>

      {/* Lamp Shade Head */}
      <group
        position={[0.48, 1.48, 0.22]}
        rotation={[0.22, -0.25, -0.58]}
        onClick={(e) => {
          e.stopPropagation()
          onToggleTheme()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        {/* Shade Outer Cone */}
        <mesh castShadow>
          <coneGeometry args={[0.22, 0.28, 24, 1, true]} />
          <meshStandardMaterial
            color={hovered ? '#475569' : '#1e293b'}
            metalness={0.65}
            roughness={0.28}
            side={2}
          />
        </mesh>
        {/* Shade Cap */}
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.055, 0.075, 0.08, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Glowing Bulb */}
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.075, 14, 14]} />
          <meshStandardMaterial
            color={isDark ? '#fde68a' : '#fffbeb'}
            emissive={isDark ? '#fbbf24' : '#fef3c7'}
            emissiveIntensity={isDark ? 3.2 : 0.6}
          />
        </mesh>
      </group>

      {/* Fast Warm Local Point Light (no expensive 6-face shadow cube map) */}
      <pointLight
        position={[0.55, 1.22, 0.26]}
        color="#ffcf86"
        intensity={isDark ? 4.5 : 0.8}
        distance={6.5}
        decay={2}
      />

      {/* Interactive Tooltip */}
      {hovered && !isInspectingCard && (
        <Html position={[0.45, 1.82, 0.2]} center distanceFactor={8}>
          <div className="pointer-events-none whitespace-nowrap rounded-full border border-amber-400/40 bg-slate-950/90 px-3 py-1 text-xs font-medium text-amber-200 shadow-lg">
            💡 Klik Lampu: {isDark ? 'Mode Siang' : 'Mode Malam'}
          </div>
        </Html>
      )}
    </group>
  )
})
