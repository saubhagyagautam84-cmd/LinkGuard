import { useNavigate } from 'react-router-dom'
import { useNav } from '../context/NavContext.jsx'

export default function PageHeader({ title, subtitle, showBack = false, right }) {
  const { openNav } = useNav()
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px 12px',
      borderBottom: '0.5px solid #F3F4F6',
      background: '#fff',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {/* Left: dots button (or back) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            style={{ width: 32, height: 32, borderRadius: 10, background: '#F3F4F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="16" height="16" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        )}

        {/* ⋮ three-dot menu button */}
        <button
          onClick={openNav}
          style={{ width: 32, height: 32, borderRadius: 10, background: '#F3F4F6', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, flexShrink: 0 }}
          aria-label="Open navigation menu"
        >
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#374151', display: 'block' }}/>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#374151', display: 'block' }}/>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#374151', display: 'block' }}/>
        </button>
      </div>

      {/* Center: title */}
      <div style={{ textAlign: 'center', flex: 1, marginLeft: 8, marginRight: 8 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', lineHeight: 1 }}>{title}</p>
        {subtitle && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{subtitle}</p>}
      </div>

      {/* Right: optional action */}
      <div style={{ flexShrink: 0, minWidth: 32 }}>
        {right || null}
      </div>
    </div>
  )
}
