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
        'inline-flex w-full rounded-[12px] border border-border bg-surface p-1',
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
              'min-h-10 flex-1 rounded-[10px] px-3 text-sm font-medium',
              active
                ? 'bg-[#171717] text-white dark:bg-[#F5F5F5] dark:text-[#171717]'
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
