import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

type BadgeProps = {
  children: ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-soft-blue px-2 py-0.5 text-[11px] font-medium text-accent',
        className,
      )}
    >
      {children}
    </span>
  )
}
