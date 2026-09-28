import { cn } from '../utils/cn'

export type ToastTone = 'default' | 'success' | 'error'

type ToastProps = {
  message: string
  tone?: ToastTone
  className?: string
}

export function Toast({ message, tone = 'default', className }: ToastProps) {
  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto max-w-sm rounded-[12px] border border-border bg-surface px-4 py-2.5 text-[14px] text-text shadow-soft',
        tone === 'error' && 'text-red-600 dark:text-red-400',
        className,
      )}
    >
      {message}
    </div>
  )
}
