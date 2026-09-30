export const TURKISH_MONTH_LABELS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
] as const

export function monthSelectOptions() {
  return TURKISH_MONTH_LABELS.map((label, index) => ({
    value: String(index + 1),
    label,
  }))
}

/** Yıl bilinmiyorsa (doğum günü) artık yıl referansı kullanılır. */
export function daysInMonth(month: number, year?: number): number {
  const y = year ?? 2000
  return new Date(y, month, 0).getDate()
}

export function parseIsoDateParts(iso: string): {
  day: string
  month: string
  year: string
} {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return { day: '', month: '', year: '' }
  }
  const [y, m, d] = iso.split('-')
  return {
    year: y ?? '',
    month: m ? String(Number(m)) : '',
    day: d ? String(Number(d)) : '',
  }
}

export function composeIsoDate(day: string, month: string, year: string): string {
  if (!day || !month || !year) return ''
  const y = Number(year)
  const m = Number(month)
  const d = Number(day)
  if (!y || !m || !d) return ''
  const max = daysInMonth(m, y)
  if (d < 1 || d > max) return ''
  return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
