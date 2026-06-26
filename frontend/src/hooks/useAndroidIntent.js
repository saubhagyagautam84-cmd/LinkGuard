import { useEffect } from 'react'
import { scanUrl } from '../utils/scanner.js'

// Checks if running inside a Capacitor Android app
const isCapacitor = () =>
  typeof window !== 'undefined' && !!(window.Capacitor?.isNativePlatform?.())

export function useAndroidIntent(onPhishing, onSafe) {
  useEffect(() => {
    if (!isCapacitor()) return

    let App
    import('@capacitor/app').then(({ App: CapApp }) => {
      App = CapApp

      // Handle URL opened via intent (e.g. clicking a link in Chrome/WhatsApp/Gmail)
      const sub = App.addListener('appUrlOpen', ({ url }) => {
        if (!url) return
        const result = scanUrl(url)
        if (result.isPhishing) {
          onPhishing(url, result)
        } else {
          onSafe(url, result)
        }
      })

      // Also check if the app was LAUNCHED with a URL
      App.getLaunchUrl().then(({ url }) => {
        if (!url) return
        const result = scanUrl(url)
        if (result.isPhishing) {
          onPhishing(url, result)
        } else {
          onSafe(url, result)
        }
      }).catch(() => {})

      return () => { sub.then(s => s.remove()).catch(() => {}) }
    }).catch(() => {})
  }, [])
}
