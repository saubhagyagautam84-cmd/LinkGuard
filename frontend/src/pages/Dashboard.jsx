import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getLinks } from '../api/index.js'
import { useApp } from '../context/AppContext.jsx'
import AddLinkModal from '../components/AddLinkModal.jsx'
import AIExplanation from '../components/AIExplanation.jsx'
import CategoryTag from '../components/CategoryTag.jsx'
import PatternWarning from '../components/PatternWarning.jsx'
import DarkModeToggle from '../components/DarkModeToggle.jsx'
import ThreatFeed from '../components/ThreatFeed.jsx'
import BulkActions from '../components/BulkActions.jsx'
import InstallPWA from '../components/InstallPWA.jsx'
import { useNav } from '../context/NavContext.jsx'
import { scanUrl } from '../utils/scanner.js'
import { usePatternLearning } from '../hooks/usePatternLearning.js'
import { useCategoryTag } from '../hooks/useCategoryTag.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(firstName = '', lastName = '') {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?'
}

function getIcon(domain = '', trust = '') {
  const d = domain.toLowerCase()
  if (d.includes('github'))   return '🐙'
  if (d.includes('google'))   return '🔍'
  if (d.includes('youtube'))  return '▶️'
  if (d.includes('twitter') || d.includes('x.com')) return '𝕏'
  if (d.includes('facebook')) return '📘'
  if (d.includes('linkedin')) return '💼'
  if (d.includes('amazon'))   return '📦'
  if (d.includes('microsoft') || d.includes('azure')) return '🪟'
  if (d.includes('apple'))    return '🍎'
  if (d.includes('notion'))   return '📝'
  if (d.includes('figma'))    return '🎨'
  return trust === 'safe' ? '🔒' : '⚠️'
}

function getRisk(domain = '', trust = '') {
  if (trust === 'safe') return { risk: null, riskScore: 0 }
  const tlds = ['.xyz', '.win', '.tk', '.ml', '.ru', '.cn', '.top', '.club', '.online']
  if (tlds.some(t => domain.endsWith(t))) return { risk: 'High', riskScore: Math.floor(Math.random() * 20) + 75 }
  return { risk: 'Medium', riskScore: Math.floor(Math.random() * 30) + 40 }
}

const SAFE_DOMAINS = ['github.com', 'google.com', 'anthropic.com', 'youtube.com', 'linkedin.com', 'microsoft.com']

const statusConfig = {
  trusted:    { badge: 'bg-emerald-50 text-emerald-800 border border-emerald-300', icon: 'bg-emerald-50 text-emerald-700', label: 'Trusted'    },
  unverified: { badge: 'bg-orange-50  text-orange-800  border border-orange-300',  icon: 'bg-orange-50  text-orange-700',  label: 'Unverified' },
}
const riskColor = {
  High:   'text-red-500 bg-red-50',
  Medium: 'text-orange-500 bg-orange-50',
  Low:    'text-emerald-600 bg-emerald-50',
}
const trustRing = {
  safe:   'ring-2 ring-emerald-400',
  unsafe: 'ring-2 ring-orange-400',
  mixed:  'ring-2 ring-purple-400',
}

