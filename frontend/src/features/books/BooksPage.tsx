import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { formatShortDate } from '../../utils'
import { useState } from 'react'
import {
  BookCover,
  BottomSheet,
  Button,
  Dialog,
  EmptyState,
  ListSection,
  NavAddButton,
  PageHeader,
  SegmentControl,
} from '../../components'
import { useQuickAdd } from '../../hooks/useQuickAdd'
import { useToast } from '../../context/ToastContext'
import { booksApi } from '../../services/endpoints'
import type { Book, BookStatus } from '../../types'
import { BookForm } from './BookForm'

const tabs: { id: BookStatus; label: string }[] = [
  { id: 'Reading', label: 'Okuyorum' },
  { id: 'WantToRead', label: 'Okuyacağım' },
  { id: 'Read', label: 'Okudum' },
]

const statusLabel: Record<BookStatus, string> = {
  Reading: 'Okuyorum',
  WantToRead: 'Okumak istiyorum',
  Read: 'Okudum',
}

export default function BooksPage() {
  const [status, setStatus] = useState<BookStatus>('Reading')
  const [editing, setEditing] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState<Book | null>(null)
  const { openCreate } = useQuickAdd()
  const { toast } = useToast()
  const qc = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ['books', status],
    queryFn: () => booksApi.list(status),
  })

  const remove = useMutation({
    mutationFn: (id: string) => booksApi.remove(id),
    onSuccess: async () => {
      setDeleting(null)
      setEditing(null)
      await qc.invalidateQueries({ queryKey: ['books'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast('Kitap silindi')
    },
  })

  return (
    <section>
      <PageHeader
        title="Kitaplar"
        trailing={<NavAddButton onClick={() => openCreate('book')} label="Kitap ekle" />}
      />

      <SegmentControl
        ariaLabel="Kitap durumu"
        className="mb-4"
        items={tabs}
        value={status}
        onChange={(id) => setStatus(id as BookStatus)}
      />

      {isLoading ? (
        <div className="grouped-list px-4 py-3" aria-hidden>
          <div className="h-14 animate-pulse rounded-[8px] bg-bg" />
        </div>
      ) : null}

      {!isLoading && data.length === 0 ? (
        <EmptyState
          message={
            status === 'Reading'
              ? 'Şu anda okuduğun bir kitap yok.'
              : 'Henüz kitap eklemedin.'
          }
          actionLabel="Kitap ekle"
          onAction={() => openCreate('book')}
        />
      ) : null}

      {data.length > 0 ? (
        <ListSection>
          <ul>
            {data.map((book) => (
              <li key={book.id}>
                <button
                  type="button"
                  className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left active:opacity-70"
                  onClick={() => setEditing(book)}
                >
                  <BookCover title={book.title} author={book.author} />
                  <span className="min-w-0 flex-1">
                    <span className="headline block truncate text-text">{book.title}</span>
                    <span className="subheadline mt-0.5 block truncate text-secondary">
                      {book.author}
                    </span>
                    {book.status === 'Reading' ? (
                      <span className="caption-text mt-1 block text-secondary">
                        {statusLabel.Reading}
                      </span>
                    ) : null}
                    {book.status === 'WantToRead' ? (
                      <span className="caption-text mt-1 block text-secondary">
                        {statusLabel.WantToRead}
                      </span>
                    ) : null}
                    {book.status === 'Read' ? (
                      <span className="caption-text mt-1 flex flex-wrap items-center gap-2 text-secondary">
                        {book.rating != null ? (
                          <span className="inline-flex items-center gap-0.5 text-text">
                            {Array.from({ length: 5 }, (_, index) => (
                              <Star
                                key={index}
                                size={12}
                                className={
                                  index < book.rating!
                                    ? 'fill-accent text-accent'
                                    : 'text-tertiary'
                                }
                              />
                            ))}
                          </span>
                        ) : (
                          <span>{statusLabel.Read}</span>
                        )}
                        {book.finishedAt ? <span>{formatShortDate(book.finishedAt)}</span> : null}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </ListSection>
      ) : null}

      <BottomSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Kitabı düzenle"
      >
        {editing ? (
          <div className="space-y-4">
            <BookForm initial={editing} onDone={() => setEditing(null)} />
            <Button variant="danger" fullWidth onClick={() => setDeleting(editing)}>
              Sil
            </Button>
          </div>
        ) : null}
      </BottomSheet>

      <Dialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Kitabı sil?"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        danger
        busy={remove.isPending}
      />
    </section>
  )
}
