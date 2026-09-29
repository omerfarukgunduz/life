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
        'inline-flex items-center justify-center text-text',
        variant === 'soft'
          ? 'size-10 rounded-full border border-border bg-surface text-secondary'
          : 'size-11 rounded-[12px]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
