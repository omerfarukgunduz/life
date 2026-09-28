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
        'inline-flex items-center rounded-[10px] border border-border bg-surface px-2 py-0.5 text-xs font-medium text-secondary',
        className,
      )}
    >
      {children}
    </span>
  )
}
