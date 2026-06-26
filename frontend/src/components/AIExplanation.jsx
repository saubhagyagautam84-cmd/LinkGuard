import { useState } from 'react'
import { explainThreat } from '../services/aiService'

export default function AIExplanation({ url, reasons }) {
  const [explanation, setExplanation] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [shown,       setShown]       = useState(false)

  const handleAsk = async () => {
    setShown(true)
    setLoading(true)
    try {
      const data = await explainThreat(url, reasons)
      setExplanation(data.result)
    } catch {
      setExplanation('Could not load explanation. Check backend connection.')
    } finally {
      setLoading(false)
    }
  }

  if (!shown) return (
    <button onClick={handleAsk} className="w-full text-xs text-purple-600 border border-purple-200 bg-purple-50 rounded-xl py-2 hover:bg-purple-100 transition-colors mt-3">
      🤖 Why is this dangerous? Ask AI
    </button>
  )

  if (loading) return (
    <div className="bg-purple-50 rounded-xl p-3 flex items-center gap-2 mt-3">
      <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"/>
      <p className="text-xs text-purple-600">AI is analysing this link…</p>
    </div>
  )

  return (
    <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 mt-3">
      <p className="text-[10px] text-purple-400 font-medium mb-1">AI Explanation (Groq)</p>
      <p className="text-xs text-purple-900 leading-relaxed">{explanation}</p>
    </div>
  )
}
