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
  primary:
    'bg-[#171717] text-white dark:bg-[#F5F5F5] dark:text-[#171717]',
  secondary:
    'bg-surface text-text border border-border',
  ghost: 'bg-transparent text-text',
  danger: 'bg-transparent text-red-600 dark:text-red-400',
}

const sizeClass: Record<Size, string> = {
  md: 'min-h-11 px-4 text-[15px]',
  sm: 'min-h-11 px-3 text-sm',
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
        'inline-flex items-center justify-center gap-2 rounded-[12px] font-medium transition-opacity disabled:opacity-40',
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
