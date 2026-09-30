import { SegmentControl } from './SegmentControl'

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
    <SegmentControl
      items={items}
      value={value}
      onChange={onChange}
      className={className}
    />
  )
}
