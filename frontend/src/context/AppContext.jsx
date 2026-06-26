import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getTrustedDomains, addTrustedDomain } from '../api/index.js'

const AppContext = createContext(null)

/* ── Toast ── */
function Toast({ message }) {
  return (
    <div style={{
      background: '#1F2937', color: '#fff', padding: '10px 20px',
      borderRadius: 8, fontSize: 13, whiteSpace: 'nowrap',
      animation: 'slideUp 0.2s ease', boxShadow: '0 4px 16px rgba(0,0,0,0.18)'
    }}>
      {message}
    </div>
  )
}

/* ── Link confirmation modal (desktop: centred card | mobile: bottom sheet) ── */
function LinkConfirmModal({ link, onClose, isMobile }) {
  const { user, trustedDomains, setTrustedDomains } = useContext(AppContext)
  const [alwaysAllow, setAlwaysAllow] = useState(false)
  const isSafe = link.trust === 'safe'
  const addedByName = link.user
    ? `${link.user.first_name} ${link.user.last_name || ''}`.trim()
    : 'Unknown'

  const handleConfirm = async () => {
    if (alwaysAllow && user) {
      try {
        await addTrustedDomain({ domain: link.domain, user_id: user.id })
        setTrustedDomains(prev => [...prev, link.domain])
      } catch (_) {}
    }
    window.open(link.url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  const sheetStyle = isMobile
    ? { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '20px 20px 0 0', padding: '16px 20px 36px', animation: 'slideUpModal 220ms ease' }
    : { background: '#fff', width: '100%', maxWidth: 400, margin: '0 16px', borderRadius: 16, padding: '28px 24px', animation: 'modalIn 180ms ease' }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.38)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div style={sheetStyle} onClick={e => e.stopPropagation()}>
        {/* Drag handle */}
        {isMobile && <div style={{ width: 40, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '0 auto 18px' }} />}

        {/* Icon */}
        <div style={{ width: 40, height: 40, borderRadius: 12, background: isSafe ? '#EFF6FF' : '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          {isSafe ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          )}
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 3 }}>
          {isSafe ? "You're leaving this page" : 'Heads up before you continue'}
        </h2>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>Saved by {addedByName}</p>

        {/* URL box */}
        <div style={{ background: '#F9FAFB', border: '0.5px solid #E5E7EB', borderRadius: 8, padding: '9px 12px', marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#374151', wordBreak: 'break-all' }}>{link.url}</p>
        </div>

        {/* Always allow */}
        {user && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={alwaysAllow} onChange={e => setAlwaysAllow(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#4F46E5', cursor: 'pointer', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>Always allow this domain without asking</span>
          </label>
        )}

        <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 18, lineHeight: 1.5 }}>
          {isSafe ? 'This domain is marked as trusted. You can proceed safely.' : "This link hasn't been verified. Only open if you trust the source."}
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', border: '0.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#6B7280', background: '#fff', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleConfirm} style={{ flex: 2, padding: '11px 0', border: 'none', borderRadius: 8, fontSize: 13, color: '#fff', fontWeight: 500, cursor: 'pointer', background: isSafe ? '#2563EB' : '#D97706' }}>
            Open link
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Provider ── */
export function AppProvider({ children }) {
  const [user, setUser]                   = useState(null)
  const [trustedDomains, setTrustedDomains] = useState([])
  const [toasts, setToasts]               = useState([])
  const [modalLink, setModalLink]         = useState(null)
  const [isMobile, setIsMobile]           = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    if (user) {
      getTrustedDomains(user.id).then(rows => setTrustedDomains(rows.map(r => r.domain)))
    } else {
      setTrustedDomains([])
    }
  }, [user])

  const addToast = useCallback((message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800)
  }, [])

  const openLinkModal = useCallback((link) => {
    if (trustedDomains.includes(link.domain)) {
      window.open(link.url, '_blank', 'noopener,noreferrer')
      return
    }
    setModalLink(link)
  }, [trustedDomains])

  return (
    <AppContext.Provider value={{ user, setUser, trustedDomains, setTrustedDomains, addToast, openLinkModal, isMobile }}>
      {children}

      {modalLink && (
        <LinkConfirmModal link={modalLink} onClose={() => setModalLink(null)} isMobile={isMobile} />
      )}

      <div style={{ position: 'fixed', bottom: isMobile ? 76 : 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', pointerEvents: 'none' }}>
        {toasts.map(t => <Toast key={t.id} message={t.message} />)}
      </div>
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
