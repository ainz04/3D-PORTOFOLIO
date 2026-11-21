import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { PORTFOLIO_DATA } from '../../data/portfolio'

interface HangingIdCardProps {
  isInspecting: boolean
  flipSignal: number
  resetSignal: number
  lampPulse: number
  onOpenInspect: () => void
}

// World position of the hook ring on DeskLamp: [-1.85 + 0.27, 1.34, -0.55 + 0.13]
const LAMP_HOOK_POS = new THREE.Vector3(-1.58, 1.34, -0.42)
// World position when brought close to the camera for 360° Inspect Mode
const INSPECT_CENTER_POS = new THREE.Vector3(0, 1.05, 1.28)

// Verlet rope configuration for realistic lanyard + card physics
const ROPE_NODES = 6 // 0 = pinned on lamp hook, 5 = swivel clasp at top of card
const SEG_LEN = 0.068 // Total strap length = 5 * 0.068 = 0.34
const CARD_HALF_H = 0.275 // Distance from top clasp (node 5) to card center (node 6)
const RIBBON_SAMPLES = 12 // Smooth visual ribbon segments along the rope

function drawFrontCard(
  ctx: CanvasRenderingContext2D,
  photo?: HTMLImageElement
) {
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.scale(ctx.canvas.width / 768, ctx.canvas.height / 1152)

  // Executive dark obsidian-teal background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 768, 1152)
  bgGrad.addColorStop(0, '#0c1524')
  bgGrad.addColorStop(0.5, '#070b14')
  bgGrad.addColorStop(1, '#0d1a26')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 768, 1152)

  // Subtle ambient teal glow behind portrait
  const topGlow = ctx.createRadialGradient(384, 340, 40, 384, 340, 390)
  topGlow.addColorStop(0, 'rgba(20, 184, 166, 0.24)')
  topGlow.addColorStop(0.6, 'rgba(56, 189, 248, 0.08)')
  topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = topGlow
  ctx.fillRect(0, 0, 768, 760)

  // Subtle geometric grid lines
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.065)'
  ctx.lineWidth = 1.5
  for (let x = 0; x < 768; x += 48) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 1152)
    ctx.stroke()
  }
  for (let y = 0; y < 1152; y += 48) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(768, y)
    ctx.stroke()
  }

  // Outer executive teal-to-gold gradient border
  const borderGrad = ctx.createLinearGradient(28, 28, 740, 1124)
  borderGrad.addColorStop(0, 'rgba(45, 212, 191, 0.72)')
  borderGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.75)')
  borderGrad.addColorStop(1, 'rgba(56, 189, 248, 0.65)')
  ctx.strokeStyle = borderGrad
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.roundRect(26, 26, 716, 1100, 36)
  ctx.stroke()

  // Top punch-hole slot visual
  ctx.fillStyle = '#020617'
  ctx.beginPath()
  ctx.roundRect(304, 52, 160, 26, 13)
  ctx.fill()
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.42)'
  ctx.lineWidth = 2.5
  ctx.stroke()

  // Top Header Row
  ctx.fillStyle = '#2dd4bf'
  ctx.font = '700 22px "JetBrains Mono", monospace'
  ctx.textAlign = 'left'
  ctx.fillText('EXECUTIVE ACCESS', 82, 128)

  ctx.fillStyle = '#fbbf24'
  ctx.font = '700 22px "JetBrains Mono", monospace'
  ctx.textAlign = 'right'
  ctx.fillText('VIP // 01', 686, 128)

  // Portrait Photo Frame
  const px = 96
  const py = 152
  const pw = 576
  const ph = 496
  const pr = 34

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(px, py, pw, ph, pr)
  ctx.clip()

  if (photo && photo.complete && photo.naturalWidth > 0) {
    const imgRatio = photo.naturalWidth / photo.naturalHeight
    const boxRatio = pw / ph
    let drawW = pw
    let drawH = ph
    let offsetX = px
    let offsetY = py

    if (imgRatio > boxRatio) {
      drawH = ph
      drawW = ph * imgRatio
      offsetX = px - (drawW - pw) / 2
    } else {
      drawW = pw
      drawH = pw / imgRatio
      offsetY = py - (drawH - ph) * 0.16
    }

    ctx.drawImage(photo, offsetX, offsetY, drawW, drawH)

    const vig = ctx.createLinearGradient(0, py + ph - 165, 0, py + ph)
    vig.addColorStop(0, 'rgba(7, 11, 20, 0)')
    vig.addColorStop(1, 'rgba(7, 11, 20, 0.78)')
    ctx.fillStyle = vig
    ctx.fillRect(px, py + ph - 165, pw, 165)
  } else {
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(px, py, pw, ph)
    ctx.fillStyle = '#fbbf24'
    ctx.font = '800 120px "Space Grotesk", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('J', px + pw / 2, py + ph / 2)
    ctx.textBaseline = 'alphabetic'
  }
  ctx.restore()

  // Portrait frame outline
  const frameGrad = ctx.createLinearGradient(px, py, px + pw, py + ph)
  frameGrad.addColorStop(0, '#2dd4bf')
  frameGrad.addColorStop(0.55, '#fbbf24')
  frameGrad.addColorStop(1, '#38bdf8')
  ctx.strokeStyle = frameGrad
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.roundRect(px, py, pw, ph, pr)
  ctx.stroke()

  // Floating Online Status Pill
  ctx.fillStyle = 'rgba(7, 11, 20, 0.78)'
  ctx.beginPath()
  ctx.roundRect(px + pw - 164, py + 18, 144, 42, 21)
  ctx.fill()
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#10b981'
  ctx.beginPath()
  ctx.arc(px + pw - 138, py + 39, 7, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ecfdf5'
  ctx.font = '700 20px "JetBrains Mono", monospace'
  ctx.textAlign = 'left'
  ctx.fillText('ACTIVE', px + pw - 122, py + 46)

  // Name & Role
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 104px "Space Grotesk", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(PORTFOLIO_DATA.identity.name, 384, 756)

  const pillGrad = ctx.createLinearGradient(204, 782, 564, 862)
  pillGrad.addColorStop(0, '#f59e0b')
  pillGrad.addColorStop(0.5, '#fbbf24')
  pillGrad.addColorStop(1, '#f59e0b')
  ctx.fillStyle = pillGrad
  ctx.beginPath()
  ctx.roundRect(204, 784, 360, 76, 38)
  ctx.fill()

  ctx.fillStyle = '#090d16'
  ctx.font = '800 44px "Space Grotesk", sans-serif'
  ctx.fillText(`★  ${PORTFOLIO_DATA.identity.role}  ★`, 384, 838)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '600 22px "JetBrains Mono", monospace'
  ctx.fillText(PORTFOLIO_DATA.identity.clearance, 384, 914)

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(86, 948)
  ctx.lineTo(682, 948)
  ctx.stroke()

  ctx.fillStyle = '#e2e8f0'
  const barcodePattern = [6, 3, 10, 4, 4, 8, 3, 12, 4, 6, 3, 8, 6, 4, 10, 3, 5, 9, 4, 6, 11, 3, 7, 4, 8]
  let bx = 138
  for (let i = 0; i < barcodePattern.length; i++) {
    const w = barcodePattern[i]
    if (i % 2 === 0) {
      ctx.fillRect(bx, 974, w * 2.1, 68)
    }
    bx += w * 2.1 + 7
  }

  ctx.fillStyle = '#64748b'
  ctx.font = '600 21px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText(PORTFOLIO_DATA.identity.badgeId, 384, 1080)

  ctx.restore()
}

