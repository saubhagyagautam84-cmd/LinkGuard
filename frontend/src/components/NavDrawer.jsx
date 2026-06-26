import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useNav } from '../context/NavContext.jsx'
import { useApp } from '../context/AppContext.jsx'

const NAV_ITEMS = [
  {
    to: '/dashboard', label: 'Dashboard', desc: 'Overview & recent links',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  },
  {
    to: '/saved', label: 'Saved links', desc: 'All your bookmarked links',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
  },
  {
    to: '/history', label: 'History', desc: 'Scan URL history with AI',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 3"/></svg>
  },
  {
    to: '/about', label: 'About me', desc: 'Your profile & stats',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  },
  {
    to: '/safelist', label: 'Safe list', desc: 'Trusted domains',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  },
  {
    to: '/settings', label: 'Settings', desc: 'Preferences & account',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  },
]

function getInitials(first = '', last = '') {
  return `${first[0] || ''}${last[0] || ''}`.toUpperCase() || '?'
}

export default function NavDrawer() {
  const { navOpen, closeNav } = useNav()
  const { user } = useApp()
  const navigate = useNavigate()

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [navOpen])

  // Close on Escape key
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') closeNav() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeNav])

  if (!navOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px]"
        onClick={closeNav}
        style={{ animation: 'fadeIn 0.2s ease' }}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 left-0 h-full z-[201] bg-white flex flex-col shadow-2xl"
        style={{ width: 'min(300px, 85vw)', animation: 'drawerSlideIn 0.25s ease' }}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-[15px]">LinkGuard</span>
          </div>
          <button
            onClick={closeNav}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {NAV_ITEMS.map(({ to, label, desc, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeNav}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all no-underline ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className={`flex-shrink-0`}>{icon}</div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium leading-none mb-0.5">{label}</p>
                <p className="text-[11px] text-gray-400 truncate">{desc}</p>
              </div>
            </NavLink>
          ))}

          {/* Divider */}
          <div className="border-t border-gray-100 my-3" />

          {/* Extra pages */}
          <button
            onClick={() => { navigate('/risk-chart'); closeNav() }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-gray-600 hover:bg-gray-50 transition-all"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 20V10M12 20V4M6 20v-6"/></svg>
            <div className="min-w-0 text-left">
              <p className="text-[13px] font-medium leading-none mb-0.5">Risk Chart</p>
              <p className="text-[11px] text-gray-400">Visual risk breakdown</p>
            </div>
          </button>

          <button
            onClick={() => { navigate('/heatmap'); closeNav() }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-gray-600 hover:bg-gray-50 transition-all"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <div className="min-w-0 text-left">
              <p className="text-[13px] font-medium leading-none mb-0.5">Threat Heatmap</p>
              <p className="text-[11px] text-gray-400">12-week threat activity</p>
            </div>
          </button>
        </nav>

        {/* User card at bottom */}
        <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold flex-shrink-0">
                {getInitials(user.first_name, user.last_name)}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-gray-800 truncate">{user.first_name} {user.last_name}</p>
                <p className="text-[11px] text-gray-400 truncate">{user.email || user.role || 'User'}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { navigate('/about'); closeNav() }}
              className="w-full flex items-center gap-2 text-indigo-600 text-xs font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Set up your profile
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes drawerSlideIn { from { transform: translateX(-100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  )
}
