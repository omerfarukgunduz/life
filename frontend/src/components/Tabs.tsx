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
        'flex gap-1 overflow-x-auto border-b border-border',
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
              'min-h-11 shrink-0 px-3 text-sm font-medium',
              active
                ? 'border-b-2 border-accent text-accent'
                : 'border-b-2 border-transparent text-secondary',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
