// Run: node make-icons.js
// Generates icon16.png, icon48.png, icon128.png using pure Node.js (no deps)

const fs = require('fs')
const path = require('path')

function makePNG(size) {
  // Draw shield icon on colored background as raw PNG
  // We use a minimal PNG encoder (pure JS, no deps)

  const data = new Uint8Array(size * size * 4)
  const cx = size / 2, cy = size / 2, r = size * 0.46

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const dx = x - cx, dy = y - cy
      const dist = Math.sqrt(dx*dx + dy*dy)

      // Background: indigo gradient effect
      const bgR = Math.round(79  + (dx / size) * 20)
      const bgG = Math.round(70  + (dy / size) * 10)
      const bgB = Math.round(229 - (dx / size) * 20)

      if (dist > r) {
        // Transparent outside circle
        data[i] = data[i+1] = data[i+2] = data[i+3] = 0
        continue
      }

      // Shield shape (approximated with geometry)
      const nx = dx / r, ny = dy / r

      // Shield outline: wider at top, pointed at bottom
      const shieldW = 0.55 * (1 - Math.max(0, ny) * 0.4)
      const shieldH = 0.65
      const inShield = Math.abs(nx) < shieldW && ny > -shieldH &&
        (ny < 0.2 || Math.abs(nx) < shieldW * (1 - (ny - 0.2) * 1.5))

      // Checkmark inside shield
      const ckX = nx + 0.05, ckY = ny
      const onCheckLeft  = (ckX > -0.3 && ckX < -0.05 && Math.abs(ckY - (ckX + 0.3) * 0.8 - 0.05) < 0.09)
      const onCheckRight = (ckX > -0.05 && ckX < 0.35  && Math.abs(ckY - (-ckX + 0.35) * 1.1 + 0.05) < 0.09)
      const onCheck = onCheckLeft || onCheckRight

      if (inShield && onCheck) {
        data[i] = 255; data[i+1] = 255; data[i+2] = 255; data[i+3] = 255
      } else if (inShield) {
        data[i] = 255; data[i+1] = 255; data[i+2] = 255; data[i+3] = 60
      } else {
        data[i] = bgR; data[i+1] = bgG; data[i+2] = bgB; data[i+3] = 255
      }
    }
  }

  return toPNG(data, size, size)
}

// Minimal PNG encoder ─────────────────────────────────────────────────────────
function toPNG(rgba, w, h) {
  const crc32 = (() => {
    const t = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
      t[i] = c
    }
    return (buf) => {
      let c = 0xFFFFFFFF
      for (const b of buf) c = t[(c ^ b) & 0xFF] ^ (c >>> 8)
      return (c ^ 0xFFFFFFFF) >>> 0
    }
  })()

  const adler32 = (buf) => {
    let a = 1, b = 0
    for (const v of buf) { a = (a + v) % 65521; b = (b + a) % 65521 }
    return (b << 16) | a
  }

  const u32be = (n) => [(n>>>24)&0xFF,(n>>>16)&0xFF,(n>>>8)&0xFF,n&0xFF]
  const chunk = (type, data) => {
    const t = [...type].map(c => c.charCodeAt(0))
    const crc = crc32([...t, ...data])
    return [...u32be(data.length), ...t, ...data, ...u32be(crc)]
  }

  // Build raw scanlines (filter byte 0 = None per row)
  const raw = []
  for (let y = 0; y < h; y++) {
    raw.push(0)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      raw.push(rgba[i], rgba[i+1], rgba[i+2], rgba[i+3])
    }
  }

  // Deflate (uncompressed, max 65535 bytes per block)
  const deflate = (data) => {
    const out = [0x78, 0x01]
    let i = 0
    while (i < data.length) {
      const block = data.slice(i, i + 65535)
      const last = (i + 65535) >= data.length ? 1 : 0
      const len = block.length
      out.push(last, len & 0xFF, (len >> 8) & 0xFF, (~len) & 0xFF, (~len >> 8) & 0xFF, ...block)
      i += 65535
    }
    const a = adler32(data)
    out.push((a>>>24)&0xFF,(a>>>16)&0xFF,(a>>>8)&0xFF,a&0xFF)
    return out
  }

  const IHDR = [...u32be(w), ...u32be(h), 8, 6, 0, 0, 0]
  const IDAT = deflate(raw)

  const bytes = [
    0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,
    ...chunk('IHDR', IHDR),
    ...chunk('IDAT', IDAT),
    ...chunk('IEND', [])
  ]

  return Buffer.from(bytes)
}

// Generate icons
const outDir = path.join(__dirname, 'icons')
for (const size of [16, 48, 128]) {
  const buf = makePNG(size)
  fs.writeFileSync(path.join(outDir, `icon${size}.png`), buf)
  console.log(`Created icon${size}.png`)
}
console.log('All icons created!')
