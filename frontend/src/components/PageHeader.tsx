import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

type PageHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  actions?: ReactNode
  trailing?: ReactNode
  className?: string
  large?: boolean
}

export function PageHeader({
  title,
  subtitle,
  action,
  actions,
  trailing,
  className,
  large = true,
}: PageHeaderProps) {
  const right = trailing ?? actions ?? action
  return (
    <header className={cn('mb-5 flex items-start justify-between gap-3', className)}>
      <div className="min-w-0 flex-1">
        {subtitle ? (
          <p className="subheadline mb-1 text-secondary">{subtitle}</p>
        ) : null}
        <h1 className={cn(large ? 'large-title text-text' : 'title-2 text-text')}>
          {title}
        </h1>
      </div>
      {right ? (
        <div
          className={cn(
            'flex shrink-0 items-center gap-0',
            large ? 'h-11' : 'h-7',
          )}
        >
          {right}
        </div>
      ) : null}
    </header>
  )
}
