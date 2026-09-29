import { api } from './api'
import type {
  AuthResponse,
  Birthday,
  BirthdayFilter,
  BirthdayInput,
  Book,
  BookInput,
  BookStatus,
  CalendarItem,
  Contest,
  ContestInput,
  Dashboard,
  ExportData,
  Idea,
  IdeaInput,
  PushSubscribeInput,
  Task,
  TaskFilter,
  TaskInput,
  UserMe,
  UserSettings,
} from '../types'
import { getTimeZone } from '../utils'

export const authApi = {
  login: (email: string, password: string) =>
    api<AuthResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    }),
  register: (email: string, password: string) =>
    api<AuthResponse>('/auth/register', {
      method: 'POST',
      auth: false,
      body: { email, password },
    }),
  me: () => api<UserMe>('/auth/me'),
  changeEmail: (newEmail: string, currentPassword: string) =>
    api<UserMe>('/auth/email', {
      method: 'PUT',
      body: { newEmail, currentPassword },
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api<void>('/auth/password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
    }),
}

export const tasksApi = {
  list: (filter: TaskFilter) =>
    api<Task[]>(`/tasks?filter=${filter}&timeZone=${encodeURIComponent(getTimeZone())}`),
  get: (id: string) => api<Task>(`/tasks/${id}`),
  create: (input: TaskInput) => api<Task>('/tasks', { method: 'POST', body: input }),
  update: (id: string, input: TaskInput) =>
    api<Task>(`/tasks/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => api<void>(`/tasks/${id}`, { method: 'DELETE' }),
}

export const birthdaysApi = {
  list: (filter: BirthdayFilter) =>
    api<Birthday[]>(
      `/birthdays?filter=${filter}&timeZone=${encodeURIComponent(getTimeZone())}`,
    ),
  create: (input: BirthdayInput) =>
    api<Birthday>('/birthdays', { method: 'POST', body: input }),
  update: (id: string, input: BirthdayInput) =>
    api<Birthday>(`/birthdays/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => api<void>(`/birthdays/${id}`, { method: 'DELETE' }),
}

export const contestsApi = {
  list: () => api<Contest[]>('/contests'),
  create: (input: ContestInput) =>
    api<Contest>('/contests', { method: 'POST', body: input }),
  update: (id: string, input: ContestInput) =>
    api<Contest>(`/contests/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => api<void>(`/contests/${id}`, { method: 'DELETE' }),
}

export const booksApi = {
  list: (status?: BookStatus) =>
    api<Book[]>(status ? `/books?status=${status}` : '/books'),
  create: (input: BookInput) => api<Book>('/books', { method: 'POST', body: input }),
  update: (id: string, input: BookInput) =>
    api<Book>(`/books/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => api<void>(`/books/${id}`, { method: 'DELETE' }),
}

export const ideasApi = {
  list: () => api<Idea[]>('/ideas'),
  create: (input: IdeaInput) => api<Idea>('/ideas', { method: 'POST', body: input }),
  update: (id: string, input: IdeaInput) =>
    api<Idea>(`/ideas/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => api<void>(`/ideas/${id}`, { method: 'DELETE' }),
}

export const dashboardApi = {
  get: () =>
    api<Dashboard>(`/dashboard?timeZone=${encodeURIComponent(getTimeZone())}`),
}

export const calendarApi = {
  get: (from: string, to: string) =>
    api<CalendarItem[]>(
      `/calendar?from=${from}&to=${to}&timeZone=${encodeURIComponent(getTimeZone())}`,
    ),
}

export const settingsApi = {
  get: () => api<UserSettings>('/settings'),
  update: (input: UserSettings) =>
    api<UserSettings>('/settings', { method: 'PUT', body: input }),
}

export const pushApi = {
  vapidPublicKey: () => api<{ publicKey: string }>('/push/vapid-public-key'),
  subscribe: (input: PushSubscribeInput) =>
    api<void>('/push/subscribe', { method: 'POST', body: input }),
  unsubscribe: (endpoint: string) =>
    api<void>('/push/subscribe', { method: 'DELETE', body: { endpoint } }),
}

export const dataApi = {
  export: () => api<ExportData>('/export'),
  import: (data: ExportData) => api<void>('/import', { method: 'POST', body: data }),
}
