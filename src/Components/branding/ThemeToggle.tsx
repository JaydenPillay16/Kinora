import { useTheme } from './ThemeContext'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-medium text-[var(--app-text)] hover:bg-[var(--app-surface-secondary)] focus-visible:outline-2"
    >
      {isDark ? <Sun size={17} strokeWidth={1.7} aria-hidden="true" /> : <Moon size={17} strokeWidth={1.7} aria-hidden="true" />}

      <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}
