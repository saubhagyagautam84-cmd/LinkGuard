const express = require('express')
const router  = express.Router()

// ─── Threat intelligence lists ─────────────────────────────────────────────
const SUSPICIOUS_TLDS = [
  '.xyz', '.win', '.tk', '.ml', '.top', '.club', '.online', '.ru', '.cn',
  '.pw', '.gq', '.cf', '.ga', '.icu', '.buzz', '.live', '.uno', '.vip',
  '.rest', '.loan', '.work', '.click', '.link', '.download', '.stream',
  '.review', '.accountant', '.date', '.faith', '.racing', '.trade', '.zip',
  '.mov', '.party', '.gdn', '.bid', '.trade', '.webcam', '.science'
]

const SAFE_TLDS = ['.com', '.org', '.net', '.edu', '.gov', '.io', '.co.in', '.ac.in']

// Brand names to protect — stored as { brand, official }
const PROTECTED_BRANDS = [
  { brand: 'paypal',      official: 'paypal.com'         },
  { brand: 'google',      official: 'google.com'         },
  { brand: 'facebook',    official: 'facebook.com'       },
  { brand: 'amazon',      official: 'amazon.com'         },
  { brand: 'microsoft',   official: 'microsoft.com'      },
  { brand: 'apple',       official: 'apple.com'          },
  { brand: 'netflix',     official: 'netflix.com'        },
  { brand: 'instagram',   official: 'instagram.com'      },
  { brand: 'twitter',     official: 'twitter.com'        },
  { brand: 'whatsapp',    official: 'whatsapp.com'       },
  { brand: 'sbi',         official: 'onlinesbi.sbi'      },
  { brand: 'hdfc',        official: 'hdfcbank.com'       },
  { brand: 'icici',       official: 'icicibank.com'      },
  { brand: 'irctc',       official: 'irctc.co.in'        },
  { brand: 'incometax',   official: 'incometax.gov.in'   },
  { brand: 'uidai',       official: 'uidai.gov.in'       },
  { brand: 'aadhar',      official: 'uidai.gov.in'       },
  { brand: 'paytm',       official: 'paytm.com'          },
  { brand: 'phonepe',     official: 'phonepe.com'        },
  { brand: 'gpay',        official: 'pay.google.com'     },
  { brand: 'flipkart',    official: 'flipkart.com'       },
  { brand: 'linkedin',    official: 'linkedin.com'       },
  { brand: 'youtube',     official: 'youtube.com'        },
  { brand: 'github',      official: 'github.com'         },
  { brand: 'dropbox',     official: 'dropbox.com'        },
]

const PHISHING_KEYWORDS = [
  'free', 'reward', 'win', 'prize', 'lucky', 'claim', 'urgent', 'verify',
  'update', 'secure', 'login', 'password', 'account', 'bank', 'suspend',
  'confirm', 'limited', 'expire', 'kyc', 'otp', 'refund', 'cashback',
  'offer', 'gift', 'bonus', 'congratulations', 'winner', 'selected',
  'alert', 'notice', 'warning', 'blocked', 'locked', 'reactivate'
]

// Number/symbol substitutions used in typosquatting: paypa1 → paypal
const LEET_MAP = { '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '@': 'a', '$': 's' }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function levenshtein(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 99 // fast exit
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[a.length][b.length]
}

function normalizeLeet(str) {
  return str.split('').map(c => LEET_MAP[c] || c).join('')
}

function extractParts(domain) {
  // Remove www.
  const clean = domain.replace(/^www\./, '').toLowerCase()
  // Get the SLD (e.g. "paypa1-secure" from "paypa1-secure.xyz")
  const parts  = clean.split('.')
  const sld    = parts.slice(0, -1).join('.') // everything before last dot
  const tld    = '.' + parts[parts.length - 1]
  // Split SLD on hyphens to get tokens (e.g. ["paypa1", "secure"])
  const tokens = sld.split(/[-_]/)
  return { clean, sld, tld, tokens }
}

function isIPAddress(domain) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(domain)
}

