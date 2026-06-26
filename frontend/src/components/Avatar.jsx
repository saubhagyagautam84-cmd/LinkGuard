const COLORS = ['#3B82F6','#10B981','#8B5CF6','#14B8A6','#F59E0B','#EF4444']

function colorFor(name) {
  let h = 0
  for (const c of (name || '?')) h = c.charCodeAt(0) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

export default function Avatar({ firstName = '', lastName = '', size = 36 }) {
  const initials = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || '?'
  const bg = colorFor(firstName + lastName)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.38, fontWeight: 500, flexShrink: 0, userSelect: 'none'
    }}>
      {initials}
    </div>
  )
}
