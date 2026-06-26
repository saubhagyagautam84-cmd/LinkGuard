// Self-contained phishing URL scanner — runs entirely in the browser/WebView.
// No backend required. Logic mirrors backend/src/routes/checkUrl.js

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
  'gov.in','nic.in','gov','mil','edu','ac.in','org.in',
  'co.in','net.in','bank'
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

export function scanUrl(rawUrl) {
  const reasons   = []
  let   score     = 0

  let url = rawUrl.trim()
  if (!url) return { isPhishing: false, riskScore: 0, reasons: [] }

  // Normalise URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  let hostname, pathname, fullUrl
  try {
    const parsed = new URL(url)
    hostname = parsed.hostname.toLowerCase()
    pathname = parsed.pathname + parsed.search
    fullUrl  = parsed.href
  } catch {
    return { isPhishing: true, riskScore: 95, reasons: ['Invalid URL format'] }
  }

  const { clean: domain, sld, tld, tokens } = extractParts(hostname)

  // ── 1. IP address instead of domain ────────────────────────────────────────
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    score += 40; reasons.push('IP address used instead of domain name')
  }

  // ── 2. No HTTPS ─────────────────────────────────────────────────────────────
  if (!rawUrl.startsWith('https://') && !rawUrl.startsWith('//')) {
    score += 20; reasons.push('Not using HTTPS (insecure connection)')
  }

  // ── 3. @ symbol in URL ──────────────────────────────────────────────────────
  if (rawUrl.includes('@')) {
    score += 50; reasons.push('@ symbol in URL (credential stuffing trick)')
  }

  // ── 4. Suspicious TLD ───────────────────────────────────────────────────────
  if (SUSPICIOUS_TLDS.some(t => hostname.endsWith(t))) {
    score += 30; reasons.push(`Suspicious top-level domain (${tld})`)
  }

  // ── 5. Excessive subdomains ─────────────────────────────────────────────────
  const subCount = hostname.split('.').length - 2
  if (subCount >= 3) {
    score += 20; reasons.push(`Excessive subdomains (${subCount} levels)`)
  }

  // ── 6. Excessive hyphens ────────────────────────────────────────────────────
  const hyphenCount = sld.split('-').length - 1
  if (hyphenCount >= 2) {
    score += 15; reasons.push(`Multiple hyphens in domain (${hyphenCount})`)
  }

  // ── 7. Very long URL ────────────────────────────────────────────────────────
  if (rawUrl.length > 100) {
    score += 10; reasons.push('Unusually long URL')
  }

  // ── 8. Phishing keywords ────────────────────────────────────────────────────
  const lowerFull = (hostname + pathname).toLowerCase()
  const foundKeywords = PHISHING_KEYWORDS.filter(k => lowerFull.includes(k))
  if (foundKeywords.length > 0) {
    const kScore = Math.min(foundKeywords.length * 12, 36)
    score += kScore
    reasons.push(`Phishing keywords detected: ${foundKeywords.slice(0,3).join(', ')}`)
  }

  // ── 9. Brand lookalike (leet-normalised typosquatting) ───────────────────────
  const normSld    = normalizeLeet(sld)
  const normTokens = tokens.map(normalizeLeet)

  let brandHit = false
  for (const brand of PROTECTED_BRANDS) {
    // Exact brand in subdomain / path but not as the SLD itself (e.g. paypal-secure.xyz)
    if (normTokens.includes(brand) && normSld !== brand) {
      score += 55; reasons.push(`Protected brand "${brand}" used in suspicious context`)
      brandHit = true; break
    }

    // Leet-speak distance check
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

  // ── 10. Govt / banking pattern (brand-login.xyz etc.) ───────────────────────
  if (!brandHit) {
    const isGovTld  = LEGITIMATE_TLDS.some(t => hostname.endsWith(t))
    const hasBankKw = ['bank','netbanking','login','secure','verify','kyc'].some(k => sld.includes(k) || pathname.includes(k))
    if (!isGovTld && hasBankKw && SUSPICIOUS_TLDS.some(t => hostname.endsWith(t))) {
      score += 40; reasons.push('Banking/government keywords on suspicious domain')
    }
  }

  const riskScore  = Math.min(score, 100)
  const isPhishing = riskScore >= 35

  return {
    isPhishing,
    riskScore,
    risk: riskScore >= 70 ? 'High' : riskScore >= 35 ? 'Medium' : 'Low',
    reasons,
    url: rawUrl,
  }
}
