import { useEffect, useRef } from 'react'
import { scanUrl } from '../utils/scanner.js'

const isCapacitor = () =>
  typeof window !== 'undefined' && !!(window.Capacitor?.isNativePlatform?.())

const URL_REGEX = /https?:\/\/[^\s"'<>()]+/i

export function useClipboardScan(onPhishing, onSafe) {
  const lastChecked = useRef('')

  const checkClipboard = async () => {
    try {
      let text = ''
      if (isCapacitor()) {
        const { Clipboard } = await import('@capacitor/clipboard')
        const { value } = await Clipboard.read()
        text = value || ''
      } else if (navigator.clipboard?.readText) {
        text = await navigator.clipboard.readText()
      }

      const match = text.match(URL_REGEX)
      if (!match) return
      const url = match[0]
      if (url === lastChecked.current) return
      lastChecked.current = url

      const result = scanUrl(url)
      if (result.isPhishing) {
        onPhishing(url, result)
      } else {
        onSafe(url, result)
      }
    } catch {}
  }

  useEffect(() => {
    // Check on app resume (coming back from WhatsApp)
    if (isCapacitor()) {
      import('@capacitor/app').then(({ App }) => {
        const sub = App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) checkClipboard()
        })
        return () => sub.then(s => s.remove()).catch(() => {})
      }).catch(() => {})
    } else {
      // Web: check on window focus
      window.addEventListener('focus', checkClipboard)
      return () => window.removeEventListener('focus', checkClipboard)
    }
  }, [])
}
