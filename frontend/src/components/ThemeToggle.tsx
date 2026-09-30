import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../utils/cn'

export function ThemeToggle() {
  const { preference, setPreference } = useTheme()
  const isLight = preference === 'light'

  return (
    <div role="group" aria-label="Tema" className="segment-track inline-flex w-[76px] shrink-0">
      <button
        type="button"
        aria-label="Açık tema"
        aria-pressed={isLight}
        onClick={() => setPreference('light')}
        className={cn(
          'flex h-full flex-1 items-center justify-center',
          isLight ? 'segment-active' : 'text-secondary',
        )}
      >
        <Sun size={16} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="Koyu tema"
        aria-pressed={!isLight}
        onClick={() => setPreference('dark')}
        className={cn(
          'flex h-full flex-1 items-center justify-center',
          !isLight ? 'segment-active' : 'text-secondary',
        )}
      >
        <Moon size={16} strokeWidth={1.75} />
      </button>
    </div>
  )
}
