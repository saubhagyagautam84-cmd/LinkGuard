import { useState, useCallback } from 'react'
import { useAndroidIntent } from '../hooks/useAndroidIntent.js'
import { useClipboardScan } from '../hooks/useClipboardScan.js'

export default function AndroidIntentGuard() {
  const [alert, setAlert] = useState(null) // { url, result }
  const [safeAlert, setSafeAlert] = useState(null)
  const [source, setSource] = useState('') // 'intent' | 'clipboard'

  const handlePhishing = useCallback((url, result, src = 'intent') => {
    setSource(src)
    setAlert({ url, result })
    if (navigator.vibrate) navigator.vibrate([200, 100, 200])
  }, [])

  const handleSafe = useCallback((url, result, src = 'intent') => {
    setSource(src)
    setSafeAlert({ url, result })
    if (src === 'intent') {
      setTimeout(() => {
        setSafeAlert(null)
        window.open(url, '_system')
      }, 1500)
    } else {
      setTimeout(() => setSafeAlert(null), 3000)
    }
  }, [])

  useAndroidIntent(handlePhishing, handleSafe)
  useClipboardScan(
    (url, result) => handlePhishing(url, result, 'clipboard'),
    (url, result) => handleSafe(url, result, 'clipboard')
  )

  const proceed = () => {
    const url = alert?.url
    setAlert(null)
    if (url) window.open(url, '_system')
  }

  const dismiss = () => setAlert(null)

  if (!alert && !safeAlert) return null

  // Safe green toast
  if (safeAlert && !alert) {
    return (
      <div style={{
        position: 'fixed', bottom: 32, left: 16, right: 16, zIndex: 9999,
        background: '#065F46', borderRadius: 16, padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.3s ease'
      }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Link is Safe {source === 'clipboard' ? '(from clipboard)' : ''}</p>
          <p style={{ color: '#6EE7B7', fontSize: 11, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{safeAlert.url}</p>
        </div>
      </div>
    )
  }

  // Phishing full-screen warning
  const { url, result } = alert
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#fff', display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Red danger top section */}
      <div style={{
        background: 'linear-gradient(160deg, #DC2626, #991B1B)',
        padding: '60px 24px 32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="36" height="36" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>
          Phishing Link Detected!
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, textAlign: 'center', lineHeight: 1.5 }}>
          {source === 'clipboard'
            ? 'A dangerous link was found in your clipboard (copied from WhatsApp or another app).'
            : 'LinkGuard blocked this link. It may steal your passwords or personal data.'}
        </p>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>

        {/* URL box */}
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
          <p style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dangerous URL</p>
          <p style={{ fontSize: 12, color: '#991B1B', wordBreak: 'break-all', fontFamily: 'monospace' }}>{url}</p>
        </div>

        {/* Risk score bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <p style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Risk score</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>{result.riskScore}%</p>
          </div>
          <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${result.riskScore}%`, height: '100%', background: 'linear-gradient(90deg,#EF4444,#DC2626)', borderRadius: 4, transition: 'width 0.6s ease' }}/>
          </div>
        </div>

        {/* Reasons */}
        <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Why it was blocked
        </p>
        {(result.reasons?.length ? result.reasons : ['Suspicious domain pattern detected']).map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #F9FAFB' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', flexShrink: 0, marginTop: 5 }}/>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{r}</p>
          </div>
        ))}

        <div style={{ height: 20 }}/>
      </div>

      {/* Action buttons */}
      <div style={{
        padding: '16px 20px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
        borderTop: '1px solid #F3F4F6',
        background: '#fff',
        display: 'flex', flexDirection: 'column', gap: 10
      }}>
        <button
          onClick={dismiss}
          style={{ width: '100%', padding: '15px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          Go Back — Stay Safe
        </button>
        <button
          onClick={proceed}
          style={{ width: '100%', padding: '13px', background: 'transparent', color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: 14, fontSize: 13, cursor: 'pointer' }}
        >
          Proceed anyway (not recommended)
        </button>
      </div>
    </div>
  )
}
