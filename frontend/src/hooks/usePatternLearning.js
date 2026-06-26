import { useState } from 'react'
import { checkPattern } from '../services/aiService'

const KEY = 'linkguard_history'

function getHistory() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
function saveToHistory(url, category) {
  const h = getHistory()
  h.unshift({ url, category, ts: Date.now() })
  localStorage.setItem(KEY, JSON.stringify(h.slice(0, 100)))
}
function getNormalCategories() {
  const counts = {}
  getHistory().forEach(h => { counts[h.category] = (counts[h.category] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c]) => c)
}

export function usePatternLearning() {
  const [anomaly, setAnomaly] = useState(null)

  const checkAndLearn = async (url, category) => {
    const normalCategories = getNormalCategories()
    const recentUrls       = getHistory().slice(0, 10).map(h => h.url)
    saveToHistory(url, category)
    if (getHistory().length < 10 || normalCategories.includes(category)) return
    try {
      const data = await checkPattern(url, category, normalCategories, recentUrls)
      setAnomaly(data.result)
    } catch {}
  }

  return { anomaly, checkAndLearn, clearAnomaly: () => setAnomaly(null) }
}
