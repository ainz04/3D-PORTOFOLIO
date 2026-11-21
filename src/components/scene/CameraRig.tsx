import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { SectionId } from '../../data/portfolio'

interface CameraRigProps {
  activeSection: SectionId
  isInspectingCard: boolean
}

// Camera presets framed so the 3D desk / focal item sits cleanly in the open side,
// never blocked by the solid UI info panels!
const CAMERA_PRESETS: Record<
  SectionId,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  // Hero card is on the far LEFT -> push desk cleanly toward center-right
  hero: {
    pos: [4.75, 3.2, 5.45],
    target: [-0.95, 0.65, -0.15],
  },
  // About card is on the far RIGHT -> frame Pegboard & Lamp cleanly on the LEFT
  about: {
    pos: [1.55, 2.35, 4.15],
    target: [0.35, 1.55, -1.15],
  },
  // Projects card is on the far LEFT -> frame Ultrawide Monitor cleanly on the RIGHT
  projects: {
    pos: [-0.75, 1.32, 2.75],
    target: [-0.45, 0.94, -0.68],
  },
  // Contact card is on the far LEFT -> frame Smartphone & Coffee cleanly on the RIGHT
  contact: {
    pos: [3.2, 1.68, 3.15],
    target: [1.05, 0.42, -0.05],
  },
}

const INSPECT_CAMERA = {
  pos: [0, 1.15, 2.65] as [number, number, number],
  target: [0, 1.05, 0.8] as [number, number, number],
}

export function CameraRig({ activeSection, isInspectingCard }: CameraRigProps) {
  const { camera, pointer } = useThree()
  const currentTarget = useRef(new THREE.Vector3(-0.95, 0.65, -0.15))
  const smoothPointer = useRef({ x: 0, y: 0 })

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)

    smoothPointer.current.x = THREE.MathUtils.damp(smoothPointer.current.x, pointer.x, 4.5, delta)
    smoothPointer.current.y = THREE.MathUtils.damp(smoothPointer.current.y, pointer.y, 4.5, delta)

    const lambda = isInspectingCard ? 6.5 : 4.2

    let dx: number
    let dy: number
    let dz: number
    let tx: number
    let ty: number
    let tz: number

    if (isInspectingCard) {
      ;[dx, dy, dz] = INSPECT_CAMERA.pos
      ;[tx, ty, tz] = INSPECT_CAMERA.target
    } else {
      const preset = CAMERA_PRESETS[activeSection]
      dx = preset.pos[0] + smoothPointer.current.x * 0.22
      dy = preset.pos[1] + smoothPointer.current.y * 0.12
      dz = preset.pos[2]
      ;[tx, ty, tz] = preset.target
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, dx, lambda, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, dy, lambda, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, dz, lambda, delta)

    currentTarget.current.x = THREE.MathUtils.damp(currentTarget.current.x, tx, lambda, delta)
    currentTarget.current.y = THREE.MathUtils.damp(currentTarget.current.y, ty, lambda, delta)
    currentTarget.current.z = THREE.MathUtils.damp(currentTarget.current.z, tz, lambda, delta)

    camera.lookAt(currentTarget.current)
  })

  return null
}
