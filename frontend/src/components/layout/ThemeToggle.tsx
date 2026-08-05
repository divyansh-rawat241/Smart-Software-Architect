import { MoonStar, SunMedium } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="button-secondary gap-2 px-4 py-2.5 shadow-soft"
    >
      {theme === 'dark' ? (
        <SunMedium className="size-4" />
      ) : (
        <MoonStar className="size-4" />
      )}
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
