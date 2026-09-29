import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

type PageHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  actions?: ReactNode
  trailing?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  action,
  actions,
  trailing,
  className,
}: PageHeaderProps) {
  const right = actions ?? action
  return (
    <header
      className={cn(
        'mb-5 flex items-end justify-between gap-3',
        className,
      )}
    >
      <div className="min-w-0">
        {subtitle ? (
          <p className="mb-1 text-[13px] capitalize text-secondary">{subtitle}</p>
        ) : null}
        <h1 className="text-[32px] font-bold leading-[1.05] tracking-[-0.03em] text-text">
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {trailing}
        {right ? <div className="hidden items-center gap-1 lg:flex">{right}</div> : null}
      </div>
    </header>
  )
}
