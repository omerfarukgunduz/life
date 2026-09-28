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
    <div className="py-6 text-[14px] text-secondary">
      <p className="text-[14px] font-medium text-secondary">{text}</p>
      {description ? <p className="mt-1 text-[13px]">{description}</p> : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 text-[14px] font-medium text-accent"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
