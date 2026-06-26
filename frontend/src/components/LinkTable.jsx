import { useApp } from '../context/AppContext.jsx'
import Avatar from './Avatar.jsx'
import TrustBadge from './TrustBadge.jsx'

export default function LinkTable({ title, links, onRowClick, loading }) {
  const { isMobile } = useApp()

  return (
    <div style={{ border: '0.5px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      {/* Header */}
      <div style={{ padding: isMobile ? '12px 16px' : '14px 20px', borderBottom: '0.5px solid #F3F4F6', display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{title}</h2>
        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{links.length} link{links.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#D1D5DB', fontSize: 13 }}>Loading…</div>
      ) : links.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No links yet</div>
      ) : isMobile ? (
        /* ── Mobile: card list ── */
        <div>
          {links.map((link, i) => (
            <div
              key={link.id}
              onClick={() => onRowClick(link)}
              style={{
                padding: '14px 16px',
                borderBottom: i < links.length - 1 ? '0.5px solid #F3F4F6' : 'none',
                cursor: 'pointer', active: { background: '#F9FAFB' }
              }}
              onTouchStart={e => e.currentTarget.style.background = '#F9FAFB'}
              onTouchEnd={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Row 1: avatar + name + trust badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Avatar firstName={link.user?.first_name} lastName={link.user?.last_name} size={22} />
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                    {link.user?.first_name} {link.user?.last_name || ''}
                  </span>
                </div>
                <TrustBadge trust={link.trust} />
              </div>
              {/* Row 2: label */}
              <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 3 }}>{link.label}</p>
              {/* Row 3: domain + open arrow */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF' }}>{link.domain}</span>
                <span style={{ fontSize: 12, color: '#4F46E5', fontWeight: 500 }}>Open →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Desktop: table ── */
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid #F3F4F6' }}>
              {['Name', 'Link label', 'Domain', 'Trust', 'Open'].map(col => (
                <th key={col} style={{ padding: '9px 20px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {links.map((link, i) => (
              <tr
                key={link.id}
                onClick={() => onRowClick(link)}
                style={{ borderBottom: i < links.length - 1 ? '0.5px solid #F9FAFB' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '11px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar firstName={link.user?.first_name} lastName={link.user?.last_name} size={26} />
                    <span style={{ fontSize: 13, color: '#374151' }}>{link.user?.first_name} {link.user?.last_name || ''}</span>
                  </div>
                </td>
                <td style={{ padding: '11px 20px', fontSize: 13, color: '#111827', fontWeight: 500 }}>{link.label}</td>
                <td style={{ padding: '11px 20px', fontSize: 11, color: '#6B7280', fontFamily: 'monospace' }}>{link.domain}</td>
                <td style={{ padding: '11px 20px' }}><TrustBadge trust={link.trust} /></td>
                <td style={{ padding: '11px 20px' }}>
                  <span style={{ fontSize: 12, color: '#4F46E5', fontWeight: 500 }}>Open →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
