import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getToken } from '../services/api'
import {
  fetchMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '../services/auth'
import { settingsApi } from '../services/endpoints'
import type { UserMe } from '../types'
import { getTimeZone } from '../utils'

type AuthContextValue = {
  user: UserMe | null
  isLoading: boolean
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function syncTimeZone(): Promise<void> {
  try {
    const current = await settingsApi.get()
    await settingsApi.update({ ...current, timeZone: getTimeZone() })
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setIsLoading(false)
      return
    }
    try {
      const me = await fetchMe()
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    await loginRequest(email, password)
    const me = await fetchMe()
    setUser(me)
    void syncTimeZone()
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    await registerRequest(email, password)
    const me = await fetchMe()
    setUser(me)
    try {
      await settingsApi.update({
        timeZone: getTimeZone(),
        notifyTasks: true,
        notifyBirthdays: true,
        notifyContests: true,
      })
    } catch {
      // ignore
    }
  }, [])

  const logout = useCallback(() => {
    logoutRequest()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      loading: isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refresh,
    }),
    [user, isLoading, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth AuthProvider içinde kullanılmalı')
  return ctx
}