// ─── Phishing Alert ────────────────────────────────────────────────────────────
function PhishingAlert({ url, reasons, onClose, onProceed }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-xl">
        <div className="bg-red-500 px-5 pt-6 pb-5 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <h2 className="text-white text-lg font-semibold">Phishing Link Detected!</h2>
          <p className="text-red-100 text-xs mt-1 text-center">This link may steal your personal data</p>
        </div>
        <div className="px-5 py-4">
          <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">
            <p className="text-[10px] text-red-400 mb-0.5">Suspicious URL</p>
            <p className="text-xs text-red-700 font-medium break-all">{url}</p>
          </div>
          <div className="flex flex-col gap-2 mb-2">
            {(reasons?.length ? reasons : ['Not found in official link database', 'Domain registered recently', 'Suspicious keywords detected']).map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </span>
                <p className="text-xs text-gray-600">{r}</p>
              </div>
            ))}
          </div>
          {/* AI Explanation — Groq powered */}
          <AIExplanation url={url} reasons={reasons || ['Suspicious domain', 'Flagged by scanner']} />
          <button onClick={onClose} className="w-full bg-red-500 text-white text-sm font-medium py-3 rounded-xl mt-3 hover:bg-red-600 transition-colors">
            Go back to safety
          </button>
          <button onClick={onProceed} className="w-full text-gray-400 text-xs py-2 hover:text-gray-600 transition-colors">
            Proceed anyway (not recommended)
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Scan Modal ────────────────────────────────────────────────────────────────
function ScanModal({ onClose, onScan, initialUrl = '' }) {
  const [url,     setUrl]     = useState(initialUrl)
  const [loading, setLoading] = useState(false)
  const [scanRes, setScanRes] = useState(null)

  const handleScan = async () => {
    if (!url.trim()) return
    setLoading(true)
    try {
      const base = import.meta.env.DEV ? '' : 'http://localhost:3001'
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000)
      const res = await fetch(`${base}/api/check-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
        signal: controller.signal,
      })
      clearTimeout(timer)
      const data = await res.json()
      setScanRes(data)
      onScan(url.trim(), data)
    } catch {
      // Backend unreachable — use self-contained JS scanner
      const data = scanUrl(url.trim())
      setScanRes(data)
      onScan(url.trim(), data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-t-3xl w-full max-w-sm px-5 pt-5 pb-8">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>
        <h2 className="text-base font-medium text-gray-800 mb-1">Scan a URL</h2>
        <p className="text-xs text-gray-400 mb-4">Paste any link to check if it is safe</p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-purple-400"
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="bg-purple-600 text-white text-sm px-4 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '…' : 'Scan'}
          </button>
        </div>

        {scanRes && !loading && (
          <div className={`rounded-xl px-3 py-2 mb-3 ${scanRes.isPhishing ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
            <p className={`text-xs font-medium ${scanRes.isPhishing ? 'text-red-700' : 'text-emerald-700'}`}>
              {scanRes.isPhishing ? `⚠️ Suspicious — Risk: ${scanRes.risk} (${scanRes.riskScore}%)` : '✅ Looks safe'}
            </p>
            {scanRes.reasons?.length > 0 && (
              <p className="text-[10px] text-red-500 mt-1">{scanRes.reasons.join(' · ')}</p>
            )}
          </div>
        )}

        <button onClick={onClose} className="w-full text-center text-xs text-gray-400 hover:text-gray-600">
          Close
        </button>
      </div>
    </div>
  )
}