function createFrontTexture(): {
  texture: THREE.CanvasTexture
  ctx: CanvasRenderingContext2D
} {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 960
  const ctx = canvas.getContext('2d')!
  drawFrontCard(ctx)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return { texture, ctx }
}

function createBackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 768
  const ctx = canvas.getContext('2d')!
  ctx.scale(512 / 768, 768 / 1152)

  const bgGrad = ctx.createLinearGradient(0, 0, 768, 1152)
  bgGrad.addColorStop(0, '#090d16')
  bgGrad.addColorStop(1, '#111827')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 768, 1152)

  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 120, 768, 118)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, 120)
  ctx.lineTo(768, 120)
  ctx.moveTo(0, 238)
  ctx.lineTo(768, 238)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
  ctx.lineWidth = 6
  ctx.strokeRect(28, 28, 712, 1096)

  ctx.fillStyle = '#f8fafc'
  ctx.font = '800 54px "Space Grotesk", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`${PORTFOLIO_DATA.identity.name} // ${PORTFOLIO_DATA.identity.role}`, 76, 340)

  ctx.fillStyle = '#38bdf8'
  ctx.font = '600 26px "JetBrains Mono", monospace'
  ctx.fillText('AI PROMPTER & AI DEVELOPER', 76, 392)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '500 26px "Inter", sans-serif'
  ctx.fillText('Spesialis Prompt Engineering, integrasi', 76, 470)
  ctx.fillText('AI, serta pembangunan website & aplikasi', 76, 512)
  ctx.fillText('modern berbasis kecerdasan buatan.', 76, 554)

  const tags = ['AI PROMPT', 'LLM', 'AGENTS', 'REACT', 'TYPESCRIPT', 'WEB & APP']
  let tx = 76
  let ty = 635
  ctx.font = '700 24px "JetBrains Mono", monospace'
  tags.forEach((tag) => {
    const tw = ctx.measureText(tag).width + 44
    if (tx + tw > 690) {
      tx = 76
      ty += 68
    }
    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)'
    ctx.beginPath()
    ctx.roundRect(tx, ty - 38, tw, 52, 14)
    ctx.fill()
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = '#e0f2fe'
    ctx.fillText(tag, tx + 22, ty - 4)
    tx += tw + 16
  })

  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.beginPath()
  ctx.roundRect(76, 825, 616, 130, 18)
  ctx.fill()

  ctx.fillStyle = '#64748b'
  ctx.font = '600 20px "JetBrains Mono", monospace'
  ctx.fillText('AUTHORIZED SIGNATURE', 102, 862)

  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(118, 922)
  ctx.bezierCurveTo(175, 865, 210, 948, 275, 895)
  ctx.bezierCurveTo(320, 865, 360, 938, 430, 902)
  ctx.bezierCurveTo(475, 882, 515, 922, 575, 896)
  ctx.stroke()

  ctx.fillStyle = '#94a3b8'
  ctx.font = '600 22px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`${PORTFOLIO_DATA.identity.location}  •  ${PORTFOLIO_DATA.identity.badgeId}`, 384, 1068)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

