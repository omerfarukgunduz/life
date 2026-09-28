import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { useState } from 'react'
import {
  BottomSheet,
  Button,
  Dialog,
  EmptyState,
  PageHeader,
  Tabs,
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

      <Tabs
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

      <ul>
        {data.map((book) => (
          <li key={book.id}>
            <button
              type="button"
              className="flex w-full min-h-11 flex-col items-start border-b border-border py-3 text-left last:border-b-0"
              onClick={() => setEditing(book)}
            >
              <p className="text-[15px] font-medium text-text">{book.title}</p>
              <p className="text-[13px] text-secondary">{book.author}</p>
              {book.status === 'Read' ? (
                <div className="mt-1 flex items-center gap-2 text-[13px] text-secondary">
                  <span>{statusLabel.Read}</span>
                  {book.rating != null ? (
                    <span className="inline-flex items-center gap-0.5">
                      <Star size={12} className="fill-text text-text" />
                      {book.rating}
                    </span>
                  ) : null}
                </div>
              ) : null}
              {book.note ? (
                <p className="mt-1 line-clamp-2 text-[13px] text-secondary">{book.note}</p>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

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
