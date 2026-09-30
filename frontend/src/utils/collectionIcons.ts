import type { LucideIcon } from 'lucide-react'
import { BookOpen, Cake, Camera, CheckSquare, Lightbulb } from 'lucide-react'

export type IconStyle = {
  icon: LucideIcon
  bg: string
  fg: string
}

export const collectionIcons = {
  books: {
    icon: BookOpen,
    bg: 'bg-soft-purple',
    fg: 'text-[#5856D6] dark:text-[#5E5CE6]',
  },
  birthdays: {
    icon: Cake,
    bg: 'bg-soft-pink',
    fg: 'text-danger',
  },
  contests: {
    icon: Camera,
    bg: 'bg-soft-yellow',
    fg: 'text-warning',
  },
  ideas: {
    icon: Lightbulb,
    bg: 'bg-soft-yellow',
    fg: 'text-warning',
  },
} as const satisfies Record<string, IconStyle>

export const quickAddOptions = [
  { id: 'task' as const, label: 'İş', icon: CheckSquare, bg: 'bg-soft-blue', fg: 'text-accent' },
  { id: 'birthday' as const, label: 'Doğum günü', ...collectionIcons.birthdays },
  { id: 'contest' as const, label: 'Yarışma', ...collectionIcons.contests },
  { id: 'book' as const, label: 'Kitap', ...collectionIcons.books },
  { id: 'idea' as const, label: 'Fikir', ...collectionIcons.ideas },
]
