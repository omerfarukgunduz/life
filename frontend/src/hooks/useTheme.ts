import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { ThemeMode } from '../types'
import { applyTheme, getStoredTheme, setStoredTheme } from '../utils/theme'

export type ThemePreference = ThemeMode

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemeMode>(() =>
    getStoredTheme(),
  )

  useEffect(() => {
    applyTheme(preference)
    if (preference !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  const setPreference = useCallback((next: ThemeMode) => {
    setStoredTheme(next)
    setPreferenceState(next)
  }, [])

  const resolved: 'light' | 'dark' =
    preference === 'dark'
      ? 'dark'
      : preference === 'light'
        ? 'light'
        : typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'

  return {
    preference,
    setPreference,
    resolved,
    mode: preference,
    setMode: setPreference,
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useTheme()
  return children
}
