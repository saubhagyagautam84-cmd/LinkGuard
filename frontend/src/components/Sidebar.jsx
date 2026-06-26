import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Avatar from './Avatar.jsx'

const NAV = [
  { to: '/dashboard', label: 'Dashboard',   short: 'Home',    icon: GridIcon },
  { to: '/saved',     label: 'Saved links', short: 'Saved',   icon: BookmarkIcon },
  { to: '/history',   label: 'History',     short: 'History', icon: ClockIcon },
  { to: '/about',     label: 'About me',    short: 'Profile', icon: UserIcon },
  { to: '/safelist',  label: 'Safe list',   short: 'Safe',    icon: ShieldIcon },
  { to: '/settings',  label: 'Settings',    short: 'More',    icon: CogIcon },
]

// Desktop only shows first 6, mobile bottom bar shows first 5
const MOBILE_NAV = NAV.slice(0, 5)

export default function Sidebar() {
  const { user, isMobile } = useApp()

  /* ── Mobile: Dashboard has its own built-in bottom nav — hide sidebar ── */
  if (isMobile) return null

  /* ── Desktop: fixed left sidebar ── */
  return (
    <aside style={{
      width: 210, minHeight: '100vh', background: '#fff',
      borderRight: '0.5px solid #E5E7EB', display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 20px 16px', borderBottom: '0.5px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, background: '#4F46E5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#111827', letterSpacing: '-0.01em' }}>LinkGuard</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px' }}>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px',
              borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 500,
              color: isActive ? '#4F46E5' : '#6B7280',
              background: isActive ? '#EEF2FF' : 'transparent',
              marginBottom: 2, transition: 'background 0.12s, color 0.12s'
            })}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div style={{ padding: '12px 16px', borderTop: '0.5px solid #F3F4F6' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Avatar firstName={user.first_name} lastName={user.last_name} size={30} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.first_name} {user.last_name}
              </p>
              <p style={{ fontSize: 11, color: '#9CA3AF' }}>{user.role || 'User'}</p>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>No user set</p>
        )}
      </div>
    </aside>
  )
}

/* ── Icons (accept size prop) ── */
function GridIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
}
function BookmarkIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
}
function ClockIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function UserIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function ShieldIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function CogIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
}
