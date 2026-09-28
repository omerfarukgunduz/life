import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

type PageHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  action,
  actions,
  className,
}: PageHeaderProps) {
  const right = actions ?? action
  return (
    <header
      className={cn(
        'mb-5 flex items-start justify-between gap-3',
        className,
      )}
    >
      <div className="min-w-0">
        {subtitle ? (
          <p className="mb-1 text-[13px] capitalize text-secondary">{subtitle}</p>
        ) : null}
        <h1 className="text-[22px] font-semibold tracking-tight text-text">
          {title}
        </h1>
      </div>
      {right ? (
        <div className="hidden shrink-0 items-center gap-1 lg:flex">{right}</div>
      ) : null}
    </header>
  )
}
