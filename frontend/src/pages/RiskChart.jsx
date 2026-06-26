import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getLinks } from '../api/index.js'
import PageHeader from '../components/PageHeader.jsx'

const COLORS = ['#DC2626', '#D97706', '#16A34A', '#94A3B8']

function getRisk(domain = '', trust = '') {
  if (trust === 'safe') return null
  const tlds = ['.xyz', '.win', '.tk', '.ml', '.top', '.club', '.online', '.ru', '.cn']
  return tlds.some(t => domain.endsWith(t)) ? 'High' : 'Medium'
}

export default function RiskChart() {
  const [links, setLinks] = useState([])

  useEffect(() => {
    getLinks().then(all => setLinks(Array.isArray(all) ? all : [])).catch(() => {})
  }, [])

  const mapped = links.map(l => ({ ...l, risk: getRisk(l.domain, l.trust) }))

  const data = [
    { name: 'High risk',   value: mapped.filter(l => l.risk === 'High').length },
    { name: 'Medium risk', value: mapped.filter(l => l.risk === 'Medium').length },
    { name: 'Trusted',     value: mapped.filter(l => l.trust === 'safe').length },
    { name: 'Unverified',  value: mapped.filter(l => l.trust === 'caution' && !l.risk).length },
  ].filter(d => d.value > 0)

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-6 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <PageHeader title="Risk Breakdown" subtitle={`${total} total links analysed`} showBack />

        {/* Chart */}
        <div className="px-4 pt-4 pb-2">
          {data.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">No data yet — add some links</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v => [`${v} links`]}/>
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-gray-600">{v}</span>}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend rows */}
        <div className="px-4 pb-4 flex flex-col gap-2">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }}/>
                <span className="text-xs text-gray-600">{d.name}</span>
              </div>
              <span className="text-xs font-medium text-gray-800">{d.value} ({total ? Math.round(d.value / total * 100) : 0}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
