import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, label, error, hint, id, ...props }, ref) {
    const inputId = id ?? props.name

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="subheadline font-medium text-text">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'min-h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-[17px] text-text placeholder:text-secondary',
            'transition-[border-color,box-shadow] duration-200 focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/12',
            error && 'border-danger',
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="footnote text-danger" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p className="footnote text-secondary">{hint}</p>
        ) : null}
      </div>
    )
  },
)
