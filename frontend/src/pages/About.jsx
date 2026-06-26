import { useState, useEffect } from 'react'
import { saveUser, getLinksByUser, getTrustedDomains } from '../api/index.js'
import { useApp } from '../context/AppContext.jsx'
import Avatar from '../components/Avatar.jsx'
import PageHeader from '../components/PageHeader.jsx'

const BLANK = { first_name: '', last_name: '', email: '', role: '', bio: '' }

export default function About() {
  const { user, setUser, addToast, isMobile } = useApp()
  const [form, setForm] = useState(BLANK)
  const [stats, setStats] = useState({ links: 0, trusted: 0 })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (user) {
      setForm({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '', role: user.role || '', bio: user.bio || '' })
      Promise.all([getLinksByUser(user.id), getTrustedDomains(user.id)])
        .then(([links, domains]) => setStats({ links: links.length, trusted: domains.length }))
        .catch(() => {})
    }
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const saved = await saveUser(form)
      setUser(saved)
      addToast(`Profile saved — welcome, ${saved.first_name}!`)
    } catch (_) {
      addToast('Failed to save. Is the backend running?')
    }
    setSaving(false)
  }

  const pad = isMobile ? '20px 16px' : '32px 36px'
  const inp = { width: '100%', border: '0.5px solid #E5E7EB', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#374151', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff' }
  const lbl = { fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 4 }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <PageHeader title="About me" subtitle="Your profile and link activity" />
      <div style={{ padding: pad }}>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[{ label: 'Links saved', value: stats.links }, { label: 'Trusted domains', value: stats.trusted }, { label: 'Blocked links', value: 0 }].map(s => (
          <div key={s.label} style={{ flex: 1, border: '0.5px solid #E5E7EB', borderRadius: 12, padding: isMobile ? '14px 12px' : '16px 18px', background: '#fff', minWidth: 0 }}>
            <p style={{ fontSize: isMobile ? 20 : 22, fontWeight: 600, color: '#111827' }}>{s.value}</p>
            <p style={{ fontSize: isMobile ? 10 : 11, color: '#9CA3AF', marginTop: 3, lineHeight: 1.3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Profile hero */}
      {user && (
        <div style={{ border: '0.5px solid #E5E7EB', borderRadius: 12, padding: isMobile ? '16px' : '20px 22px', background: '#fff', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <Avatar firstName={user.first_name} lastName={user.last_name} size={isMobile ? 46 : 54} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: isMobile ? 15 : 16, fontWeight: 500, color: '#111827' }}>{user.first_name} {user.last_name}</p>
            <p style={{ fontSize: 12, color: '#6B7280', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
            <span style={{ display: 'inline-block', marginTop: 6, background: '#EEF2FF', color: '#4F46E5', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 6 }}>
              Active user
            </span>
          </div>
        </div>
      )}

      {/* Form */}
      <div style={{ border: '0.5px solid #E5E7EB', borderRadius: 12, padding: isMobile ? '18px 16px' : '22px 24px', background: '#fff' }}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 16 }}>
          {user ? 'Edit profile' : 'Create profile'}
        </h2>
        <form onSubmit={handleSave}>
          {/* Name fields — side by side on desktop, stacked on mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={lbl}>First name *</label>
              <input required value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Priya" style={inp} />
            </div>
            <div>
              <label style={lbl}>Last name</label>
              <input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Sharma" style={inp} />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={lbl}>Email *</label>
            <input required type="email" inputMode="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="priya@example.com" style={inp} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={lbl}>Role</label>
            <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="Designer, Developer…" style={inp} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Short bio</label>
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell us about yourself…" style={{ ...inp, height: 80, resize: 'vertical', lineHeight: 1.5 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setForm(BLANK)} style={{ flex: 1, padding: '11px', border: '0.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#6B7280', background: '#fff', cursor: 'pointer' }}>
              Clear
            </button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '11px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}
