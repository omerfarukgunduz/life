export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function getTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function formatDayMonth(date: string | Date): string {
  const d = typeof date === 'string' ? parseDateOnly(date) : date
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
  }).format(d)
}

export function formatDayMonthLong(date: string | Date): string {
  const d = typeof date === 'string' ? parseDateOnly(date) : date
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
  }).format(d)
}

export function formatWeekday(date: string | Date): string {
  const d = typeof date === 'string' ? parseDateOnly(date) : date
  return new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(d)
}

export function formatWeekdayDayMonth(date: string | Date): string {
  const d = typeof date === 'string' ? parseDateOnly(date) : date
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d)
}

export function formatDayMonthWeekday(date: string | Date): string {
  const d = typeof date === 'string' ? parseDateOnly(date) : date
  const dayMonth = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
  }).format(d)
  const weekday = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(d)
  return `${dayMonth} ${weekday}`
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso))
}

export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1)
}

export function toDateOnly(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function daysUntil(dateOnly: string): number {
  const target = parseDateOnly(dateOnly)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function daysLeftLabel(days: number): string {
  if (days === 0) return 'Bugün'
  if (days === 1) return '1 gün kaldı'
  if (days < 0) return `${Math.abs(days)} gün geçti`
  return `${days} gün kaldı`
}

export function nextBirthdayDate(
  birthMonth: number,
  birthDay: number,
  from: Date = new Date(),
): Date {
  const year = from.getFullYear()
  let next = new Date(year, birthMonth - 1, birthDay)
  next.setHours(0, 0, 0, 0)
  const today = new Date(from)
  today.setHours(0, 0, 0, 0)
  if (next < today) {
    next = new Date(year + 1, birthMonth - 1, birthDay)
  }
  return next
}

export function ageOnNextBirthday(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
): number {
  const next = nextBirthdayDate(birthMonth, birthDay)
  return next.getFullYear() - birthYear
}

export function firstErrorMessage(
  errors: Record<string, string[]> | undefined,
  fallback = 'Bir hata oluştu',
): string {
  if (!errors) return fallback
  for (const messages of Object.values(errors)) {
    const first = messages[0]
    if (first) return first
  }
  return fallback
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
