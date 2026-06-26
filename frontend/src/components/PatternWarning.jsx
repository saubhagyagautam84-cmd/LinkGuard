export default function PatternWarning({ message, onDismiss }) {
  if (!message) return null
  return (
    <div className="mx-4 mb-3 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2 flex items-start gap-2">
      <span className="text-violet-500 text-sm flex-shrink-0 mt-0.5">🤖</span>
      <div className="flex-1">
        <p className="text-[10px] text-violet-500 font-medium">AI Pattern Note</p>
        <p className="text-[11px] text-violet-800 leading-relaxed">{message}</p>
      </div>
      <button onClick={onDismiss} className="text-violet-400 text-xs hover:text-violet-600">✕</button>
    </div>
  )
}
