import { useState, useEffect } from 'react'

export default function InstallPWA() {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Check if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    const handler = e => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari doesn't fire beforeinstallprompt — show manual tip instead
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const dismissed = sessionStorage.getItem('lg_pwa_dismissed')
    if (isIOS && isSafari && !dismissed) setVisible(true)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setVisible(false)
  }

  const dismiss = () => {
    sessionStorage.setItem('lg_pwa_dismissed', '1')
    setVisible(false)
  }

  if (!visible || installed) return null

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

  return (
    <div className="pwa-banner fixed bottom-20 left-4 right-4 max-w-sm mx-auto bg-white border border-purple-100 rounded-2xl shadow-xl z-50 overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">Install LinkGuard</p>
          {isIOS && !prompt ? (
            <p className="text-xs text-gray-500 mt-0.5">
              Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> to install
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5">Add to your home screen for the full app experience</p>
          )}
        </div>
        <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {!isIOS || prompt ? (
        <div className="flex gap-2 px-4 pb-4">
          <button onClick={dismiss} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 font-medium">
            Not now
          </button>
          <button onClick={handleInstall} className="flex-2 flex-grow py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold">
            Install app
          </button>
        </div>
      ) : (
        <div className="px-4 pb-4">
          <div className="bg-purple-50 rounded-xl p-3 flex items-center gap-3">
            <div className="text-lg">📤</div>
            <div>
              <p className="text-xs font-medium text-purple-800">Safari only</p>
              <p className="text-[10px] text-purple-600">Tap the share icon → "Add to Home Screen"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