// ─── Main scanner ──────────────────────────────────────────────────────────────
function scanUrl(rawUrl) {
  const reasons = []
  let   score   = 0

  // Parse URL
  let parsedUrl, domain
  try {
    const full = rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl
    parsedUrl  = new URL(full)
    domain     = parsedUrl.hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return { isPhishing: true, risk: 'High', riskScore: 85, reasons: ['Invalid or malformed URL'] }
  }

  const { clean, sld, tld, tokens } = extractParts(domain)

  // ── 1. IP address URL ──
  if (isIPAddress(domain)) {
    reasons.push('Uses an IP address instead of a domain name')
    score += 60
  }

  // ── 2. No HTTPS ──
  if (rawUrl.startsWith('http://')) {
    reasons.push('No HTTPS — connection is not encrypted')
    score += 20
  }

  // ── 3. Suspicious TLD ──
  const hasSuspiciousTLD = SUSPICIOUS_TLDS.some(t => domain.endsWith(t))
  if (hasSuspiciousTLD) {
    reasons.push(`Suspicious domain extension (${tld})`)
    score += 30
  }

  // ── 4. @ symbol in URL (phishing trick) ──
  if (rawUrl.includes('@')) {
    reasons.push('URL contains @ symbol — browser ignores everything before it')
    score += 50
  }

  // ── 5. Excessive subdomains ──
  const subdomainCount = domain.split('.').length - 2
  if (subdomainCount >= 3) {
    reasons.push(`Unusually many subdomains (${subdomainCount})`)
    score += 20
  }

  // ── 6. Very long URL ──
  if (rawUrl.length > 100) {
    reasons.push('Unusually long URL')
    score += 10
  }

  // ── 7. Many hyphens in domain ──
  const hyphenCount = (sld.match(/-/g) || []).length
  if (hyphenCount >= 2) {
    reasons.push('Multiple hyphens in domain — common in phishing URLs')
    score += 15
  }

  // ── 8. Phishing keywords in domain ──
  const kwHits = PHISHING_KEYWORDS.filter(kw => sld.includes(kw))
  if (kwHits.length > 0) {
    reasons.push(`Suspicious keywords in domain: ${kwHits.slice(0, 3).join(', ')}`)
    score += Math.min(kwHits.length * 12, 35)
  }

  // ── 9. Brand lookalike detection (core improvement) ──
  // Compares each token of the domain against known brand names
  // Also applies leet-speak normalization (paypa1 → paypal)
  for (const { brand, official } of PROTECTED_BRANDS) {
    // Check if this IS the official domain — skip if so
    if (domain === official || domain.endsWith('.' + official)) continue

    for (const token of tokens) {
      const normalToken = normalizeLeet(token)

      // Exact brand name present in a suspicious context
      if (normalToken === brand && domain !== official) {
        // Brand name is in domain but not the official site
        if (hasSuspiciousTLD || hyphenCount > 0 || !SAFE_TLDS.some(t => domain.endsWith(t))) {
          reasons.push(`Impersonates ${official} — contains brand name "${brand}"`)
          score += 55
          break
        }
      }

      // Levenshtein typosquatting: 1-2 char difference from brand name
      const dist = levenshtein(normalToken, brand)
      if (dist === 1 && token.length >= 4) {
        reasons.push(`Looks like "${brand}" (typosquatting — 1 character different)`)
        score += 50
        break
      }
      if (dist === 2 && token.length >= 6) {
        reasons.push(`Resembles "${brand}" (possible typosquatting)`)
        score += 35
        break
      }
    }
  }

  // ── 10. Domain registered under govt/bank impersonation pattern ──
  const govBankPatterns = ['sbi', 'hdfc', 'icici', 'uidai', 'irctc', 'incometax', 'npci', 'rbi']
  for (const pat of govBankPatterns) {
    if (sld.includes(pat) && domain !== PROTECTED_BRANDS.find(b => b.brand === pat)?.official) {
      if (hasSuspiciousTLD || hyphenCount > 0) {
        reasons.push(`Contains government/bank name "${pat.toUpperCase()}" in a suspicious domain`)
        score += 40
        break
      }
    }
  }

  score = Math.min(score, 100)

  // Deduplicate reasons
  const uniqueReasons = [...new Set(reasons)]

  const isPhishing = score >= 35
  const risk = score >= 65 ? 'High' : score >= 35 ? 'Medium' : 'Low'

  return { isPhishing, risk, riskScore: score, reasons: uniqueReasons }
}

// POST /api/check-url  { url }
router.post('/', (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'URL required' })

  let domain = ''
  try {
    const full = url.startsWith('http') ? url : 'https://' + url
    domain = new URL(full).hostname.replace(/^www\./, '').toLowerCase()
  } catch { domain = url }

  const result = scanUrl(url)
  res.json({ url, domain, ...result })
})

module.exports = router
