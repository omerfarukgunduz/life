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
  Fotoğraf: { icon: Camera, bg: 'bg-soft-purple', fg: 'text-[#7C5CBF]' },
  İş: { icon: Flag, bg: 'bg-soft-pink', fg: 'text-[#D4536A]' },
  Yazılım: { icon: Code2, bg: 'bg-soft-blue', fg: 'text-accent' },
  Diğer: { icon: MoreHorizontal, bg: 'bg-soft-yellow', fg: 'text-[#C48A2A]' },
}

const typeTones: Record<UpcomingType, Tone> = {
  task: { icon: Check, bg: 'bg-soft-blue', fg: 'text-accent', dot: 'bg-accent' },
  birthday: { icon: Gift, bg: 'bg-soft-pink', fg: 'text-[#D4536A]', dot: 'bg-[#D4536A]' },
  contest: { icon: Trophy, bg: 'bg-soft-yellow', fg: 'text-[#C48A2A]', dot: 'bg-[#C48A2A]' },
}

const fallbackTone: Tone = {
  icon: MoreHorizontal,
  bg: 'bg-soft-yellow',
  fg: 'text-[#C48A2A]',
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
        'inline-flex shrink-0 items-center justify-center rounded-[12px]',
        size === 'sm' && 'size-9',
        size === 'md' && 'size-10',
        size === 'lg' && 'size-12 rounded-[14px]',
        bg,
        fg,
      )}
      aria-hidden
    >
      <Icon size={size === 'lg' ? 20 : 18} strokeWidth={1.75} />
    </span>
  )
}
