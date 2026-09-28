import { api, clearToken, setToken } from './api'
import type { AuthResponse, UserMe } from '../types'

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })
  setToken(data.token)
  return data
}

export async function register(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const data = await api<AuthResponse>('/auth/register', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })
  setToken(data.token)
  return data
}

export async function fetchMe(): Promise<UserMe> {
  return api<UserMe>('/auth/me')
}

export function logout(): void {
  clearToken()
}
