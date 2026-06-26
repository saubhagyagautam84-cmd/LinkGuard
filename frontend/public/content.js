// LinkGuard Content Script — intercepts every link click on every webpage
const BACKEND = 'http://localhost:3001'

let overlay = null

function removeOverlay() {
  if (overlay) { overlay.remove(); overlay = null }
}

function showOverlay(url, reasons, risk, score, target) {
  removeOverlay()

  const reasonsHtml = (reasons && reasons.length ? reasons : ['Matched phishing patterns']).map(r => `
    <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px">
      <div style="width:16px;height:16px;min-width:16px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin-top:1px">
        <svg width="9" height="9" viewBox="0 0 20 20" fill="#EF4444">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </div>
      <span style="font-size:13px;color:#374151;line-height:1.4">${r}</span>
    </div>
  `).join('')

  overlay = document.createElement('div')
  overlay.id = '__linkguard__'
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:2147483647',
    'background:rgba(0,0,0,0.65)',
    'display:flex', 'align-items:center', 'justify-content:center',
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
    'padding:16px', 'box-sizing:border-box'
  ].join(';')

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;width:100%;max-width:420px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.45)">

      <!-- Red header -->
      <div style="background:#EF4444;padding:28px 24px 22px;text-align:center">
        <div style="width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
          <svg width="30" height="30" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>
        <h2 style="color:#fff;font-size:18px;font-weight:600;margin:0 0 5px">Phishing Link Detected!</h2>
        <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0">LinkGuard has blocked this link</p>
      </div>

      <!-- Body -->
      <div style="padding:20px 24px 24px">

        <!-- Risk badge + branding -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
          <span style="font-size:11px;font-weight:600;background:#FEE2E2;color:#DC2626;padding:3px 10px;border-radius:20px">
            ${risk} Risk · ${score}%
          </span>
          <span style="font-size:11px;color:#9CA3AF">🛡️ LinkGuard AI</span>
        </div>

        <!-- URL box -->
        <div style="background:#FEF2F2;border:1px solid #FEE2E2;border-radius:10px;padding:10px 14px;margin-bottom:14px">
          <p style="font-size:10px;color:#F87171;margin:0 0 3px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Suspicious URL</p>
          <p style="font-size:12px;color:#DC2626;margin:0;word-break:break-all;font-weight:500">${url}</p>
        </div>

        <!-- Reasons -->
        <div style="margin-bottom:18px">${reasonsHtml}</div>

        <!-- Buttons -->
        <button id="__lg_back__" style="width:100%;background:#EF4444;color:#fff;border:none;border-radius:10px;padding:13px;font-size:14px;font-weight:500;cursor:pointer;margin-bottom:8px;transition:background .15s">
          ← Go back to safety
        </button>
        <button id="__lg_proceed__" style="width:100%;background:transparent;color:#9CA3AF;border:none;padding:8px;font-size:12px;cursor:pointer">
          Proceed anyway (not recommended)
        </button>
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  document.getElementById('__lg_back__').onmouseenter = function() { this.style.background = '#DC2626' }
  document.getElementById('__lg_back__').onmouseleave = function() { this.style.background = '#EF4444' }
  document.getElementById('__lg_back__').onclick      = removeOverlay

  document.getElementById('__lg_proceed__').onclick = () => {
    removeOverlay()
    if (target === '_blank') {
      window.open(url, '_blank', 'noopener')
    } else {
      window.location.href = url
    }
  }

  // Click dark backdrop to dismiss
  overlay.addEventListener('click', e => { if (e.target === overlay) removeOverlay() })

  // Escape key to dismiss
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') { removeOverlay(); document.removeEventListener('keydown', onKey) }
  })
}

// ─── Intercept every link click ─────────────────────────────────────────────
document.addEventListener('click', async (e) => {
  const anchor = e.target.closest('a[href]')
  if (!anchor) return

  const url    = anchor.href
  const target = anchor.target || '_self'

  // Skip non-HTTP, same-origin, anchor-only, and extension links
  if (!url.startsWith('http'))                         return
  if (url.startsWith(window.location.origin + '/'))    return
  if (url.startsWith(window.location.origin + '#'))    return
  if (url.startsWith('chrome-extension://'))           return

  e.preventDefault()
  e.stopImmediatePropagation()

  // Highlight the link while checking
  const prev = anchor.style.outline
  anchor.style.outline = '2px solid #F59E0B'
  anchor.style.outlineOffset = '2px'

  try {
    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(`${BACKEND}/api/check-url`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ url }),
      signal:  controller.signal
    })
    clearTimeout(timeout)
    anchor.style.outline = prev

    const data = await res.json()

    if (data.isPhishing) {
      showOverlay(url, data.reasons, data.risk, data.riskScore, target)
    } else {
      // Safe — navigate normally
      if (target === '_blank') window.open(url, '_blank', 'noopener')
      else window.location.href = url
    }
  } catch {
    // Backend not running or timeout → fail open (don't block the user)
    anchor.style.outline = prev
    if (target === '_blank') window.open(url, '_blank', 'noopener')
    else window.location.href = url
  }

}, true) // true = capture phase, runs before page's own handlers
