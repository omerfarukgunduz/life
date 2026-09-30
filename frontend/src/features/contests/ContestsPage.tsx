import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, ExternalLink } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  BottomSheet,
  Button,
  Dialog,
  EmptyState,
  IconButton,
  IconTile,
  ListSection,
  NavAddButton,
  PageHeader,
  SegmentControl,
} from '../../components'
import { useQuickAdd } from '../../hooks/useQuickAdd'
import { useToast } from '../../context/ToastContext'
import { contestsApi } from '../../services/endpoints'
import type { Contest, ContestStatus } from '../../types'
import { daysLeftLabel, daysUntil, formatDayMonthLong } from '../../utils'
import { collectionIcons } from '../../utils/collectionIcons'
import { ContestForm } from './ContestForm'

const statusLabel: Record<ContestStatus, string> = {
  Interested: 'Katılacağım',
  Applied: 'Katıldım',
  Completed: 'Sonuçlandı',
}

const statusFilters: { id: ContestStatus; label: string }[] = [
  { id: 'Interested', label: 'Katılacağım' },
  { id: 'Applied', label: 'Katıldım' },
  { id: 'Completed', label: 'Sonuçlandı' },
]

export default function ContestsPage() {
  const [status, setStatus] = useState<ContestStatus>('Interested')
  const [editing, setEditing] = useState<Contest | null>(null)
  const [deleting, setDeleting] = useState<Contest | null>(null)
  const { openCreate } = useQuickAdd()
  const { toast } = useToast()
  const qc = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ['contests'],
    queryFn: () => contestsApi.list(),
  })

  const remove = useMutation({
    mutationFn: (id: string) => contestsApi.remove(id),
    onSuccess: async () => {
      setDeleting(null)
      setEditing(null)
      await qc.invalidateQueries({ queryKey: ['contests'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      await qc.invalidateQueries({ queryKey: ['calendar'] })
      toast('Yarışma silindi')
    },
  })

  const visible = useMemo(
    () => data.filter((contest) => contest.status === status),
    [data, status],
  )

  return (
    <section>
      <PageHeader
        title="Fotoğraf Yarışmaları"
        trailing={<NavAddButton onClick={() => openCreate('contest')} label="Yarışma ekle" />}
      />

      <SegmentControl
        ariaLabel="Yarışma durumu"
        className="mb-4"
        items={statusFilters}
        value={status}
        onChange={(id) => setStatus(id as ContestStatus)}
      />

      {isLoading ? (
        <div className="grouped-list px-4 py-3" aria-hidden>
          <div className="h-16 animate-pulse rounded-[8px] bg-bg" />
        </div>
      ) : null}

      {!isLoading && visible.length === 0 ? (
        <EmptyState
          message="Bu durumda yarışma yok."
          actionLabel="Yarışma ekle"
          onAction={() => openCreate('contest')}
        />
      ) : null}

      {visible.length > 0 ? (
        <ListSection>
          <ul>
            {visible.map((contest) => {
              const left = daysUntil(contest.deadline)
              return (
                <li key={contest.id}>
                  <div className="flex min-h-[56px] items-center gap-1 px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => setEditing(contest)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left active:opacity-70"
                    >
                      <IconTile {...collectionIcons.contests} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="headline block text-text">{contest.title}</span>
                        <span className="subheadline mt-0.5 block text-secondary">
                          Son başvuru {formatDayMonthLong(contest.deadline)}
                        </span>
                        <span className="caption-text mt-1 block text-secondary">
                          {daysLeftLabel(left)} · {statusLabel[contest.status]}
                        </span>
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-tertiary" strokeWidth={2} />
                    </button>
                    {contest.url ? (
                      <IconButton
                        label="Bağlantıyı aç"
                        onClick={() => window.open(contest.url!, '_blank', 'noopener,noreferrer')}
                      >
                        <ExternalLink size={18} strokeWidth={2} />
                      </IconButton>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </ListSection>
      ) : null}

      <BottomSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Yarışmayı düzenle"
      >
        {editing ? (
          <div className="space-y-4">
            <ContestForm initial={editing} onDone={() => setEditing(null)} />
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
        title="Yarışmayı sil?"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        danger
        busy={remove.isPending}
      />
    </section>
  )
}
