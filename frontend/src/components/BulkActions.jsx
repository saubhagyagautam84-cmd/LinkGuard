import { useState } from 'react'

export default function BulkActions({ links, onDeleteMany, onMarkSafeMany, renderCard }) {
  const [selected, setSelected] = useState(new Set())
  const [active,   setActive]   = useState(false)

  const toggle = id => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const cancel = () => { setActive(false); setSelected(new Set()) }

  return (
    <div>
      <button
        onClick={() => active ? cancel() : setActive(true)}
        className="text-[11px] text-purple-600 mb-2 px-3 py-1 border border-purple-200 rounded-full hover:bg-purple-50 transition-colors"
      >
        {active ? 'Cancel' : 'Select multiple'}
      </button>

      {links.map(link => (
        <div key={link.id} className={`flex items-center gap-2 transition-all ${active ? 'pl-1' : ''}`}>
          {active && (
            <input
              type="checkbox"
              checked={selected.has(link.id)}
              onChange={() => toggle(link.id)}
              className="w-4 h-4 accent-purple-600 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">{renderCard(link)}</div>
        </div>
      ))}

      {active && selected.size > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-md z-40">
          <button
            onClick={() => { onMarkSafeMany([...selected]); cancel() }}
            className="text-xs text-emerald-600 font-medium px-3 py-1.5 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            Mark {selected.size} safe
          </button>
          <button
            onClick={() => { onDeleteMany([...selected]); cancel() }}
            className="text-xs text-red-600 font-medium px-3 py-1.5 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
          >
            Delete {selected.size}
          </button>
        </div>
      )}
    </div>
  )
}
