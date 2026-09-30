import { cn } from '../utils/cn'

export type SegmentItem = {
  id: string
  label: string
}

type SegmentControlProps = {
  items: SegmentItem[]
  value: string
  onChange: (id: string) => void
  className?: string
  ariaLabel?: string
}

export function SegmentControl({
  items,
  value,
  onChange,
  className,
  ariaLabel,
}: SegmentControlProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex h-9 w-full items-center rounded-[9px] bg-segment-track p-0.5',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'flex h-full min-w-0 flex-1 items-center justify-center rounded-[7px] px-1 text-[13px] font-medium leading-none whitespace-nowrap transition-all duration-200',
              active
                ? 'bg-surface text-text shadow-[var(--shadow-segment)]'
                : 'text-secondary',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
