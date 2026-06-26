import { useState, useEffect } from 'react'

export function useUrlScanner(url) {
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!url || url.length < 8) { setResult(null); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const base = import.meta.env.DEV ? '' : 'http://localhost:3001'
        const res  = await fetch(`${base}/api/check-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        setResult(await res.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [url])

  return { result, loading, error }
}
