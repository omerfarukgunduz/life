import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Badge,
  BottomSheet,
  Button,
  Dialog,
  EmptyState,
  IconTile,
  PageHeader,
  SegmentControl,
} from '../../components'
import { DesktopAddButton } from '../../layouts/AppShell'
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

function reminderLabel(days: number): string {
  if (days === 0) return 'Aynı gün'
  if (days === 1) return '1 gün önce'
  return `${days} gün önce`
}

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
        action={<DesktopAddButton onClick={() => openCreate('contest')} label="Ekle" />}
      />

      <SegmentControl
        ariaLabel="Yarışma durumu"
        className="mb-4"
        items={statusFilters}
        value={status}
        onChange={(id) => setStatus(id as ContestStatus)}
      />

      {isLoading ? (
        <div className="space-y-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[12px] bg-surface" />
          ))}
        </div>
      ) : null}

      {!isLoading && visible.length === 0 ? (
        <EmptyState
          message="Bu durumda yarışma yok."
          actionLabel="Yarışma ekle"
          onAction={() => openCreate('contest')}
        />
      ) : null}

      <ul className="space-y-3">
        {visible.map((contest) => {
          const left = daysUntil(contest.deadline)
          return (
            <li key={contest.id}>
              <article className="surface p-4">
                <div className="flex items-start gap-3">
                  <IconTile {...collectionIcons.contests} size="lg" />
                  <button
                    type="button"
                    onClick={() => setEditing(contest)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="text-[16px] font-semibold leading-snug text-text">
                      {contest.title}
                    </p>
                    {contest.description ? (
                      <p className="mt-0.5 line-clamp-1 text-[13px] text-secondary">
                        {contest.description}
                      </p>
                    ) : null}
                  </button>
                  {contest.url ? (
                    <a
                      href={contest.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Bağlantıyı aç"
                      className="inline-flex size-10 shrink-0 items-center justify-center text-secondary"
                    >
                      <ExternalLink size={16} strokeWidth={1.75} />
                    </a>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(contest)}
                  className="mt-3 w-full text-left"
                >
                  <p className="text-[12px] text-secondary">Son başvuru</p>
                  <p className="text-[14px] font-medium text-text">
                    {formatDayMonthLong(contest.deadline)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[13px] text-secondary">{daysLeftLabel(left)}</span>
                    <Badge>{statusLabel[contest.status]}</Badge>
                  </div>
                  {contest.reminderDaysBefore.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {contest.reminderDaysBefore.map((days) => (
                        <span
                          key={days}
                          className="rounded-full bg-bg px-2 py-0.5 text-[11px] text-secondary"
                        >
                          {reminderLabel(days)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              </article>
            </li>
          )
        })}
      </ul>

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
