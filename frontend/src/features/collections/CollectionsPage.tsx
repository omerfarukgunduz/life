import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BottomSheet,
  IconTile,
  ListSection,
  NavAddButton,
  PageHeader,
} from '../../components'
import { birthdaysApi, booksApi, contestsApi, customCollectionsApi, ideasApi } from '../../services/endpoints'
import { collectionIcons } from '../../utils/collectionIcons'
import { customCollectionAppearance } from '../../utils/customCollectionTheme'
import { CustomCollectionForm } from './CustomCollectionForm'

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
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)

  const books = useQuery({ queryKey: ['books', 'count'], queryFn: () => booksApi.list() })
  const birthdays = useQuery({
    queryKey: ['birthdays', 'count'],
    queryFn: () => birthdaysApi.list('all'),
  })
  const contests = useQuery({ queryKey: ['contests', 'count'], queryFn: () => contestsApi.list() })
  const ideas = useQuery({ queryKey: ['ideas', 'count'], queryFn: () => ideasApi.list() })
  const custom = useQuery({
    queryKey: ['custom-collections'],
    queryFn: () => customCollectionsApi.list(),
  })

  const counts: Record<(typeof links)[number]['key'], number | undefined> = {
    books: books.data?.length,
    birthdays: birthdays.data?.length,
    contests: contests.data?.length,
    ideas: ideas.data?.length,
  }

  return (
    <section>
      <PageHeader
        title="Koleksiyonlar"
        trailing={
          <NavAddButton onClick={() => setCreateOpen(true)} label="Koleksiyon oluştur" />
        }
      />

      <ListSection title="Hazır koleksiyonlar" compactTitle>
        <ul>
          {links.map((item) => {
            const count = counts[item.key]
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex min-h-[60px] items-center gap-3 px-4 py-3 active:opacity-70"
                >
                  <IconTile icon={item.icon} bg={item.bg} fg={item.fg} size="lg" />
                  <span className="min-w-0 flex-1">
                    <span className="headline block text-text">{item.title}</span>
                    <span className="subheadline mt-0.5 block text-secondary">
                      {item.description}
                    </span>
                    {count != null ? (
                      <span className="caption-text mt-1 block text-secondary">
                        {count} {item.unit}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight size={17} className="shrink-0 text-tertiary" strokeWidth={2} />
                </Link>
              </li>
            )
          })}
        </ul>
      </ListSection>

      <ListSection title="Koleksiyonlarım" compactTitle>
        {custom.isLoading ? (
          <div className="px-4 py-3" aria-hidden>
            <div className="h-12 animate-pulse rounded-[8px] bg-bg" />
          </div>
        ) : null}
        {!custom.isLoading && (custom.data?.length ?? 0) === 0 ? (
          <p className="px-4 py-4 subheadline text-secondary">
            Henüz özel koleksiyon yok. Sağ üstteki + ile oluşturabilirsin.
          </p>
        ) : null}
        {(custom.data?.length ?? 0) > 0 ? (
          <ul>
            {custom.data!.map((item) => {
              const appearance = customCollectionAppearance(item.iconKey, item.colorKey)
              return (
              <li key={item.id}>
                <Link
                  to={`/collections/c/${item.id}`}
                  className="flex min-h-[60px] items-center gap-3 px-4 py-3 active:opacity-70"
                >
                  <IconTile {...appearance} size="lg" />
                  <span className="min-w-0 flex-1">
                    <span className="headline block truncate text-text">{item.name}</span>
                    {item.description ? (
                      <span className="subheadline mt-0.5 block truncate text-secondary">
                        {item.description}
                      </span>
                    ) : null}
                    <span className="caption-text mt-1 block text-secondary">
                      {item.itemCount} kayıt
                    </span>
                  </span>
                  <ChevronRight size={17} className="shrink-0 text-tertiary" strokeWidth={2} />
                </Link>
              </li>
            )})}
          </ul>
        ) : null}
      </ListSection>

      <BottomSheet open={createOpen} onClose={() => setCreateOpen(false)} title="Koleksiyon oluştur">
        <CustomCollectionForm
          onDone={() => setCreateOpen(false)}
          onCreated={(collection) => navigate(`/collections/c/${collection.id}`)}
        />
      </BottomSheet>
    </section>
  )
}
