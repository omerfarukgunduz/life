import type { ApiProblemDetails } from '../types'
import { firstErrorMessage } from '../utils'

const TOKEN_KEY = 'life_token'

export class ApiError extends Error {
  status: number
  problem?: ApiProblemDetails
  errors?: Record<string, string[]>

  constructor(status: number, message: string, problem?: ApiProblemDetails) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
    this.errors = problem?.errors
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  auth?: boolean
}

async function parseProblem(res: Response): Promise<ApiProblemDetails | undefined> {
  try {
    return (await res.json()) as ApiProblemDetails
  } catch {
    return undefined
  }
}

export async function api<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, auth = true, headers, ...rest } = options
  const finalHeaders = new Headers(headers)

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = getToken()
    if (token) finalHeaders.set('Authorization', `Bearer ${token}`)
  }

  const url = path.startsWith('/api') ? path : `/api${path}`
  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  })

  if (res.status === 204) return undefined as T

  if (!res.ok) {
    const problem = await parseProblem(res)
    const message =
      firstErrorMessage(
        problem?.errors,
        problem?.detail ?? problem?.title ?? res.statusText,
      ) || 'Bir hata oluştu'
    if (res.status === 401) clearToken()
    throw new ApiError(res.status, message, problem)
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return (await res.json()) as T
  }

  const text = await res.text()
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    return text as T
  }
}