// Woven fabric lanyard texture (dark navy with gold + teal executive stripe)
function createLanyardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, 64, 256)

  // Subtle diagonal woven fabric lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.lineWidth = 2
  for (let y = -64; y < 320; y += 8) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(64, y + 32)
    ctx.stroke()
  }

  // Center gold executive stripe + subtle teal edges
  ctx.fillStyle = '#fbbf24'
  ctx.fillRect(27, 0, 10, 256)
  ctx.fillStyle = '#14b8a6'
  ctx.fillRect(5, 0, 4, 256)
  ctx.fillRect(55, 0, 4, 256)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

export const HangingIdCard = memo(function HangingIdCard({
  isInspecting,
  flipSignal,
  resetSignal,
  lampPulse,
  onOpenInspect,
}: HangingIdCardProps) {
  const { camera, gl } = useThree()
  const cardGroupRef = useRef<THREE.Group>(null)
  const claspRef = useRef<THREE.Mesh>(null)
  const strapMeshRef = useRef<THREE.Mesh>(null)

  const [hovered, setHovered] = useState(false)
  const [isDraggingHanging, setIsDraggingHanging] = useState(false)

  // Pre-allocated Verlet chain: nodes 0..5 = lanyard, node 6 = card center of mass
  const chainRef = useRef<{ pos: THREE.Vector3[]; prev: THREE.Vector3[] } | null>(null)
  if (!chainRef.current) {
    const pos: THREE.Vector3[] = []
    const prev: THREE.Vector3[] = []
    for (let i = 0; i < ROPE_NODES; i++) {
      const p = new THREE.Vector3(LAMP_HOOK_POS.x, LAMP_HOOK_POS.y - i * SEG_LEN, LAMP_HOOK_POS.z)
      pos.push(p)
      prev.push(p.clone())
    }
    // Node 6: card center of mass hanging below clasp
    const cardCenter = new THREE.Vector3(
      LAMP_HOOK_POS.x,
      LAMP_HOOK_POS.y - (ROPE_NODES - 1) * SEG_LEN - CARD_HALF_H,
      LAMP_HOOK_POS.z
    )
    pos.push(cardCenter)
    prev.push(cardCenter.clone())
    chainRef.current = { pos, prev }
  }

  // Twist angle around the lanyard axis (Y) so flicking can gently spin the card, then settle calmly
  const twistRef = useRef({ angle: 0.52, vel: 0 })

  // Dragging state while hanging on the lamp
  const hangingDrag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    dragTarget: new THREE.Vector3(),
    dragPlane: new THREE.Plane(),
  })

  // Inspect mode click-and-drag 360° state
  const inspectDrag = useRef({ active: false, lastX: 0, lastY: 0 })
  const targetRot = useRef({ x: 0.05, y: 0 })
  const currentRot = useRef({ x: 0.05, y: 0 })
  const inspectPos = useRef(LAMP_HOOK_POS.clone())
  const inspectScale = useRef(1)

  // Reusable scratch vectors (ZERO allocations inside useFrame!)
  const scratch = useMemo(
    () => ({
      raycaster: new THREE.Raycaster(),
      ndc: new THREE.Vector2(),
      hitPoint: new THREE.Vector3(),
      camDir: new THREE.Vector3(),
      diff: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      down: new THREE.Vector3(0, -1, 0),
      tangent: new THREE.Vector3(),
      side: new THREE.Vector3(),
      cardDir: new THREE.Vector3(),
      quatAlign: new THREE.Quaternion(),
      quatTwist: new THREE.Quaternion(),
      quatFinal: new THREE.Quaternion(),
      curvePts: Array.from({ length: RIBBON_SAMPLES + 1 }, () => new THREE.Vector3()),
      curve: new THREE.CatmullRomCurve3(
        Array.from({ length: ROPE_NODES }, () => new THREE.Vector3())
      ),
    }),
    []
  )

  // Dynamic ribbon geometry for realistic flexible fabric lanyard
  const ribbonGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const vertCount = (RIBBON_SAMPLES + 1) * 2
    const positions = new Float32Array(vertCount * 3)
    const uvs = new Float32Array(vertCount * 2)
    const indices: number[] = []

    for (let i = 0; i <= RIBBON_SAMPLES; i++) {
      const v = i / RIBBON_SAMPLES
      uvs[i * 4 + 0] = 0
      uvs[i * 4 + 1] = v
      uvs[i * 4 + 2] = 1
      uvs[i * 4 + 3] = v

      if (i < RIBBON_SAMPLES) {
        const a = i * 2
        const b = i * 2 + 1
        const c = (i + 1) * 2
        const d = (i + 1) * 2 + 1
        indices.push(a, b, c, b, d, c)
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    return geo
  }, [])

  const { texture: frontTexture, ctx: frontCtx } = useMemo(() => createFrontTexture(), [])
  const backTexture = useMemo(() => createBackTexture(), [])
  const lanyardTexture = useMemo(() => createLanyardTexture(), [])

  // Load compressed portrait photo into the ID Card front canvas texture
  useEffect(() => {
    let active = true
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = PORTFOLIO_DATA.identity.photo
    img.onload = () => {
      if (!active) return
      drawFrontCard(frontCtx, img)
      frontTexture.needsUpdate = true
    }
    return () => {
      active = false
    }
  }, [frontCtx, frontTexture])

  useEffect(() => {
    return () => {
      frontTexture.dispose()
      backTexture.dispose()
      lanyardTexture.dispose()
      ribbonGeo.dispose()
    }
  }, [frontTexture, backTexture, lanyardTexture, ribbonGeo])

  // Gentle physical nudge when desk lamp is clicked
  useEffect(() => {
    if (lampPulse > 0 && !isInspecting && chainRef.current) {
      chainRef.current.prev[ROPE_NODES].x -= 0.022
      chainRef.current.prev[ROPE_NODES].z -= 0.012
      twistRef.current.vel += 1.5
    }
  }, [lampPulse, isInspecting])

  // Flip front/back in Inspect Mode
  useEffect(() => {
    if (flipSignal > 0 && isInspecting) {
      targetRot.current.y += Math.PI
    }
  }, [flipSignal, isInspecting])

  // Reset state when entering/leaving Inspect Mode
  useEffect(() => {
    if (isInspecting) {
      hangingDrag.current.active = false
      setIsDraggingHanging(false)
      targetRot.current.x = 0.05
      targetRot.current.y = 0
      if (chainRef.current) {
        inspectPos.current.copy(chainRef.current.pos[ROPE_NODES])
      }
    } else {
      inspectDrag.current.active = false
    }
  }, [isInspecting, resetSignal])

  // Global pointer handlers for both Hanging Rope Drag-to-Play and 360° Inspect Mode
  useEffect(() => {
    const rectOfCanvas = () => gl.domElement.getBoundingClientRect()

    const handlePointerMove = (e: PointerEvent) => {
      if (isInspecting) {
        if (!inspectDrag.current.active) return
        const dx = e.clientX - inspectDrag.current.lastX
        const dy = e.clientY - inspectDrag.current.lastY
        inspectDrag.current.lastX = e.clientX
        inspectDrag.current.lastY = e.clientY

        targetRot.current.y += dx * 0.012
        targetRot.current.x = THREE.MathUtils.clamp(
          targetRot.current.x + dy * 0.009,
          -1.15,
          1.15
        )
        return
      }

      if (!hangingDrag.current.active) return

      const dx = e.clientX - hangingDrag.current.lastX
      hangingDrag.current.lastX = e.clientX

      const totalDist = Math.hypot(
        e.clientX - hangingDrag.current.startX,
        e.clientY - hangingDrag.current.startY
      )
      if (totalDist > 6 && !hangingDrag.current.moved) {
        hangingDrag.current.moved = true
        setIsDraggingHanging(true)
        document.body.style.cursor = 'grabbing'
      }

      if (hangingDrag.current.moved) {
        const rect = rectOfCanvas()
        scratch.ndc.set(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        )
        scratch.raycaster.setFromCamera(scratch.ndc, camera)
        if (
          scratch.raycaster.ray.intersectPlane(
            hangingDrag.current.dragPlane,
            scratch.hitPoint
          )
        ) {
          // Constrain pull radius to realistic lanyard + card length so strap pulls taut
          const maxReach = (ROPE_NODES - 1) * SEG_LEN + CARD_HALF_H + 0.06
          scratch.diff.subVectors(scratch.hitPoint, LAMP_HOOK_POS)
          if (scratch.diff.length() > maxReach) {
            scratch.diff.setLength(maxReach)
          }
          // Keep card above tabletop (y = 0)
          hangingDrag.current.dragTarget
            .copy(LAMP_HOOK_POS)
            .add(scratch.diff)
          hangingDrag.current.dragTarget.y = Math.max(
            0.29,
            hangingDrag.current.dragTarget.y
          )
        }
        // Subtle twist impulse as you drag horizontally
        twistRef.current.vel = THREE.MathUtils.clamp(
          twistRef.current.vel + dx * 0.035,
          -7,
          7
        )
      }
    }

    const handlePointerUp = () => {
      if (isInspecting) {
        if (!inspectDrag.current.active) return
        inspectDrag.current.active = false
        document.body.style.cursor = 'grab'
        return
      }

      if (!hangingDrag.current.active) return
      const wasDragged = hangingDrag.current.moved
      hangingDrag.current.active = false
      setIsDraggingHanging(false)
      document.body.style.cursor = 'auto'

      if (!wasDragged) {
        // Pure single click -> open 360° Inspect Mode!
        onOpenInspect()
      }
    }

    const handleInspectDown = (e: PointerEvent) => {
      if (!isInspecting) return
      if ((e.target as HTMLElement)?.closest('button')) return
      inspectDrag.current.active = true
      inspectDrag.current.lastX = e.clientX
      inspectDrag.current.lastY = e.clientY
      document.body.style.cursor = 'grabbing'
    }

    if (isInspecting) {
      document.body.style.cursor = 'grab'
      window.addEventListener('pointerdown', handleInspectDown)
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointerdown', handleInspectDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      if (isInspecting) {
        document.body.style.cursor = 'auto'
      }
    }
  }, [camera, gl, isInspecting, onOpenInspect, scratch])

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.033)
    const chain = chainRef.current
    if (!chain || !cardGroupRef.current) return

    if (isInspecting) {
      // Hide strap & clasp in Inspect Mode
      if (strapMeshRef.current) strapMeshRef.current.visible = false
      if (claspRef.current) claspRef.current.visible = false

      inspectPos.current.x = THREE.MathUtils.damp(inspectPos.current.x, INSPECT_CENTER_POS.x, 8, delta)
      inspectPos.current.y = THREE.MathUtils.damp(inspectPos.current.y, INSPECT_CENTER_POS.y, 8, delta)
      inspectPos.current.z = THREE.MathUtils.damp(inspectPos.current.z, INSPECT_CENTER_POS.z, 8, delta)
      inspectScale.current = THREE.MathUtils.damp(inspectScale.current, 1.55, 8, delta)

      currentRot.current.x = THREE.MathUtils.damp(currentRot.current.x, targetRot.current.x, 11, delta)
      currentRot.current.y = THREE.MathUtils.damp(currentRot.current.y, targetRot.current.y, 11, delta)

      cardGroupRef.current.position.copy(inspectPos.current)
      cardGroupRef.current.scale.setScalar(inspectScale.current)
      cardGroupRef.current.rotation.set(currentRot.current.x, currentRot.current.y, 0)
      return
    }

    // ==================== HANGING VERLET ROPE PHYSICS ====================
    if (strapMeshRef.current) strapMeshRef.current.visible = true
    if (claspRef.current) claspRef.current.visible = true

    inspectScale.current = THREE.MathUtils.damp(inspectScale.current, 1.0, 9, delta)
    cardGroupRef.current.scale.setScalar(inspectScale.current)

    const { pos, prev } = chain
    const totalNodes = pos.length
    const dtSq = delta * delta
    const gravity = -11.5
    // Strong realistic air/fabric damping so card settles completely still (no endless swaying!)
    const damping = Math.pow(0.06, delta)

    // 1. Verlet integration step (nodes 1..6)
    let totalMotion = 0
    for (let i = 1; i < totalNodes; i++) {
      const p = pos[i]
      const o = prev[i]
      const vx = (p.x - o.x) * damping
      const vy = (p.y - o.y) * damping
      const vz = (p.z - o.z) * damping

      o.copy(p)
      p.x += vx
      p.y += vy + gravity * dtSq
      p.z += vz
      totalMotion += Math.abs(vx) + Math.abs(vy) + Math.abs(vz)
    }

    // 2. If user is dragging the hanging card, pull node 6 (card center) smoothly to cursor
    if (hangingDrag.current.active && hangingDrag.current.moved) {
      const cardNode = pos[ROPE_NODES]
      cardNode.lerp(hangingDrag.current.dragTarget, 0.45)
    }

    // 3. Distance constraints solver (6 iterations = crisp, non-stretchy realistic fabric strap)
    for (let iter = 0; iter < 6; iter++) {
      // Pin node 0 firmly to lamp hook
      pos[0].copy(LAMP_HOOK_POS)

      for (let i = 0; i < totalNodes - 1; i++) {
        const a = pos[i]
        const b = pos[i + 1]
        const targetLen = i === ROPE_NODES - 1 ? CARD_HALF_H : SEG_LEN
        scratch.diff.subVectors(b, a)
        const dist = scratch.diff.length()
        if (dist > 0.00001) {
          const err = (dist - targetLen) / dist
          if (i === 0) {
            b.addScaledVector(scratch.diff, -err)
          } else if (
            i === ROPE_NODES - 1 &&
            hangingDrag.current.active &&
            hangingDrag.current.moved
          ) {
            // While user holds card, let the strap adjust to the card
            a.addScaledVector(scratch.diff, err * 0.8)
            b.addScaledVector(scratch.diff, -err * 0.2)
          } else {
            a.addScaledVector(scratch.diff, err * 0.5)
            b.addScaledVector(scratch.diff, -err * 0.5)
          }
        }
      }

      // Prevent card center from ever clipping through tabletop (y = 0)
      if (pos[ROPE_NODES].y < 0.29) {
        pos[ROPE_NODES].y = 0.29
      }
    }

    // Re-pin node 0
    pos[0].copy(LAMP_HOOK_POS)

    // Sleep micro-jitter when nearly at rest so it sits 100% calm & stable
    if (!hangingDrag.current.active && totalMotion < 0.00025) {
      for (let i = 1; i < totalNodes; i++) {
        prev[i].copy(pos[i])
      }
    }

    // 4. Twist spring around lanyard axis (settles calmly to resting angle 0.52)
    const restTwist = 0.52
    const twistAcc = -9.0 * (twistRef.current.angle - restTwist) - 4.2 * twistRef.current.vel
    twistRef.current.vel += twistAcc * delta
    twistRef.current.angle += twistRef.current.vel * delta
    if (
      !hangingDrag.current.active &&
      Math.abs(twistRef.current.vel) < 0.002 &&
      Math.abs(twistRef.current.angle - restTwist) < 0.002
    ) {
      twistRef.current.vel = 0
      twistRef.current.angle = restTwist
    }

    // 5. Position & orient the ID Card smoothly along (clasp -> card center)
    const claspPos = pos[ROPE_NODES - 1]
    const cardPos = pos[ROPE_NODES]
    cardGroupRef.current.position.copy(cardPos)

    scratch.cardDir.subVectors(cardPos, claspPos).normalize()
    scratch.quatAlign.setFromUnitVectors(scratch.down, scratch.cardDir)
    scratch.quatTwist.setFromAxisAngle(scratch.up, twistRef.current.angle)
    scratch.quatFinal.multiplyQuaternions(scratch.quatAlign, scratch.quatTwist)
    cardGroupRef.current.quaternion.copy(scratch.quatFinal)

    // Orient metal swivel clasp at the bottom of the lanyard
    if (claspRef.current) {
      claspRef.current.position.copy(claspPos)
      claspRef.current.quaternion.copy(scratch.quatFinal)
    }

    // 6. Update realistic flexible fabric ribbon geometry along the Verlet rope nodes
    for (let i = 0; i < ROPE_NODES; i++) {
      scratch.curve.points[i].copy(pos[i])
    }

    const posAttr = ribbonGeo.getAttribute('position') as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array
    const halfWidth = 0.022

    // Ribbon side vector rotates smoothly with card twist
    const cosT = Math.cos(twistRef.current.angle)
    const sinT = Math.sin(twistRef.current.angle)

    for (let i = 0; i <= RIBBON_SAMPLES; i++) {
      const u = i / RIBBON_SAMPLES
      const pt = scratch.curve.getPoint(u, scratch.curvePts[i])
      scratch.curve.getTangent(u, scratch.tangent).normalize()

      // Blend ribbon orientation from lamp ring to card twist along the strap
      const twistBlend = u
      scratch.side.set(cosT * twistBlend + (1 - twistBlend) * 0.85, 0, -sinT * twistBlend - (1 - twistBlend) * 0.5)
      // Make perpendicular to rope tangent
      scratch.side.addScaledVector(scratch.tangent, -scratch.side.dot(scratch.tangent))
      if (scratch.side.lengthSq() < 0.0001) {
        scratch.side.set(1, 0, 0)
      } else {
        scratch.side.normalize()
      }

      const idx = i * 6
      arr[idx + 0] = pt.x - scratch.side.x * halfWidth
      arr[idx + 1] = pt.y - scratch.side.y * halfWidth
      arr[idx + 2] = pt.z - scratch.side.z * halfWidth

      arr[idx + 3] = pt.x + scratch.side.x * halfWidth
      arr[idx + 4] = pt.y + scratch.side.y * halfWidth
      arr[idx + 5] = pt.z + scratch.side.z * halfWidth
    }

    posAttr.needsUpdate = true
    ribbonGeo.computeVertexNormals()
  })

  return (
    <group>
      {/* Realistic Flexible Fabric Lanyard Strap (frustumCulled=false so it never disappears!) */}
      <mesh ref={strapMeshRef} geometry={ribbonGeo} frustumCulled={false} castShadow>
        <meshStandardMaterial
          map={lanyardTexture}
          roughness={0.82}
          metalness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Metallic Swivel Clasp connecting strap to ID Card */}
      <mesh ref={claspRef}>
        <cylinderGeometry args={[0.015, 0.022, 0.044, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.88} roughness={0.2} />
      </mesh>

      {/* The 3D ID Card Body */}
      <group
        ref={cardGroupRef}
        position={[LAMP_HOOK_POS.x, LAMP_HOOK_POS.y - (ROPE_NODES - 1) * SEG_LEN - CARD_HALF_H, LAMP_HOOK_POS.z]}
        onPointerDown={(e) => {
          if (isInspecting || !chainRef.current) return
          e.stopPropagation()

          // Build a drag plane facing the camera at the card's current position
          camera.getWorldDirection(scratch.camDir)
          hangingDrag.current.dragPlane.setFromNormalAndCoplanarPoint(
            scratch.camDir.clone().negate(),
            chainRef.current.pos[ROPE_NODES]
          )
          hangingDrag.current.dragTarget.copy(chainRef.current.pos[ROPE_NODES])
          hangingDrag.current.active = true
          hangingDrag.current.moved = false
          hangingDrag.current.startX = e.clientX
          hangingDrag.current.startY = e.clientY
          hangingDrag.current.lastX = e.clientX
          document.body.style.cursor = 'grab'
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (!isInspecting) {
            setHovered(true)
            if (!hangingDrag.current.active) {
              document.body.style.cursor = 'grab'
            }
          }
        }}
        onPointerOut={() => {
          setHovered(false)
          if (!isInspecting && !hangingDrag.current.active) {
            document.body.style.cursor = 'auto'
          }
        }}
      >
        {/* Top Metal Clip Holder */}
        <mesh position={[0, 0.275, 0]}>
          <boxGeometry args={[0.09, 0.032, 0.024]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.22} />
        </mesh>

        {/* Card Base Core */}
        <RoundedBox args={[0.36, 0.54, 0.016]} radius={0.02} smoothness={2} castShadow>
          <meshStandardMaterial
            color={(hovered || isDraggingHanging) && !isInspecting ? '#fbbf24' : '#1e293b'}
            metalness={0.68}
            roughness={0.24}
          />
        </RoundedBox>

        {/* Front Face (JUDA - BOSS + Photo) */}
        <mesh position={[0, 0, 0.0086]}>
          <planeGeometry args={[0.342, 0.522]} />
          <meshStandardMaterial
            map={frontTexture}
            metalness={0.2}
            roughness={0.28}
          />
        </mesh>

        {/* Back Face */}
        <mesh position={[0, 0, -0.0086]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.342, 0.522]} />
          <meshStandardMaterial
            map={backTexture}
            metalness={0.2}
            roughness={0.28}
          />
        </mesh>

        {/* Hover Tooltip in Desk View */}
        {hovered && !isInspecting && !isDraggingHanging && (
          <Html position={[0, -0.37, 0]} center distanceFactor={7}>
            <div className="pointer-events-none whitespace-nowrap rounded-full border border-amber-400/50 bg-slate-950/95 px-3 py-1 text-xs font-semibold text-amber-300 shadow-xl">
              🪪 JUDA (BOSS) • Drag tali untuk mainkan • Klik untuk Inspect
            </div>
          </Html>
        )}
      </group>
    </group>
  )
})
