import { useState } from 'react'
import { scanHistory } from '../services/aiService'
import RiskBadge from '../components/RiskBadge'
import PageHeader from '../components/PageHeader.jsx'

export default function HistoryScan() {
  const [input,   setInput]   = useState('')
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleScan = async () => {
    const urls = input.split('\n').map(u => u.trim()).filter(u => u.length > 4)
    if (!urls.length) return
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const data = await scanHistory(urls)
      setResult(data)
    } catch (e) {
      setError('Scan failed — check backend & API key')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-6 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <PageHeader title="AI History Scan" subtitle="Powered by Groq AI" showBack />

        <div className="px-4 pt-4 pb-6">
          <p className="text-xs text-gray-500 mb-3">Paste URLs one per line — AI will flag anything suspicious.</p>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={6}
            placeholder={"https://example.com\nhttps://another-site.com\n..."}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-purple-400 resize-none mb-3"
          />

          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

          <button
            onClick={handleScan}
            disabled={loading || !input.trim()}
            className="w-full bg-purple-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors mb-4"
          >
            {loading ? '🤖 Gemini scanning…' : 'Scan with AI'}
          </button>

          {result && (
            <div className="flex flex-col gap-3">
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-400 mb-0.5">Gemini Summary</p>
                <p className="text-xs text-gray-700">{result.summary}</p>
              </div>

              {result.flagged?.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-3 text-center">
                  <p className="text-sm text-emerald-700">✅ All links look safe!</p>
                </div>
              ) : (
                <>
                  <p className="text-[11px] font-medium text-gray-700">
                    {result.flagged?.length} suspicious {result.flagged?.length === 1 ? 'link' : 'links'} found
                  </p>
                  {result.flagged?.map((item, i) => (
                    <div key={i} className="bg-white border border-red-100 rounded-xl px-3 py-2.5">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <p className="text-[11px] text-gray-700 truncate flex-1">{item.url}</p>
                        <RiskBadge level={item.risk}/>
                      </div>
                      <p className="text-[10px] text-gray-500">{item.reason}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
