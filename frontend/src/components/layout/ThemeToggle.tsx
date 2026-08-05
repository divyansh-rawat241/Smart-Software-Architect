import { MoonStar, SunMedium } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="button-secondary flex items-center gap-2 px-3 py-2 text-sm"
    >
      {theme === 'dark' ? (
        <SunMedium className="h-4 w-4" />
      ) : (
        <MoonStar className="h-4 w-4" />
      )}
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}
