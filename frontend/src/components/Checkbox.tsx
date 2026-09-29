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
          'inline-flex min-h-11 cursor-pointer items-center gap-3',
          disabled && 'opacity-40',
          className,
        )}
      >
        <span className="relative inline-flex size-6 shrink-0 items-center justify-center">
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
              'flex size-[22px] items-center justify-center rounded-full border border-[#D4D4D2] bg-surface',
              'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
              checked && 'border-accent bg-accent text-white',
            )}
            aria-hidden
          >
            {checked ? <Check size={14} strokeWidth={2.5} /> : null}
          </span>
        </span>
        {label ? <span className="text-[15px] text-text">{label}</span> : null}
      </label>
    )
  },
)
