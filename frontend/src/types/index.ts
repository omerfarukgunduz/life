export type Priority = 'Low' | 'Normal' | 'High'
export type ContestStatus = 'Interested' | 'Applied' | 'Completed'
export type BookStatus = 'Reading' | 'WantToRead' | 'Read'
export type TaskFilter = 'today' | 'upcoming' | 'all' | 'completed'
export type BirthdayFilter = 'month' | 'upcoming' | 'all'
export type CalendarItemType = 'task' | 'birthday' | 'contest'
export type UpcomingType = 'task' | 'birthday' | 'contest'
export type ThemeMode = 'system' | 'light' | 'dark'

export interface AuthResponse {
  token: string
  userId: string
  email: string
}

export interface UserMe {
  id: string
  email: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  dueTime: string | null
  priority: Priority
  category: string | null
  isCompleted: boolean
  createdAt: string
  completedAt: string | null
}

export interface TaskInput {
  title: string
  description?: string | null
  dueDate?: string | null
  dueTime?: string | null
  priority?: Priority
  category?: string | null
  isCompleted?: boolean
}

export interface Birthday {
  id: string
  name: string
  birthMonth: number
  birthDay: number
  birthYear: number | null
  note: string | null
  reminderDaysBefore: number[]
  createdAt: string
}

export interface BirthdayInput {
  name: string
  birthMonth: number
  birthDay: number
  birthYear?: number | null
  note?: string | null
  reminderDaysBefore?: number[]
}

export interface Contest {
  id: string
  title: string
  deadline: string
  url: string | null
  description: string | null
  status: ContestStatus
  reminderDaysBefore: number[]
  createdAt: string
}

export interface ContestInput {
  title: string
  deadline: string
  url?: string | null
  description?: string | null
  status?: ContestStatus
  reminderDaysBefore?: number[]
}

export interface Book {
  id: string
  title: string
  author: string
  status: BookStatus
  rating: number | null
  note: string | null
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
}

export interface BookInput {
  title: string
  author: string
  status?: BookStatus
  rating?: number | null
  note?: string | null
  startedAt?: string | null
  finishedAt?: string | null
}

export interface Idea {
  id: string
  title: string
  content: string | null
  createdAt: string
  updatedAt: string
}

export interface IdeaInput {
  title: string
  content?: string | null
}

export interface UpcomingItem {
  date: string
  type: UpcomingType
  title: string
  subtitle: string | null
  entityId: string
}

export interface Dashboard {
  todayTasks: Task[]
  upcoming: UpcomingItem[]
  readingBook: Book | null
}

export interface CalendarItem {
  date: string
  time: string | null
  type: CalendarItemType
  title: string
  entityId: string
}

export type CalendarEvent = CalendarItem
export type CalendarEventType = CalendarItemType

export interface UserSettings {
  timeZone: string
  notifyTasks: boolean
  notifyBirthdays: boolean
  notifyContests: boolean
}

export type Settings = UserSettings

export interface PushSubscribeInput {
  endpoint: string
  p256dh: string
  auth: string
}

export interface ExportData {
  version: 1
  tasks: Task[]
  birthdays: Birthday[]
  contests: Contest[]
  books: Book[]
  ideas: Idea[]
}

export interface ApiProblemDetails {
  title?: string
  detail?: string
  status?: number
  errors?: Record<string, string[]>
}
