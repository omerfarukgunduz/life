import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IconTile, PageHeader } from '../../components'
import { birthdaysApi, booksApi, contestsApi, ideasApi } from '../../services/endpoints'
import { collectionIcons } from '../../utils/collectionIcons'

const links = [
  {
    to: '/collections/books',
    title: 'Kitaplar',
    description: 'Okuma listesi',
    unit: 'kitap',
    key: 'books',
    ...collectionIcons.books,
  },
  {
    to: '/collections/birthdays',
    title: 'Doğum Günleri',
    description: 'Yaklaşan kutlamalar',
    unit: 'kişi',
    key: 'birthdays',
    ...collectionIcons.birthdays,
  },
  {
    to: '/collections/contests',
    title: 'Fotoğraf Yarışmaları',
    description: 'Son başvuru tarihleri',
    unit: 'yarışma',
    key: 'contests',
    ...collectionIcons.contests,
  },
  {
    to: '/collections/ideas',
    title: 'Fikirler',
    description: 'Kısa notlar',
    unit: 'fikir',
    key: 'ideas',
    ...collectionIcons.ideas,
  },
] as const

export default function CollectionsPage() {
  const books = useQuery({ queryKey: ['books', 'count'], queryFn: () => booksApi.list() })
  const birthdays = useQuery({
    queryKey: ['birthdays', 'count'],
    queryFn: () => birthdaysApi.list('all'),
  })
  const contests = useQuery({ queryKey: ['contests', 'count'], queryFn: () => contestsApi.list() })
  const ideas = useQuery({ queryKey: ['ideas', 'count'], queryFn: () => ideasApi.list() })

  const counts: Record<(typeof links)[number]['key'], number | undefined> = {
    books: books.data?.length,
    birthdays: birthdays.data?.length,
    contests: contests.data?.length,
    ideas: ideas.data?.length,
  }

  return (
    <section>
      <PageHeader title="Koleksiyonlar" />
      <ul className="space-y-3">
        {links.map((item) => {
          const count = counts[item.key]
          return (
            <li key={item.to}>
              <Link to={item.to} className="surface flex items-center gap-3 p-4">
                <IconTile icon={item.icon} bg={item.bg} fg={item.fg} size="lg" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold text-text">{item.title}</span>
                  <span className="mt-0.5 block text-[13px] text-secondary">{item.description}</span>
                  {count != null ? (
                    <span className="mt-2 block text-[12px] text-secondary">
                      {count} {item.unit}
                    </span>
                  ) : null}
                </span>
                <ChevronRight size={18} className="shrink-0 text-[#C8C8C6]" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
