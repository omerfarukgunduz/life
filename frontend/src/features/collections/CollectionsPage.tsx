import { Link } from 'react-router-dom'
import { BookOpen, Cake, Camera, ChevronRight, Lightbulb } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'

const links = [
  {
    to: '/collections/books',
    title: 'Kitaplar',
    description: 'Okuma listesi ve notlar',
    icon: BookOpen,
  },
  {
    to: '/collections/birthdays',
    title: 'Doğum Günleri',
    description: 'Yaklaşan kutlamalar',
    icon: Cake,
  },
  {
    to: '/collections/contests',
    title: 'Fotoğraf Yarışmaları',
    description: 'Son başvuru tarihleri',
    icon: Camera,
  },
  {
    to: '/collections/ideas',
    title: 'Fikirler',
    description: 'Hızlı notlar',
    icon: Lightbulb,
  },
]

export default function CollectionsPage() {
  return (
    <section>
      <PageHeader title="Koleksiyonlar" />
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="flex min-h-11 items-center gap-3 border-b border-border py-3 last:border-b-0"
            >
              <link.icon size={18} strokeWidth={1.75} className="shrink-0 text-secondary" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-text">{link.title}</p>
                <p className="text-[13px] text-secondary">{link.description}</p>
              </div>
              <ChevronRight size={18} strokeWidth={1.75} className="text-secondary" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
