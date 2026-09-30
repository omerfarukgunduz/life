import type { LucideIcon } from 'lucide-react'
import { Camera, Check, Code2, Flag, Gift, MoreHorizontal, Trophy } from 'lucide-react'
import type { UpcomingType } from '../types'
import { cn } from '../utils/cn'

type Tone = {
  icon: LucideIcon
  bg: string
  fg: string
  dot?: string
}

const categoryTones: Record<string, Tone> = {
  Kişisel: { icon: Check, bg: 'bg-soft-blue', fg: 'text-accent' },
  Fotoğraf: { icon: Camera, bg: 'bg-soft-purple', fg: 'text-[#AF52DE] dark:text-[#BF5AF2]' },
  İş: { icon: Flag, bg: 'bg-soft-pink', fg: 'text-danger' },
  Yazılım: { icon: Code2, bg: 'bg-soft-blue', fg: 'text-accent' },
  Diğer: { icon: MoreHorizontal, bg: 'bg-soft-yellow', fg: 'text-warning' },
}

const typeTones: Record<UpcomingType, Tone> = {
  task: { icon: Check, bg: 'bg-soft-blue', fg: 'text-accent', dot: 'bg-accent' },
  birthday: { icon: Gift, bg: 'bg-soft-pink', fg: 'text-danger', dot: 'bg-danger' },
  contest: { icon: Trophy, bg: 'bg-soft-yellow', fg: 'text-warning', dot: 'bg-warning' },
}

const fallbackTone: Tone = {
  icon: MoreHorizontal,
  bg: 'bg-soft-yellow',
  fg: 'text-warning',
}

export function categoryTone(category: string | null | undefined): Tone {
  if (category && categoryTones[category]) return categoryTones[category]
  return fallbackTone
}

export function typeTone(type: UpcomingType): Tone {
  return typeTones[type]
}

export function IconTile({
  icon: Icon,
  bg,
  fg,
  size = 'md',
}: Tone & { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[10px]',
        size === 'sm' && 'size-8',
        size === 'md' && 'size-9',
        size === 'lg' && 'size-11',
        bg,
        fg,
      )}
      aria-hidden
    >
      <Icon size={size === 'lg' ? 22 : 16} strokeWidth={1.75} />
    </span>
  )
}
