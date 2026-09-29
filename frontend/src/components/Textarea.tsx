import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, label, error, id, ...props }, ref) {
    const inputId = id ?? props.name

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-text">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'min-h-28 w-full resize-y rounded-[12px] border border-border bg-surface px-3 py-2.5 text-base text-text placeholder:text-secondary focus:border-accent',
            error && 'border-red-500',
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)
