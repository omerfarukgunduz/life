import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'sm'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-accent text-white active:opacity-80',
  secondary: 'bg-bg text-accent active:opacity-70 dark:bg-surface-secondary',
  ghost: 'bg-transparent text-accent active:opacity-60',
  danger: 'bg-transparent text-danger active:opacity-70',
}

const sizeClass: Record<Size, string> = {
  md: 'min-h-11 px-4 text-[17px] font-semibold',
  sm: 'min-h-11 px-3 text-[15px] font-medium',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth,
  type = 'button',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-button)] transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-40',
        variantClass[variant],
        sizeClass[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
