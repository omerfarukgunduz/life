import { Button } from './Button'

type EmptyStateProps = {
  title?: string
  description?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const text = message ?? title ?? ''
  return (
    <div className="px-4 py-6 text-center">
      <p className="subheadline text-secondary">{text}</p>
      {description ? <p className="footnote mt-1 text-secondary">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="ghost" size="sm" className="mt-2 min-h-11" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
