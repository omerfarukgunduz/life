import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Avatar() {
  const { user } = useAuth()
  const letter = (user?.email?.trim()[0] ?? 'L').toUpperCase()

  return (
    <Link
      to="/settings"
      aria-label="Ayarlar"
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E8E8E6] text-[14px] font-semibold text-text dark:bg-[#2A2A2A]"
    >
      {letter}
    </Link>
  )
}
