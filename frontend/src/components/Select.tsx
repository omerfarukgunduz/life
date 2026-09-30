import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type Option = {
  value: string
  label: string
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  options: Option[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { className, label, error, id, options, placeholder, ...props },
    ref,
  ) {
    const inputId = id ?? props.name

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="subheadline font-medium text-text">
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'min-h-11 w-full appearance-none rounded-[var(--radius-input)] border border-border bg-surface px-3 text-[17px] text-text transition-[border-color,box-shadow] duration-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,122,255,0.12)]',
            error && 'border-red-500',
            className,
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)
