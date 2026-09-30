import { useAuth } from '../context/AuthContext'
import { Avatar } from './Avatar'
import { NotificationsBell } from './NotificationsBell'
import { ThemeToggle } from './ThemeToggle'

function displayNameFromEmail(email: string | undefined): string {
  if (!email) return 'Life'
  const local = email.split('@')[0] ?? email
  if (!local.includes('.')) return local
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export function AppTopBar() {
  const { user } = useAuth()
  const name = displayNameFromEmail(user?.email)

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-5 border-b border-border bg-surface/85 px-4 py-3 backdrop-blur-md lg:-mx-8 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[14px] text-secondary">
          Hoş geldiniz,{' '}
          <span className="font-medium text-text">{name}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <NotificationsBell />
          <Avatar />
        </div>
      </div>
    </header>
  )
}
