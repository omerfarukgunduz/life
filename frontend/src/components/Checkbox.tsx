import { forwardRef, type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../utils/cn'

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> & {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { className, label, checked, onChange, id, disabled, ...props },
    ref,
  ) {
    const inputId = id ?? props.name

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'inline-flex cursor-pointer items-center gap-3',
          label ? 'min-h-11' : 'size-[22px] justify-center',
          disabled && 'opacity-40',
          className,
        )}
      >
        <span className="relative inline-flex size-[22px] shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
            {...props}
          />
          <span
            className={cn(
              'flex size-[22px] items-center justify-center rounded-full border border-border bg-surface',
              'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
              'peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white',
            )}
            aria-hidden
          >
            <Check
              size={13}
              strokeWidth={2.5}
              className={cn('shrink-0', !checked && 'hidden')}
            />
          </span>
        </span>
        {label ? <span className="text-[17px] text-text">{label}</span> : null}
      </label>
    )
  },
)
