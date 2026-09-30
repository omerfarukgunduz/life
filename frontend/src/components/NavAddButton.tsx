import { Plus } from 'lucide-react'

type NavAddButtonProps = {
  onClick: () => void
  label?: string
}

export function NavAddButton({ onClick, label = 'Ekle' }: NavAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-11 items-center justify-center text-accent transition-opacity duration-200 active:opacity-60"
    >
      <Plus size={24} strokeWidth={2} />
    </button>
  )
}
