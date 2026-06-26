const config = {
  High:   { bg: 'bg-red-50',     text: 'text-red-600',     label: 'Risk: High'   },
  Medium: { bg: 'bg-orange-50',  text: 'text-orange-600',  label: 'Risk: Medium' },
  Low:    { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Risk: Low'    },
}

export default function RiskBadge({ level, score }) {
  if (!level) return null
  const c = config[level] || config.Medium
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}>
      {c.label}{score ? ` · ${score}%` : ''}
    </span>
  )
}
