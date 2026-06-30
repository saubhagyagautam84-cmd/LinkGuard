// LinkGuard Content Script — self-contained, no backend required
// Scans every link click using built-in phishing detection logic

// ─── Scanner (embedded — no server needed) ───────────────────────────────────

const LEET = { '0':'o','1':'l','3':'e','4':'a','5':'s','@':'a','$':'s','!':'i','7':'t' }

const PROTECTED_BRANDS = [
  'paypal','google','facebook','amazon','apple','microsoft','netflix','instagram',
  'twitter','whatsapp','sbi','hdfc','icici','axis','kotak','pnb','canara','boi',
  'irctc','uidai','aadhar','income','nsdl','epfo','paytm','phonepe','gpay',
  'flipkart','myntra','swiggy','zomato'
]

const PHISHING_KEYWORDS = [
  'login','signin','secure','verify','update','confirm','account','banking',
  'password','credential','urgent','suspended','locked','alert','warning',
  'free','win','winner','prize','claim','reward','congratulation','lucky',
  'refund','bonus','offer','limited','expire','click','support','helpdesk',
  'netbanking','kyc','otp','aadhar','pan','verify'
]

const SUSPICIOUS_TLDS = [
  '.xyz','.win','.tk','.ml','.ga','.cf','.gq','.top','.club','.online',
  '.site','.info','.biz','.pw','.cc','.su','.ru','.cn','.link','.click',
  '.download','.review','.accountant','.racing','.date','.trade','.webcam'
]

const LEGITIMATE_TLDS = [
  'gov.in','nic.in','gov','mil','edu','ac.in','org.in','co.in','net.in','bank'
]

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    }
  }
  return dp[m][n]
}

function normalizeLeet(str) {
  return str.toLowerCase().split('').map(c => LEET[c] || c).join('')
}

function extractParts(domain) {
  const clean = domain.replace(/^www\./, '').toLowerCase()
  const parts = clean.split('.')
  const tld   = parts.length >= 2 ? '.' + parts.slice(-1)[0] : ''
  const sld   = parts.length >= 2 ? parts[parts.length - 2] : parts[0]
  const tokens = sld.split('-').filter(Boolean)
  return { clean, sld, tld, tokens }
}

function scanUrl(rawUrl) {
  const reasons = []
  let score = 0

  let url = rawUrl.trim()
  if (!url) return { isPhishing: false, riskScore: 0, reasons: [] }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  let hostname, pathname
  try {
    const parsed = new URL(url)
    hostname = parsed.hostname.toLowerCase()
    pathname = parsed.pathname + parsed.search
  } catch {
    return { isPhishing: true, riskScore: 95, reasons: ['Invalid URL format'] }
  }

  const { sld, tld, tokens } = extractParts(hostname)

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    score += 40; reasons.push('IP address used instead of domain name')
  }
  if (!rawUrl.startsWith('https://')) {
    score += 20; reasons.push('Not using HTTPS (insecure connection)')
  }
  if (rawUrl.includes('@')) {
    score += 50; reasons.push('@ symbol in URL (credential stuffing trick)')
  }
  if (SUSPICIOUS_TLDS.some(t => hostname.endsWith(t))) {
    score += 30; reasons.push(`Suspicious top-level domain (${tld})`)
  }

  const subCount = hostname.split('.').length - 2
  if (subCount >= 3) {
    score += 20; reasons.push(`Excessive subdomains (${subCount} levels)`)
  }

  const hyphenCount = sld.split('-').length - 1
  if (hyphenCount >= 2) {
    score += 15; reasons.push(`Multiple hyphens in domain (${hyphenCount})`)
  }

  if (rawUrl.length > 100) {
    score += 10; reasons.push('Unusually long URL')
  }

  const lowerFull = (hostname + pathname).toLowerCase()
  const foundKeywords = PHISHING_KEYWORDS.filter(k => lowerFull.includes(k))
  if (foundKeywords.length > 0) {
    score += Math.min(foundKeywords.length * 12, 36)
    reasons.push(`Phishing keywords detected: ${foundKeywords.slice(0, 3).join(', ')}`)
  }

  const normSld = normalizeLeet(sld)
  const normTokens = tokens.map(normalizeLeet)
  let brandHit = false

  for (const brand of PROTECTED_BRANDS) {
    if (normTokens.includes(brand) && normSld !== brand) {
      score += 55; reasons.push(`Brand "${brand}" used in suspicious context`)
      brandHit = true; break
    }
    const dist = levenshtein(normSld, brand)
    if (dist === 1 && normSld.length >= brand.length - 1) {
      score += 50; reasons.push(`Domain "${sld}" looks like "${brand}" (typosquat)`)
      brandHit = true; break
    }
    if (dist === 2 && normSld.length >= brand.length - 1) {
      score += 35; reasons.push(`Domain "${sld}" resembles "${brand}"`)
      brandHit = true; break
    }
  }

  if (!brandHit) {
    const isGovTld = LEGITIMATE_TLDS.some(t => hostname.endsWith(t))
    const hasBankKw = ['bank','netbanking','login','secure','verify','kyc']
      .some(k => sld.includes(k) || pathname.includes(k))
    if (!isGovTld && hasBankKw && SUSPICIOUS_TLDS.some(t => hostname.endsWith(t))) {
      score += 40; reasons.push('Banking/government keywords on suspicious domain')
    }
  }

  const riskScore = Math.min(score, 100)
  return {
    isPhishing: riskScore >= 35,
    riskScore,
    risk: riskScore >= 70 ? 'High' : riskScore >= 35 ? 'Medium' : 'Low',
    reasons,
  }
}

