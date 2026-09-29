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
        'inline-flex w-full rounded-[14px] bg-[#F1F1EF] p-1 dark:bg-[#2C2C2E]',
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
              'min-h-10 flex-1 rounded-[11px] px-2 text-[13px] font-medium',
              active
                ? 'bg-soft-blue text-accent dark:bg-[#3A3A3C] dark:text-text'
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
