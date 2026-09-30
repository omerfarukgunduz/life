import type { Dashboard, TodayReminder, UpcomingType } from '../../types'
import { formatClock, getTimeZone } from '../../utils'

export type TodayNotification = {
  id: string
  type: UpcomingType
  title: string
  subtitle: string
  href: string
  reminderAt: string | null
  sent: boolean
}

const typeLabel: Record<UpcomingType, string> = {
  task: 'İş',
  birthday: 'Doğum günü',
  contest: 'Yarışma',
}

const typeHref: Record<UpcomingType, string> = {
  task: '/tasks',
  birthday: '/collections/birthdays',
  contest: '/collections/contests',
}

function formatReminderClock(isoUtc: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: getTimeZone(),
  }).format(new Date(isoUtc))
}

function subtitleForReminder(item: TodayReminder): string {
  const clock = formatReminderClock(item.reminderAt)
  const kind = typeLabel[item.type]
  if (item.sent) return `${kind} · Bildirim ${clock} (gönderildi)`
  return `${kind} · Bildirim ${clock}`
}

function mapReminder(item: TodayReminder): TodayNotification {
  const type = item.type
  return {
    id: `${type}-${item.entityId}-${item.reminderAt}`,
    type,
    title: item.title,
    subtitle: subtitleForReminder(item),
    href: typeHref[type],
    reminderAt: item.reminderAt,
    sent: item.sent,
  }
}

/** API'den gelen bugünkü hatırlatma kayıtları (planlanan saat dahil). */
export function buildTodayNotificationsFromReminders(
  data: Dashboard | undefined,
): TodayNotification[] {
  const reminders = data?.todayReminders ?? []
  return reminders.map(mapReminder)
}

/** Hatırlatma kaydı yoksa bugünkü öğeler (saat bilgisi olmadan). */
export function buildTodayNotificationsFallback(
  data: Dashboard | undefined,
  todayKey: string,
): TodayNotification[] {
  if (!data) return []

  const items: TodayNotification[] = []

  for (const task of data.todayTasks) {
    const time = formatClock(task.dueTime)
    const parts = [typeLabel.task, time, 'Varsayılan bildirim saati ayarlardan']
      .filter(Boolean)
      .join(' · ')
    items.push({
      id: `task-${task.id}`,
      type: 'task',
      title: task.title,
      subtitle: parts,
      href: typeHref.task,
      reminderAt: null,
      sent: false,
    })
  }

  for (const item of data.upcoming) {
    if (item.date !== todayKey) continue
    if (item.type === 'task') continue
    items.push({
      id: `${item.type}-${item.entityId}`,
      type: item.type,
      title: item.title,
      subtitle: `${typeLabel[item.type]} · Bildirim saati ayarlardan`,
      href: typeHref[item.type],
      reminderAt: null,
      sent: false,
    })
  }

  return items
}

export function buildTodayNotifications(
  data: Dashboard | undefined,
  todayKey: string,
): TodayNotification[] {
  const fromReminders = buildTodayNotificationsFromReminders(data)
  if (fromReminders.length > 0) return fromReminders
  return buildTodayNotificationsFallback(data, todayKey)
}

export function reminderScheduleHint(reminderTime: string): string {
  return `Doğum günü ve yarışma hatırlatmaları yerel saatinize göre ${reminderTime} civarında gönderilir. İşlerde vade saati varsa o saatte, yoksa ${reminderTime} kullanılır. Push genelde bir dakika içinde iletilir.`
}
