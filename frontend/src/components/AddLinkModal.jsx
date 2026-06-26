import { useState } from 'react'
import { addLink } from '../api/index.js'
import { useApp } from '../context/AppContext.jsx'

function extractDomain(url) {
  try { return new URL(url.startsWith('http') ? url : 'https://' + url).hostname }
  catch { return url }
}

export default function AddLinkModal({ onClose, onSaved }) {
  const { user, isMobile } = useApp()
  const [form, setForm] = useState({ label: '', url: '', trust: 'caution' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const url = form.url.startsWith('http') ? form.url : 'https://' + form.url
      await addLink({ label: form.label, url, domain: extractDomain(url), trust: form.trust, added_by: user.id })
      await onSaved()
      onClose()
    } catch (_) {
      setError('Failed to save. Is the backend running?')
    }
    setSaving(false)
  }

  const sheetStyle = isMobile
    ? { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '20px 20px 0 0', padding: '16px 20px 36px', animation: 'slideUpModal 220ms ease' }
    : { background: '#fff', width: '100%', maxWidth: 400, margin: '0 16px', borderRadius: 16, padding: '24px', animation: 'modalIn 180ms ease' }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.38)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 900 }}
      onClick={onClose}
    >
      <div style={sheetStyle} onClick={e => e.stopPropagation()}>
        {isMobile && <div style={{ width: 40, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '0 auto 18px' }} />}

        <h2 style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 16 }}>Add new link</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 10 }}>
            <label style={lbl}>Label *</label>
            <input required value={form.label} onChange={e => set('label', e.target.value)} placeholder="e.g. React Docs" style={inp} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={lbl}>URL *</label>
            <input required value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://example.com" style={inp} type="url" inputMode="url" />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>Trust level</label>
            <select value={form.trust} onChange={e => set('trust', e.target.value)} style={inp}>
              <option value="caution">Unverified</option>
              <option value="safe">Trusted</option>
            </select>
          </div>
          {error && <p style={{ fontSize: 12, color: '#EF4444', marginBottom: 10 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', border: '0.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#6B7280', background: '#fff', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '11px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inp = { width: '100%', border: '0.5px solid #E5E7EB', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#374151', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff' }
const lbl = { fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 4 }