// ─── Swipeable Card ────────────────────────────────────────────────────────────
function SwipeCard({ link, onDelete, onMarkSafe, onOpenAlert }) {
  const [swipeX,  setSwipeX]  = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef(null)
  const cfg = statusConfig[link.status]

  const handleTouchStart = e => { startX.current = e.touches[0].clientX; setSwiping(true) }
  const handleTouchMove  = e => {
    if (startX.current === null) return
    setSwipeX(Math.max(-100, Math.min(0, e.touches[0].clientX - startX.current)))
  }
  const handleTouchEnd   = () => { setSwipeX(swipeX < -60 ? -100 : 0); setSwiping(false); startX.current = null }
  const handleMouseDown  = e => {
    startX.current = e.clientX; setSwiping(true)
    const onMove = ev => setSwipeX(Math.max(-100, Math.min(0, ev.clientX - startX.current)))
    const onUp   = () => {
      setSwipeX(prev => prev < -60 ? -100 : 0)
      setSwiping(false); startX.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div className="relative rounded-2xl overflow-hidden mb-2">
      <div className="absolute inset-y-0 right-0 flex">
        {link.status === 'unverified' && (
          <button onClick={() => onMarkSafe(link.id)} className="bg-emerald-500 text-white text-[10px] font-medium w-14 flex flex-col items-center justify-center gap-1 hover:bg-emerald-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            Safe
          </button>
        )}
        <button onClick={() => onDelete(link.id)} className="bg-red-500 text-white text-[10px] font-medium w-14 flex flex-col items-center justify-center gap-1 hover:bg-red-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          Delete
        </button>
      </div>
      <div
        className="bg-white border border-gray-100 rounded-2xl px-3 py-3 flex items-center gap-3 cursor-grab active:cursor-grabbing select-none"
        style={{ transform: `translateX(${swipeX}px)`, transition: swiping ? 'none' : 'transform 0.2s ease' }}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onMouseDown={handleMouseDown}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${cfg.icon}`}>
          {link.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-gray-800 truncate">{link.name}</p>
          <p className="text-[11px] text-gray-400 truncate">{link.domain || link.url}</p>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {link.risk && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${riskColor[link.risk]}`}>
                Risk: {link.risk} · {link.riskScore}%
              </span>
            )}
            <CategoryTag category={link.category}/>
          </div>
          <p className="text-[10px] text-gray-300 mt-0.5">{link.userName}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${cfg.badge}`}>{cfg.label}</span>
          {link.status === 'unverified' && (
            <button onClick={e => { e.stopPropagation(); onOpenAlert(link) }} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">
              View threat →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Bottom Nav ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Home',    path: '/dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { label: 'History', path: '/history',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg> },
  { label: 'Chart',   path: '/risk-chart',icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
  { label: 'Profile', path: '/about',     icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: 'Heatmap', path: '/heatmap',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="3" y="3" width="4" height="4" rx="0.5"/><rect x="10" y="3" width="4" height="4" rx="0.5" opacity=".6"/><rect x="17" y="3" width="4" height="4" rx="0.5" opacity=".3"/><rect x="3" y="10" width="4" height="4" rx="0.5" opacity=".4"/><rect x="10" y="10" width="4" height="4" rx="0.5"/><rect x="17" y="10" width="4" height="4" rx="0.5" opacity=".7"/><rect x="3" y="17" width="4" height="4" rx="0.5" opacity=".8"/><rect x="10" y="17" width="4" height="4" rx="0.5" opacity=".5"/><rect x="17" y="17" width="4" height="4" rx="0.5" opacity=".2"/></svg> },
]

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useApp()

  const [linkList, setLinkList] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showAdd,  setShowAdd]  = useState(false)
  const [showScan, setShowScan] = useState(false)
  const [alertLink, setAlertLink] = useState(null)  // { url, reasons }
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [sharedUrl, setSharedUrl] = useState('')

  const { openNav } = useNav()
  const { anomaly, checkAndLearn, clearAnomaly } = usePatternLearning()
  const { classify } = useCategoryTag()

  // Detect URL shared to this PWA via Web Share Target API
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shared = params.get('url') || params.get('text') || params.get('title') || ''
    if (shared) {
      setSharedUrl(shared)
      setShowScan(true)
      // Clean the URL so params don't persist on back
      window.history.replaceState({}, '', window.location.pathname + window.location.hash)
    }
  }, [])

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    try {
      const all = await getLinks()
      const mapped = (Array.isArray(all) ? all : []).map(link => {
        const { risk, riskScore } = getRisk(link.domain, link.trust)
        return {
          ...link,
          name:     link.label,
          status:   link.trust === 'safe' ? 'trusted' : 'unverified',
          icon:     getIcon(link.domain, link.trust),
          initials: getInitials(link.user?.first_name, link.user?.last_name),
          userName: `${link.user?.first_name || ''} ${link.user?.last_name || ''}`.trim() || 'Unknown',
          risk, riskScore,
          category: null,
        }
      })
      setLinkList(mapped)
    } catch (_) {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchLinks() }, [fetchLinks])

  const trustedCount   = linkList.filter(l => l.status === 'trusted').length
  const unverifiedCount= linkList.filter(l => l.status === 'unverified').length
  const avatarRing     = unverifiedCount === 0 ? trustRing.safe : trustedCount === 0 ? trustRing.unsafe : trustRing.mixed
  const userInitials   = user ? getInitials(user.first_name, user.last_name) : '?'

  const filtered = linkList.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || (l.domain || l.url).toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || l.status === filter
    return matchSearch && matchFilter
  })

  const handleDelete      = id  => setLinkList(prev => prev.filter(l => l.id !== id))
  const handleDeleteMany  = ids => setLinkList(prev => prev.filter(l => !ids.includes(l.id)))
  const handleMarkSafe    = id  => setLinkList(prev => prev.map(l => l.id === id ? { ...l, status: 'trusted', risk: null, riskScore: 0 } : l))
  const handleMarkSafeMany= ids => setLinkList(prev => prev.map(l => ids.includes(l.id) ? { ...l, status: 'trusted', risk: null, riskScore: 0 } : l))

  const handleScan = async (url, scanResult) => {
    if (scanResult?.isPhishing) {
      setAlertLink({ url, reasons: scanResult.reasons })
    } else {
      const category = await classify(url).catch(() => 'Other')
      await checkAndLearn(url, category)
      setLinkList(prev => [{
        id: Date.now(), name: url, url, domain: url,
        userName: user ? `${user.first_name} ${user.last_name}`.trim() : 'You',
        status: 'trusted', icon: '✅', risk: null, riskScore: 0, category,
      }, ...prev])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-6 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative">

        {/* Header */}
        <div className="px-4 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {/* Left: ⋮ menu button + title */}
            <div className="flex items-center gap-3">
              <button
                onClick={openNav}
                className="w-9 h-9 rounded-xl bg-gray-100 flex flex-col items-center justify-center gap-[3px] hover:bg-gray-200 active:scale-95 transition-all flex-shrink-0"
                aria-label="Open menu"
              >
                <span className="w-[4px] h-[4px] rounded-full bg-gray-600 block"/>
                <span className="w-[4px] h-[4px] rounded-full bg-gray-600 block"/>
                <span className="w-[4px] h-[4px] rounded-full bg-gray-600 block"/>
              </button>
              <div>
                <h1 className="text-[15px] font-semibold text-gray-900 leading-none">Dashboard</h1>
                <p className="text-[11px] text-gray-400 mt-0.5">Manage and review all saved links</p>
              </div>
            </div>
            {/* Right: dark mode + add + avatar */}
            <div className="flex items-center gap-2">
              <DarkModeToggle/>
              {user && (
                <button onClick={() => setShowAdd(true)} className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white" title="Add link">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              )}
              <div className={`w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700 ${avatarRing}`} title={unverifiedCount === 0 ? 'All links trusted' : trustedCount === 0 ? 'All links unverified' : 'Mixed trust level'}>
                {userInitials}
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-2 px-4 pt-4 pb-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xl font-medium text-gray-800">{linkList.length}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Total links</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="text-xl font-medium text-emerald-700">{trustedCount}</p>
            <p className="text-[10px] text-emerald-500 mt-0.5">Trusted</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-xl font-medium text-orange-700">{unverifiedCount}</p>
            <p className="text-[10px] text-orange-400 mt-0.5">Unverified</p>
          </div>
        </div>

        {/* Live Threat Feed */}
        <ThreatFeed/>

        {/* Alert Banner */}
        {unverifiedCount > 0 && (
          <div className="mx-4 mb-3 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-orange-500 text-sm flex-shrink-0">⚠️</span>
            <p className="text-[11px] text-orange-700">
              {unverifiedCount} unverified {unverifiedCount === 1 ? 'link needs' : 'links need'} your attention
            </p>
          </div>
        )}

        {/* AI Pattern Warning */}
        <PatternWarning message={anomaly} onDismiss={clearAnomaly}/>

        {/* Search Bar */}
        <div className="mx-4 mb-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search links..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-xs text-gray-600 placeholder-gray-400 outline-none w-full"/>
          {search && <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-4 mb-2">
          {['all', 'trusted', 'unverified'].map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} className={`text-[11px] px-3 py-1 rounded-full border transition-all capitalize ${filter === tab ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Swipe hint */}
        <p className="text-[10px] text-gray-300 text-center mb-2">← Swipe left on a card to delete or mark safe</p>

        {/* Section Header */}
        <div className="flex items-center justify-between px-4 mb-2">
          <p className="text-[13px] font-medium text-gray-700">Recent links</p>
          <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
            {filtered.length} {filtered.length === 1 ? 'link' : 'links'}
          </span>
        </div>

        {/* Link Cards with BulkActions */}
        <div className="px-4 pb-24 flex flex-col">
          {loading ? (
            <div className="text-center py-8 text-xs text-gray-400">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">{search ? 'No links match your search' : 'No links found'}</div>
          ) : (
            <BulkActions
              links={filtered}
              onDeleteMany={handleDeleteMany}
              onMarkSafeMany={handleMarkSafeMany}
              renderCard={link => (
                <SwipeCard
                  key={link.id}
                  link={link}
                  onDelete={handleDelete}
                  onMarkSafe={handleMarkSafe}
                  onOpenAlert={setAlertLink}
                />
              )}
            />
          )}
        </div>

        {/* FAB — Scan URL */}
        <button
          onClick={() => setShowScan(true)}
          className="fixed bottom-20 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 active:scale-95 transition-all z-40"
          aria-label="Scan a URL"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/>
          </svg>
        </button>

        {/* Bottom Nav — pb accounts for iOS home indicator via safe-area env */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm border-t border-gray-100 flex bg-white px-2 pt-3 bottom-nav z-30" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path
            return (
              <button key={item.label} onClick={() => navigate(item.path)} className={`flex-1 flex flex-col items-center gap-1 text-[10px] transition-colors ${isActive ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
                {item.icon}
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Modals */}
        {showAdd  && <AddLinkModal onClose={() => setShowAdd(false)} onSaved={fetchLinks}/>}
        {showScan && <ScanModal onClose={() => { setShowScan(false); setSharedUrl('') }} onScan={handleScan} initialUrl={sharedUrl}/>}
        {alertLink && (
          <PhishingAlert
            url={alertLink.url || alertLink}
            reasons={alertLink.reasons}
            onClose={() => setAlertLink(null)}
            onProceed={() => { window.open(alertLink.url || alertLink, '_blank'); setAlertLink(null) }}
          />
        )}

        {/* PWA install prompt */}
        <InstallPWA />
      </div>
    </div>
  )
}
