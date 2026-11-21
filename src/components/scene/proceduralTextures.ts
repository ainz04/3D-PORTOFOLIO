import * as THREE from 'three'

// 1. Rich Walnut Wood Grain Texture for Desk Tabletop
export function createWoodTexture(isDark: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = isDark ? '#3a271c' : '#8a5a36'
  ctx.fillRect(0, 0, 512, 256)

  // Horizontal organic wood grain fibers
  for (let y = 0; y < 256; y += 2) {
    const wave = Math.sin(y * 0.08) * 14 + Math.cos(y * 0.23) * 6
    const alpha = 0.04 + (Math.sin(y * 0.37) + 1) * 0.045
    ctx.strokeStyle = isDark
      ? `rgba(18, 10, 6, ${alpha})`
      : `rgba(66, 36, 16, ${alpha})`
    ctx.lineWidth = 1.5 + (y % 3) * 0.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.bezierCurveTo(170, y + wave * 0.4, 340, y - wave * 0.3, 512, y + wave * 0.2)
    ctx.stroke()
  }

  // Subtle lighter wood highlights
  for (let i = 0; i < 28; i++) {
    const y = (i * 9.3) % 256
    ctx.strokeStyle = isDark
      ? 'rgba(130, 88, 58, 0.08)'
      : 'rgba(218, 168, 118, 0.14)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(512, y + Math.sin(i) * 4)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  return tex
}

// 2. Hardwood Floor Plank Texture
export function createFloorTexture(isDark: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = isDark ? '#111726' : '#c9b399'
  ctx.fillRect(0, 0, 512, 512)

  const plankH = 64
  for (let row = 0; row < 8; row++) {
    const y = row * plankH
    const shade = (row % 3) * 4 - 4
    ctx.fillStyle = isDark
      ? `rgb(${16 + shade}, ${22 + shade}, ${35 + shade})`
      : `rgb(${198 + shade * 2}, ${174 + shade * 2}, ${146 + shade * 2})`
    ctx.fillRect(0, y + 1, 512, plankH - 2)

    // Subtle grain per plank
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(90,60,30,0.08)'
    ctx.lineWidth = 1
    for (let g = 6; g < plankH - 4; g += 8) {
      ctx.beginPath()
      ctx.moveTo(0, y + g)
      ctx.lineTo(512, y + g + Math.sin(row + g) * 2)
      ctx.stroke()
    }

    // Plank seam
    ctx.strokeStyle = isDark ? 'rgba(5,8,15,0.75)' : 'rgba(110,80,50,0.35)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(512, y)
    ctx.stroke()

    const jointX = ((row * 173 + 90) % 420) + 40
    ctx.beginPath()
    ctx.moveTo(jointX, y)
    ctx.lineTo(jointX, y + plankH)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  tex.anisotropy = 4
  return tex
}

// 3. Woven Studio Rug Texture
export function createRugTexture(isDark: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = isDark ? '#182032' : '#94a3b8'
  ctx.fillRect(0, 0, 256, 256)

  // Subtle woven cross-hatch
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.12)'
  for (let y = 0; y < 256; y += 4) {
    ctx.fillRect(0, y, 256, 1)
  }
  ctx.fillStyle = isDark ? 'rgba(0,0,0,0.16)' : 'rgba(15,23,42,0.08)'
  for (let x = 0; x < 256; x += 6) {
    ctx.fillRect(x, 0, 2, 256)
  }

  // Minimalist geometric border stripe
  ctx.strokeStyle = isDark ? 'rgba(251, 191, 36, 0.25)' : 'rgba(255, 255, 255, 0.45)'
  ctx.lineWidth = 5
  ctx.strokeRect(14, 14, 228, 228)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// 4. Perforated Pegboard Texture
export function createPegboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, 512, 256)

  // Matte grid of rounded pegboard slots
  ctx.fillStyle = '#090d16'
  for (let x = 22; x < 496; x += 26) {
    for (let y = 20; y < 240; y += 26) {
      ctx.beginPath()
      ctx.roundRect(x - 3, y - 6, 6, 12, 3)
      ctx.fill()
    }
  }

  // Subtle bevel border
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)'
  ctx.lineWidth = 4
  ctx.strokeRect(4, 4, 504, 248)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// 5. Realistic Mechanical Keyboard Keycaps Texture (75% Layout with Accent Esc & Enter)
