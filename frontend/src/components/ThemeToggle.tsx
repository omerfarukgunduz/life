import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../utils/cn'

export function ThemeToggle() {
  const { preference, setPreference } = useTheme()
  const isLight = preference === 'light'

  return (
    <div
      role="group"
      aria-label="Tema"
      className="inline-flex rounded-[14px] bg-[#F1F1EF] p-1 dark:bg-[#2C2C2E]"
    >
      <button
        type="button"
        aria-label="Açık tema"
        aria-pressed={isLight}
        onClick={() => setPreference('light')}
        className={cn(
          'flex size-10 items-center justify-center rounded-[11px] transition-colors',
          isLight ? 'bg-soft-blue text-accent' : 'text-secondary',
        )}
      >
        <Sun size={20} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="Koyu tema"
        aria-pressed={!isLight}
        onClick={() => setPreference('dark')}
        className={cn(
          'flex size-10 items-center justify-center rounded-[11px] transition-colors',
          !isLight ? 'bg-[#3A3A3C] text-text' : 'text-secondary',
        )}
      >
        <Moon size={20} strokeWidth={1.75} />
      </button>
    </div>
  )
}
