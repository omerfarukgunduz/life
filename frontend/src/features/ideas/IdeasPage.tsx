import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  BottomSheet,
  Button,
  Dialog,
  EmptyState,
  IconTile,
  ListSection,
  NavAddButton,
  PageHeader,
} from '../../components'
import { useQuickAdd } from '../../hooks/useQuickAdd'
import { useToast } from '../../context/ToastContext'
import { ideasApi } from '../../services/endpoints'
import type { Idea } from '../../types'
import { formatShortDate } from '../../utils'
import { collectionIcons } from '../../utils/collectionIcons'
import { IdeaForm } from './IdeaForm'

export default function IdeasPage() {
  const [editing, setEditing] = useState<Idea | null>(null)
  const [deleting, setDeleting] = useState<Idea | null>(null)
  const { openCreate } = useQuickAdd()
  const { toast } = useToast()
  const qc = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ['ideas'],
    queryFn: () => ideasApi.list(),
  })

  const remove = useMutation({
    mutationFn: (id: string) => ideasApi.remove(id),
    onSuccess: async () => {
      setDeleting(null)
      setEditing(null)
      await qc.invalidateQueries({ queryKey: ['ideas'] })
      toast('Fikir silindi')
    },
  })

  return (
    <section>
      <PageHeader
        title="Fikirler"
        trailing={<NavAddButton onClick={() => openCreate('idea')} label="Fikir ekle" />}
      />

      {isLoading ? (
        <div className="grouped-list px-4 py-3" aria-hidden>
          <div className="h-12 animate-pulse rounded-[8px] bg-bg" />
        </div>
      ) : null}

      {!isLoading && data.length === 0 ? (
        <EmptyState
          message="Henüz fikir eklemedin."
          actionLabel="Fikir ekle"
          onAction={() => openCreate('idea')}
        />
      ) : null}

      {data.length > 0 ? (
        <ListSection>
          <ul>
            {data.map((idea) => (
              <li key={idea.id}>
                <button
                  type="button"
                  className="flex min-h-[56px] w-full items-center gap-3 px-4 py-2.5 text-left active:opacity-70"
                  onClick={() => setEditing(idea)}
                >
                  <IconTile {...collectionIcons.ideas} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="headline block truncate text-text">{idea.title}</span>
                    {idea.content ? (
                      <span className="subheadline mt-0.5 line-clamp-1 text-secondary">
                        {idea.content}
                      </span>
                    ) : null}
                  </span>
                  <time className="footnote shrink-0 text-secondary" dateTime={idea.createdAt}>
                    {formatShortDate(idea.createdAt)}
                  </time>
                </button>
              </li>
            ))}
          </ul>
        </ListSection>
      ) : null}

      <BottomSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Fikri düzenle"
      >
        {editing ? (
          <div className="space-y-4">
            <IdeaForm initial={editing} onDone={() => setEditing(null)} />
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
        title="Fikri sil?"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        danger
        busy={remove.isPending}
      />
    </section>
  )
}
