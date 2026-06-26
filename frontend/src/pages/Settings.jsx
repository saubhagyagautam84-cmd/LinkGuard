import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useDarkMode } from '../hooks/useDarkMode.js'
import PageHeader from '../components/PageHeader.jsx'

function Toggle({ on, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 42, height: 24, borderRadius: 12, cursor: 'pointer', flexShrink: 0,
        background: on ? '#4F46E5' : '#E5E7EB',
        position: 'relative', transition: 'background 0.2s'
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
      }}/>
    </div>
  )
}

function Row({ label, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', gap: 16 }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{label}</p>
        {desc && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ border: '0.5px solid #E5E7EB', borderRadius: 12, background: '#fff', overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '12px 18px', borderBottom: '0.5px solid #F3F4F6' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { user, isMobile, addToast } = useApp()
  const [dark, toggleDark] = useDarkMode()

  const [scanSensitivity, setScanSensitivity] = useState(
    () => localStorage.getItem('lg_scan_sensitivity') || 'medium'
  )
  const [alertPopup, setAlertPopup] = useState(
    () => localStorage.getItem('lg_alert_popup') !== 'false'
  )
  const [autoScan, setAutoScan] = useState(
    () => localStorage.getItem('lg_auto_scan') === 'true'
  )

  const pad = isMobile ? '20px 16px' : '32px 36px'
  const divider = { borderTop: '0.5px solid #F9FAFB' }

  const save = (key, value, setter) => {
    localStorage.setItem(key, String(value))
    setter(value)
    addToast('Setting saved')
  }

  const clearHistory = () => {
    localStorage.removeItem('linkguard_history')
    addToast('URL history cleared')
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <PageHeader title="Settings" subtitle="Manage your preferences" />
      <div style={{ padding: pad }}>

      {/* Appearance */}
      <Section title="Appearance">
        <Row label="Dark mode" desc="Switch between light and dark theme">
          <Toggle on={dark} onToggle={toggleDark}/>
        </Row>
      </Section>

      {/* Scanning */}
      <Section title="Scanning">
        <Row label="Show alert popup" desc="Display phishing warning before opening unverified links">
          <Toggle on={alertPopup} onToggle={() => save('lg_alert_popup', !alertPopup, setAlertPopup)}/>
        </Row>
        <div style={divider}>
          <Row label="Auto-scan pasted URLs" desc="Scan URLs automatically when you paste in the scan box">
            <Toggle on={autoScan} onToggle={() => save('lg_auto_scan', !autoScan, setAutoScan)}/>
          </Row>
        </div>
        <div style={divider}>
          <div style={{ padding: '14px 18px' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 4 }}>Scan sensitivity</p>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>Higher sensitivity flags more links but may have false positives</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Low', 'Medium', 'High'].map(lvl => (
                <button key={lvl} onClick={() => save('lg_scan_sensitivity', lvl.toLowerCase(), setScanSensitivity)}
                  style={{
                    flex: 1, padding: '8px', border: '0.5px solid', borderRadius: 8, fontSize: 12,
                    fontWeight: 500, cursor: 'pointer',
                    borderColor: scanSensitivity === lvl.toLowerCase() ? '#4F46E5' : '#E5E7EB',
                    background: scanSensitivity === lvl.toLowerCase() ? '#EEF2FF' : '#fff',
                    color: scanSensitivity === lvl.toLowerCase() ? '#4F46E5' : '#6B7280',
                  }}
                >{lvl}</button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Data */}
      <Section title="Data & Privacy">
        <Row label="Clear URL history" desc="Removes locally stored scan history used for AI pattern detection">
          <button onClick={clearHistory} style={{ padding: '6px 12px', border: '0.5px solid #E5E7EB', borderRadius: 8, background: '#fff', color: '#6B7280', fontSize: 12, cursor: 'pointer' }}>
            Clear
          </button>
        </Row>
        <div style={divider}>
          <Row label="AI engine" desc="Groq — llama-3.3-70b-versatile">
            <span style={{ fontSize: 11, background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>Active</span>
          </Row>
        </div>
      </Section>

      {/* Account */}
      <Section title="Account">
        <Row label="Logged in as" desc={user?.email || 'No profile set'}>
          <span style={{ fontSize: 12, color: user ? '#4F46E5' : '#9CA3AF', fontWeight: 500 }}>
            {user ? `${user.first_name} ${user.last_name}`.trim() : 'Guest'}
          </span>
        </Row>
      </Section>

      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <p style={{ fontSize: 11, color: '#D1D5DB' }}>LinkGuard v1.0 · React + Vite + Groq AI</p>
      </div>
      </div>
    </div>
  )
}
