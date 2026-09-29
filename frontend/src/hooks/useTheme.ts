import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { ThemeMode } from '../types'
import { applyTheme, getStoredTheme, setStoredTheme } from '../utils/theme'

export type ThemePreference = ThemeMode

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemeMode>(() => getStoredTheme())

  useEffect(() => {
    applyTheme(preference)
  }, [preference])

  const setPreference = useCallback((next: ThemeMode) => {
    setStoredTheme(next)
    setPreferenceState(next)
  }, [])

  return {
    preference,
    setPreference,
    resolved: preference,
    mode: preference,
    setMode: setPreference,
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useTheme()
  return children
}
