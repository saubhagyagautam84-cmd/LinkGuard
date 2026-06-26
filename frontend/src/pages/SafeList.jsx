import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { getTrustedDomains } from '../api/index.js'
import PageHeader from '../components/PageHeader.jsx'

function extractDomain(input) {
  try {
    const url = input.startsWith('http') ? input : 'https://' + input
    return new URL(url).hostname.replace(/^www\./, '')
  } catch { return input.trim() }
}

export default function SafeList() {
  const { user, isMobile, addToast } = useApp()
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)
  const [input,   setInput]   = useState('')
  const [adding,  setAdding]  = useState(false)

  const pad = isMobile ? '20px 16px' : '32px 36px'

  const load = async () => {
    if (!user) { setLoading(false); return }
    try {
      const data = await getTrustedDomains(user.id)
      setDomains(Array.isArray(data) ? data : [])
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const handleAdd = async () => {
    const domain = extractDomain(input)
    if (!domain || !user) return
    setAdding(true)
    try {
      const base = import.meta.env.DEV ? '' : 'http://localhost:3001'
      const res = await fetch(`${base}/api/trusted-domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, user_id: user.id }),
      })
      if (res.status === 409) { addToast('Domain already in safe list'); setAdding(false); return }
      const saved = await res.json()
      setDomains(prev => [saved, ...prev])
      setInput('')
      addToast(`✅ ${domain} added to safe list`)
    } catch (_) { addToast('Failed to add domain') }
    setAdding(false)
  }

  const handleDelete = async (id, domain) => {
    try {
      await fetch(`/api/trusted-domains/${id}`, { method: 'DELETE' })
      setDomains(prev => prev.filter(d => d.id !== id))
      addToast(`Removed ${domain}`)
    } catch (_) { addToast('Failed to remove domain') }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <PageHeader title="Safe list" subtitle="Trusted domains skip the phishing popup" />
      <div style={{ padding: pad }}>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, border: '0.5px solid #E5E7EB', borderRadius: 12, padding: '16px 18px', background: '#fff' }}>
          <p style={{ fontSize: 22, fontWeight: 600, color: '#111827' }}>{domains.length}</p>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>Trusted domains</p>
        </div>
        <div style={{ flex: 1, border: '0.5px solid #E5E7EB', borderRadius: 12, padding: '16px 18px', background: '#ECFDF5' }}>
          <p style={{ fontSize: 22, fontWeight: 600, color: '#059669' }}>Active</p>
          <p style={{ fontSize: 11, color: '#6EE7B7', marginTop: 3 }}>Protection status</p>
        </div>
      </div>

      {/* Add domain */}
      {user ? (
        <div style={{ border: '0.5px solid #E5E7EB', borderRadius: 12, padding: isMobile ? '16px' : '20px 22px', background: '#fff', marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 12 }}>Add trusted domain</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="github.com or https://github.com"
              style={{ flex: 1, border: '0.5px solid #E5E7EB', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#F9FAFB', fontFamily: 'inherit' }}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !input.trim()}
              style={{ padding: '10px 16px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: adding || !input.trim() ? 0.6 : 1, whiteSpace: 'nowrap' }}
            >
              {adding ? 'Adding…' : '+ Add'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>Links from trusted domains will open directly without a warning popup.</p>
        </div>
      ) : (
        <div style={{ border: '0.5px dashed #E5E7EB', borderRadius: 12, padding: '22px', textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>Go to <strong style={{ color: '#4F46E5' }}>About me</strong> to create a profile first.</p>
        </div>
      )}

      {/* Domain list */}
      <div style={{ border: '0.5px solid #E5E7EB', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Trusted domains</p>
          <span style={{ fontSize: 11, color: '#9CA3AF', background: '#F3F4F6', padding: '2px 8px', borderRadius: 20 }}>{domains.length}</span>
        </div>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>Loading…</div>
        ) : domains.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>No trusted domains yet.</p>
            <p style={{ fontSize: 11, color: '#D1D5DB', marginTop: 4 }}>Add a domain above to get started.</p>
          </div>
        ) : (
          domains.map((d, i) => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: i < domains.length - 1 ? '0.5px solid #F9FAFB' : 'none', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.domain}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF' }}>Added {new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(d.id, d.domain)}
                style={{ padding: '5px 10px', border: '0.5px solid #FEE2E2', borderRadius: 6, background: '#FFF5F5', color: '#EF4444', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  )
}
