import { cn } from '../utils/cn'

export type TabItem = {
  id: string
  label: string
}

type TabsProps = {
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex w-full gap-1 overflow-x-auto rounded-[14px] bg-[#F1F1EF] p-1 dark:bg-[#2C2C2E]',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'min-h-10 flex-1 shrink-0 rounded-[11px] px-3 text-[13px] font-medium',
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
