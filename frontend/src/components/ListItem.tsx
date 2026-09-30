import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '../utils/cn'

type ListItemProps = {
  title: string
  subtitle?: string
  leading?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
  className?: string
  showChevron?: boolean
  chevron?: boolean
  muted?: boolean
}

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onClick,
  className,
  showChevron,
  chevron,
  muted,
}: ListItemProps) {
  const withChevron = showChevron ?? chevron
  const content = (
    <>
      {leading ? (
        <div className="flex shrink-0 items-center justify-center text-secondary">
          {leading}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-text">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 truncate text-[13px] text-secondary">{subtitle}</p>
        ) : null}
      </div>
      {trailing}
      {withChevron ? (
        <ChevronRight
          size={18}
          strokeWidth={1.75}
          className="shrink-0 text-secondary"
          aria-hidden
        />
      ) : null}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
        'flex w-full min-h-14 items-center gap-3 px-4 py-2.5 text-left last:border-b-0',
          muted && 'opacity-50',
          className,
        )}
      >
        {content}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'flex min-h-14 items-center gap-3 px-4 py-2.5 last:border-b-0',
        muted && 'opacity-50',
        className,
      )}
    >
      {content}
    </div>
  )
}
