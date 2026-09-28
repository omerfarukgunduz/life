import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import {
  BottomSheet,
  Button,
  Dialog,
  EmptyState,
  PageHeader,
} from '../../components'
import { DesktopAddButton } from '../../layouts/AppShell'
import { useQuickAdd } from '../../hooks/useQuickAdd'
import { useToast } from '../../context/ToastContext'
import { contestsApi } from '../../services/endpoints'
import type { Contest, ContestStatus } from '../../types'
import { daysLeftLabel, daysUntil, formatDayMonthLong } from '../../utils'
import { ContestForm } from './ContestForm'

const statusLabel: Record<ContestStatus, string> = {
  Interested: 'Katılacağım',
  Applied: 'Katıldım',
  Completed: 'Sonuçlandı',
}

export default function ContestsPage() {
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

  return (
    <section>
      <PageHeader
        title="Yarışmalar"
        action={<DesktopAddButton onClick={() => openCreate('contest')} label="Ekle" />}
      />

      {isLoading ? (
        <div className="space-y-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[12px] bg-surface" />
          ))}
        </div>
      ) : null}

      {!isLoading && data.length === 0 ? (
        <EmptyState
          message="Yarışma yok."
          actionLabel="Yarışma ekle"
          onAction={() => openCreate('contest')}
        />
      ) : null}

      <ul className="space-y-3">
        {data.map((contest) => {
          const left = daysUntil(contest.deadline)
          return (
            <li key={contest.id}>
              <div className="rounded-[12px] border border-border bg-surface p-4">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(contest)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="text-[15px] font-medium text-text">{contest.title}</p>
                  </button>
                  {contest.url ? (
                    <a
                      href={contest.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Bağlantıyı aç"
                      className="shrink-0 touch-target text-secondary"
                    >
                      <ExternalLink size={16} strokeWidth={1.75} />
                    </a>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(contest)}
                  className="mt-2 w-full text-left"
                >
                  <p className="text-[13px] text-secondary">Son başvuru</p>
                  <p className="text-[14px] text-text">
                    {formatDayMonthLong(contest.deadline)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 text-[13px] text-secondary">
                    <span>{daysLeftLabel(left)}</span>
                    <span>{statusLabel[contest.status]}</span>
                  </div>
                </button>
              </div>
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