export function createKeyboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 192
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0b1120'
  ctx.fillRect(0, 0, 512, 192)

  const rows = [
    { count: 14, y: 12, h: 28 },
    { count: 14, y: 46, h: 28 },
    { count: 13, y: 80, h: 28 },
    { count: 12, y: 114, h: 28 },
  ]

  rows.forEach((row, rIdx) => {
    const gap = 5
    const totalW = 488
    const keyW = (totalW - gap * (row.count - 1)) / row.count
    for (let c = 0; c < row.count; c++) {
      const x = 12 + c * (keyW + gap)
      let fill = '#334155'
      if (rIdx === 0 && c === 0) fill = '#f59e0b' // Gold Esc key
      else if (rIdx === 2 && c === row.count - 1) fill = '#0ea5e9' // Cyan Enter key
      else if (c === 0 || c === row.count - 1) fill = '#1e293b' // Dark modifier keys

      ctx.fillStyle = fill
      ctx.beginPath()
      ctx.roundRect(x, row.y, keyW, row.h, 5)
      ctx.fill()

      // Subtle keycap top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.beginPath()
      ctx.roundRect(x + 3, row.y + 3, keyW - 6, row.h - 10, 3)
      ctx.fill()
    }
  })

  // Bottom row with wide Spacebar
  const bottomKeys = [
    { x: 12, w: 46, c: '#1e293b' },
    { x: 63, w: 42, c: '#1e293b' },
    { x: 110, w: 42, c: '#1e293b' },
    { x: 157, w: 196, c: '#334155' }, // Spacebar
    { x: 358, w: 42, c: '#1e293b' },
    { x: 405, w: 42, c: '#1e293b' },
    { x: 452, w: 48, c: '#14b8a6' }, // Teal Fn/Arrow accent
  ]
  bottomKeys.forEach((k) => {
    ctx.fillStyle = k.c
    ctx.beginPath()
    ctx.roundRect(k.x, 148, k.w, 30, 5)
    ctx.fill()
  })

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// 6. Realistic Smartphone Lock/Notification Screen Texture
export function createPhoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createLinearGradient(0, 0, 256, 512)
  grad.addColorStop(0, '#0f172a')
  grad.addColorStop(0.55, '#0c4a6e')
  grad.addColorStop(1, '#111827')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 512)

  // Dynamic Island notch
  ctx.fillStyle = '#020617'
  ctx.beginPath()
  ctx.roundRect(84, 18, 88, 22, 11)
  ctx.fill()

  // Time
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 62px "Space Grotesk", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('09:41', 128, 128)

  ctx.fillStyle = '#bae6fd'
  ctx.font = '600 18px "Inter", sans-serif'
  ctx.fillText('JUDA • BOSS', 128, 160)

  // Notification Card 1
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
  ctx.beginPath()
  ctx.roundRect(20, 206, 216, 92, 18)
  ctx.fill()
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#38bdf8'
  ctx.font = '700 15px "JetBrains Mono", monospace'
  ctx.textAlign = 'left'
  ctx.fillText('NEW MESSAGE', 36, 236)
  ctx.fillStyle = '#f8fafc'
  ctx.font = '600 16px "Inter", sans-serif'
  ctx.fillText('Let’s collaborate!', 36, 264)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '500 14px "Inter", sans-serif'
  ctx.fillText('Tap to contact', 36, 286)

  // Notification Card 2
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)'
  ctx.beginPath()
  ctx.roundRect(20, 314, 216, 74, 18)
  ctx.fill()
  ctx.fillStyle = '#fbbf24'
  ctx.font = '700 14px "JetBrains Mono", monospace'
  ctx.fillText('STATUS: ONLINE', 36, 344)
  ctx.fillStyle = '#cbd5e1'
  ctx.font = '500 14px "Inter", sans-serif'
  ctx.fillText('Ready for projects', 36, 370)

  // Home bar
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.beginPath()
  ctx.roundRect(82, 486, 92, 6, 3)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// 7. Window Outdoor Sky Gradient Texture
export function createSkyTexture(isDark: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  if (isDark) {
    grad.addColorStop(0, '#0f172a')
    grad.addColorStop(0.55, '#1e3a5f')
    grad.addColorStop(1, '#38bdf8')
  } else {
    grad.addColorStop(0, '#7dd3fc')
    grad.addColorStop(0.55, '#fef3c7')
    grad.addColorStop(1, '#fed7aa')
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)

  // Soft glowing sun / moon orb
  const orb = ctx.createRadialGradient(170, 88, 6, 170, 88, 72)
  orb.addColorStop(0, isDark ? 'rgba(224, 242, 254, 0.95)' : 'rgba(255, 251, 235, 1)')
  orb.addColorStop(0.4, isDark ? 'rgba(125, 211, 252, 0.4)' : 'rgba(253, 224, 71, 0.45)')
  orb.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = orb
  ctx.fillRect(0, 0, 256, 256)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
