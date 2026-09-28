import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type DatePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
  error?: string
  mode?: 'date' | 'time' | 'datetime-local'
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker(
    { className, label, error, id, mode = 'date', ...props },
    ref,
  ) {
    const inputId = id ?? props.name

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-text">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          type={mode}
          className={cn(
            'min-h-11 w-full rounded-[12px] border border-border bg-surface px-3 text-base text-text',
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
