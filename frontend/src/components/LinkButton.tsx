import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '../utils/cn'

export function linkButtonClassName(options?: { compact?: boolean; fullWidth?: boolean }) {
  return cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-button)] bg-transparent px-4 text-[17px] font-semibold text-accent transition-opacity duration-200 active:opacity-70',
    options?.compact && 'min-h-9 px-3 text-[15px]',
    !options?.compact && 'min-h-11',
    options?.fullWidth && 'w-full',
  )
}

type LinkButtonProps = LinkProps & {
  compact?: boolean
  fullWidth?: boolean
}

export function LinkButton({
  className,
  compact,
  fullWidth,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(linkButtonClassName({ compact, fullWidth }), className)}
      {...props}
    />
  )
}

type TextButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  compact?: boolean
  fullWidth?: boolean
}

export function TextButton({
  className,
  compact,
  fullWidth,
  type = 'button',
  ...props
}: TextButtonProps) {
  return (
    <button
      type={type}
      className={cn(linkButtonClassName({ compact, fullWidth }), className)}
      {...props}
    />
  )
}