// ─── UI Overlay ──────────────────────────────────────────────────────────────

let overlay = null

function removeOverlay() {
  if (overlay) { overlay.remove(); overlay = null }
}

function showWarning(url, result, target) {
  removeOverlay()

  const { riskScore, risk, reasons } = result
  const reasonsHtml = (reasons.length ? reasons : ['Suspicious domain pattern detected'])
    .map(r => `
      <div style="display:flex;align-items:flex-start;gap:9px;padding:8px 0;border-bottom:1px solid #FEE2E2">
        <div style="width:7px;height:7px;min-width:7px;border-radius:50%;background:#EF4444;margin-top:5px"></div>
        <span style="font-size:13px;color:#374151;line-height:1.45">${r}</span>
      </div>`).join('')

  overlay = document.createElement('div')
  overlay.id = '__linkguard_overlay__'
  overlay.style.cssText = [
    'position:fixed','inset:0','z-index:2147483647',
    'background:rgba(0,0,0,0.7)',
    'display:flex','align-items:center','justify-content:center',
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    'padding:16px','box-sizing:border-box'
  ].join(';')

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;width:100%;max-width:430px;overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,0.5)">
      <div style="background:linear-gradient(135deg,#EF4444,#DC2626);padding:28px 24px 22px;text-align:center">
        <div style="width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
          <svg width="30" height="30" fill="none" stroke="white" stroke-width="2.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>
        <h2 style="color:#fff;font-size:19px;font-weight:700;margin:0 0 6px">⚠️ Phishing Link Detected!</h2>
        <p style="color:rgba(255,255,255,0.88);font-size:13px;margin:0">LinkGuard blocked this link for your safety</p>
      </div>

      <div style="padding:20px 22px 22px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
          <span style="font-size:11px;font-weight:700;background:#FEE2E2;color:#DC2626;padding:4px 11px;border-radius:20px">
            ${risk} Risk · ${riskScore}%
          </span>
          <span style="font-size:11px;color:#9CA3AF">🛡️ LinkGuard</span>
        </div>

        <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:10px 14px;margin-bottom:14px">
          <p style="font-size:10px;color:#F87171;margin:0 0 3px;font-weight:700;text-transform:uppercase;letter-spacing:.05em">Blocked URL</p>
          <p style="font-size:12px;color:#991B1B;margin:0;word-break:break-all;font-family:monospace">${url}</p>
        </div>

        <div style="margin-bottom:18px">${reasonsHtml}</div>

        <button id="__lg_back__" style="width:100%;background:#4F46E5;color:#fff;border:none;border-radius:12px;padding:14px;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:8px">
          ← Go Back — Stay Safe
        </button>
        <button id="__lg_proceed__" style="width:100%;background:transparent;color:#9CA3AF;border:1px solid #E5E7EB;border-radius:12px;padding:10px;font-size:12px;cursor:pointer">
          Proceed anyway (not recommended)
        </button>
      </div>
    </div>`

  document.body.appendChild(overlay)

  const backBtn    = document.getElementById('__lg_back__')
  const proceedBtn = document.getElementById('__lg_proceed__')

  backBtn.onmouseenter = () => backBtn.style.background = '#4338CA'
  backBtn.onmouseleave = () => backBtn.style.background = '#4F46E5'
  backBtn.onclick = removeOverlay

  proceedBtn.onclick = () => {
    removeOverlay()
    if (target === '_blank') window.open(url, '_blank', 'noopener')
    else window.location.href = url
  }

  overlay.addEventListener('click', e => { if (e.target === overlay) removeOverlay() })
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { removeOverlay(); document.removeEventListener('keydown', esc) }
  })
}

// ─── Intercept every link click ──────────────────────────────────────────────

document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href]')
  if (!anchor) return

  const url    = anchor.href
  const target = anchor.target || '_self'

  if (!url.startsWith('http'))                       return
  if (url.startsWith(window.location.origin + '/')) return
  if (url.startsWith(window.location.origin + '#')) return
  if (url.startsWith('chrome-extension://'))         return

  const result = scanUrl(url)

  if (result.isPhishing) {
    e.preventDefault()
    e.stopImmediatePropagation()
    showWarning(url, result, target)
  }
  // Safe links pass through normally — no delay, no UX friction
}, true)
