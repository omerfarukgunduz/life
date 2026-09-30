import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

type ListSectionProps = {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  settingsStyle?: boolean
  compactTitle?: boolean
}

export function ListSection({
  title,
  action,
  children,
  className,
  settingsStyle = false,
  compactTitle = false,
}: ListSectionProps) {
  const smallTitle = settingsStyle || compactTitle

  return (
    <section className={cn('mb-6 last:mb-0', className)}>
      {title || action ? (
        <div
          className={cn(
            'flex items-baseline justify-between gap-3',
            smallTitle ? 'mb-1.5 px-4' : 'mb-2',
          )}
        >
          {title ? (
            <h2
              className={cn(
                smallTitle ? 'section-header' : 'title-3 text-text',
              )}
            >
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action ? (
            <div className="shrink-0 self-center">{action}</div>
          ) : null}
        </div>
      ) : null}
      <div className="grouped-list">{children}</div>
    </section>
  )
}
