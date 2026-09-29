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
  PageHeader,
  SegmentControl,
} from '../../components'
import { DesktopAddButton } from '../../layouts/AppShell'
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
        action={<DesktopAddButton onClick={() => openCreate('book')} label="Ekle" />}
      />

      <SegmentControl
        ariaLabel="Kitap durumu"
        className="mb-4"
        items={tabs}
        value={status}
        onChange={(id) => setStatus(id as BookStatus)}
      />

      {isLoading ? (
        <div className="space-y-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-[10px] bg-surface" />
          ))}
        </div>
      ) : null}

      {!isLoading && data.length === 0 ? (
        <EmptyState
          message={
            status === 'Reading'
              ? 'Şu anda okuduğun bir kitap yok.'
              : 'Kitap yok.'
          }
          actionLabel="Kitap ekle"
          onAction={() => openCreate('book')}
        />
      ) : null}

      {data.length > 0 ? (
      <ul className="surface divide-y divide-divider px-4">
        {data.map((book) => (
          <li key={book.id}>
            <button
              type="button"
              className="flex w-full items-center gap-3 py-3 text-left"
              onClick={() => setEditing(book)}
            >
              <BookCover title={book.title} author={book.author} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-text">
                  {book.title}
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-secondary">
                  {book.author}
                </span>
                {book.status === 'Reading' ? (
                  <span className="mt-2 block text-[12px] text-secondary">Okuyorum</span>
                ) : null}
                {book.status === 'WantToRead' ? (
                  <span className="mt-2 block text-[12px] text-secondary">
                    {statusLabel.WantToRead}
                  </span>
                ) : null}
                {book.status === 'Read' ? (
                  <span className="mt-2 flex items-center gap-2 text-[12px] text-secondary">
                    {book.rating != null ? (
                      <span className="inline-flex items-center gap-0.5 text-text">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            key={index}
                            size={12}
                            className={
                              index < book.rating!
                                ? 'fill-[#111111] text-[#111111] dark:fill-white dark:text-white'
                                : 'text-[#D4D4D2]'
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
