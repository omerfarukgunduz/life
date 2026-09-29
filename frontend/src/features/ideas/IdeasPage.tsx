import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import {
  BottomSheet,
  Button,
  Dialog,
  EmptyState,
  IconTile,
  PageHeader,
} from '../../components'
import { DesktopAddButton } from '../../layouts/AppShell'
import { useQuickAdd } from '../../hooks/useQuickAdd'
import { useToast } from '../../context/ToastContext'
import { ideasApi } from '../../services/endpoints'
import type { Idea } from '../../types'
import { formatShortDate } from '../../utils'
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
        action={<DesktopAddButton onClick={() => openCreate('idea')} label="Ekle" />}
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
          message="Fikir yok."
          actionLabel="Fikir ekle"
          onAction={() => openCreate('idea')}
        />
      ) : null}

      {data.length > 0 ? (
      <ul className="surface divide-y divide-divider px-4">
        {data.map((idea) => (
          <li key={idea.id}>
            <button
              type="button"
              className="flex w-full min-h-11 items-center gap-3 py-3 text-left"
              onClick={() => setEditing(idea)}
            >
              <IconTile icon={Lightbulb} bg="bg-soft-yellow" fg="text-[#C48A2A]" size="sm" />
              <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-text">
                {idea.title}
              </p>
              <time className="shrink-0 text-[13px] text-secondary" dateTime={idea.createdAt}>
                {formatShortDate(idea.createdAt)}
              </time>
            </button>
          </li>
        ))}
      </ul>
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
