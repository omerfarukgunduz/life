import type { ThemeMode } from '../types'

const THEME_KEY = 'life.theme'
const DASHBOARD_CACHE_KEY = 'life.dashboardCache'

export function getStoredTheme(): ThemeMode {
  const value = localStorage.getItem(THEME_KEY)
  if (value === 'light' || value === 'dark') return value
  if (value === 'system') {
    const resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    localStorage.setItem(THEME_KEY, resolved)
    return resolved
  }
  return 'light'
}

export function setStoredTheme(mode: ThemeMode): void {
  localStorage.setItem(THEME_KEY, mode)
}

export function applyTheme(mode: ThemeMode): 'light' | 'dark' {
  const resolved = mode === 'dark' ? 'dark' : 'light'
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#181818' : '#F7F7F5')
  }
  return resolved
}

export function cacheDashboard(json: string): void {
  localStorage.setItem(DASHBOARD_CACHE_KEY, json)
}

export function readCachedDashboard<T>(): T | null {
  const raw = localStorage.getItem(DASHBOARD_CACHE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
