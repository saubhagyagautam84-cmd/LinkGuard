const API_BASE = import.meta.env.DEV ? '' : 'http://localhost:3001'

async function callAI(action, payload) {
  const res = await fetch(`${API_BASE}/api/ai`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ action, payload }),
  })
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`)
  return res.json()
}

export const explainThreat  = (url, reasons)                              => callAI('explain',       { url, reasons })
export const categorizeUrl  = (url)                                        => callAI('categorize',    { url })
export const checkPattern   = (newUrl, newCategory, normalCategories, recentUrls) => callAI('pattern', { newUrl, newCategory, normalCategories, recentUrls })
export const scanHistory    = (urls)                                       => callAI('history_scan',  { urls })
