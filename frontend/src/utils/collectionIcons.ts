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
    bg: 'bg-soft-green',
    fg: 'text-[#3D8B5F] dark:text-[#6BCF96]',
  },
  birthdays: {
    icon: Cake,
    bg: 'bg-soft-pink',
    fg: 'text-[#D4536A] dark:text-[#F08A9A]',
  },
  contests: {
    icon: Camera,
    bg: 'bg-soft-purple',
    fg: 'text-[#7C5CBF] dark:text-[#B49AE8]',
  },
  ideas: {
    icon: Lightbulb,
    bg: 'bg-soft-yellow',
    fg: 'text-[#C48A2A] dark:text-[#E5B86A]',
  },
} as const satisfies Record<string, IconStyle>

export const quickAddOptions = [
  { id: 'task' as const, label: 'Görev', icon: CheckSquare, bg: 'bg-soft-blue', fg: 'text-accent' },
  { id: 'birthday' as const, label: 'Doğum günü', ...collectionIcons.birthdays },
  { id: 'contest' as const, label: 'Yarışma', ...collectionIcons.contests },
  { id: 'book' as const, label: 'Kitap', ...collectionIcons.books },
  { id: 'idea' as const, label: 'Fikir', ...collectionIcons.ideas },
]
