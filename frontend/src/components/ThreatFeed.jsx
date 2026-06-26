import { useState, useEffect } from 'react'

export default function ThreatFeed() {
  const [threats, setThreats] = useState([])
  const [idx,     setIdx]     = useState(0)

  useEffect(() => {
    const load = async () => {
      const base = import.meta.env.DEV ? '' : 'http://localhost:3001'
      try { const r = await fetch(`${base}/api/threats/feed`); setThreats(await r.json()) } catch {}
    }
    load()
    const poll = setInterval(load, 30000)
    return () => clearInterval(poll)
  }, [])

  useEffect(() => {
    if (!threats.length) return
    const t = setInterval(() => setIdx(i => (i + 1) % threats.length), 3000)
    return () => clearInterval(t)
  }, [threats])

  if (!threats.length) return null
  const t = threats[idx]

  return (
    <div className="mx-4 mb-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-2 overflow-hidden">
      <span className="text-red-500 text-[10px] font-bold flex-shrink-0 animate-pulse">LIVE</span>
      <p className="text-[11px] text-red-700 truncate">Blocked: {t.url} — {t.category}</p>
    </div>
  )
}
