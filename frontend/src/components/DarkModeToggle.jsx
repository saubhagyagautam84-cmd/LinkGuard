import { useDarkMode } from '../hooks/useDarkMode'

export default function DarkModeToggle() {
  const [dark, toggle] = useDarkMode()
  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm transition-colors"
      aria-label="Toggle dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
