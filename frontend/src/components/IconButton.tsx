import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  children: ReactNode
  variant?: 'plain' | 'soft'
}

export function IconButton({
  className,
  label,
  children,
  type = 'button',
  variant = 'plain',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-11 cursor-pointer items-center justify-center text-accent transition-opacity duration-200 active:opacity-60 disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'soft' && 'rounded-[var(--radius-control)] bg-surface-secondary text-secondary',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
