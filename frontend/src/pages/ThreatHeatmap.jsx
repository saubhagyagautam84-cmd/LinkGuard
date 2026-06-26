import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'

export default function ThreatHeatmap() {
  const [data, setData] = useState([])

  useEffect(() => {
    // Mock 84 days (12 weeks). Replace with: fetch('/api/threats/heatmap')
    const mock = Array.from({ length: 84 }, (_, i) => ({
      date:  new Date(Date.now() - (83 - i) * 86400000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 8),
    }))
    setData(mock)
  }, [])

  const max = Math.max(...data.map(d => d.count), 1)
  const color = count => {
    const opacity = count === 0 ? 0.08 : 0.2 + (count / max) * 0.8
    return `rgba(124, 58, 237, ${opacity})`
  }

  const totalThreats = data.reduce((s, d) => s + d.count, 0)
  const peakDay      = data.reduce((a, b) => (a.count > b.count ? a : b), { date: '-', count: 0 })

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-6 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <PageHeader title="Threat Heatmap" subtitle="Last 12 weeks of detections" showBack />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 px-4 pt-4 pb-3">
          <div className="bg-violet-50 rounded-xl p-3">
            <p className="text-xl font-medium text-violet-700">{totalThreats}</p>
            <p className="text-[10px] text-violet-400 mt-0.5">Total threats</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3">
            <p className="text-xl font-medium text-red-600">{peakDay.count}</p>
            <p className="text-[10px] text-red-400 mt-0.5">Peak day ({peakDay.date})</p>
          </div>
        </div>

        {/* Grid */}
        <div className="px-4 pb-4">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
            {data.map((d, i) => (
              <div
                key={i}
                title={`${d.date}: ${d.count} threats`}
                className="aspect-square rounded-sm cursor-default"
                style={{ background: color(d.count) }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[10px] text-gray-400">Less</span>
            {[0.08, 0.3, 0.55, 0.8, 1].map(o => (
              <div key={o} className="w-3 h-3 rounded-sm" style={{ background: `rgba(124,58,237,${o})` }}/>
            ))}
            <span className="text-[10px] text-gray-400">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
