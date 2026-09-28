import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
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
import { birthdaysApi } from '../../services/endpoints'
import type { Birthday, BirthdayFilter } from '../../types'
import {
  ageOnNextBirthday,
  daysLeftLabel,
  daysUntil,
  formatDayMonth,
  nextBirthdayDate,
  toDateOnly,
} from '../../utils'
import { BirthdayForm } from './BirthdayForm'

const filters: { id: BirthdayFilter; label: string }[] = [
  { id: 'month', label: 'Bu ay' },
  { id: 'upcoming', label: 'Yaklaşan' },
  { id: 'all', label: 'Tümü' },
]

export default function BirthdaysPage() {
  const [filter, setFilter] = useState<BirthdayFilter>('month')
  const [editing, setEditing] = useState<Birthday | null>(null)
  const [deleting, setDeleting] = useState<Birthday | null>(null)
  const { openCreate } = useQuickAdd()
  const { toast } = useToast()
  const qc = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ['birthdays', filter],
    queryFn: () => birthdaysApi.list(filter),
  })

  const remove = useMutation({
    mutationFn: (id: string) => birthdaysApi.remove(id),
    onSuccess: async () => {
      setDeleting(null)
      setEditing(null)
      await qc.invalidateQueries({ queryKey: ['birthdays'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      await qc.invalidateQueries({ queryKey: ['calendar'] })
      toast('Doğum günü silindi')
    },
  })

  return (
    <section>
      <PageHeader
        title="Doğum Günleri"
        action={
          <DesktopAddButton onClick={() => openCreate('birthday')} label="Ekle" />
        }
      />

      <SegmentControl
        ariaLabel="Doğum günü filtresi"
        className="mb-4"
        items={filters}
        value={filter}
        onChange={(id) => setFilter(id as BirthdayFilter)}
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
          message="Doğum günü yok."
          actionLabel="Doğum günü ekle"
          onAction={() => openCreate('birthday')}
        />
      ) : null}

      <ul>
        {data.map((item) => {
          const next = nextBirthdayDate(item.birthMonth, item.birthDay)
          const nextKey = toDateOnly(next)
          const left = daysUntil(nextKey)
          const age =
            item.birthYear != null
              ? ageOnNextBirthday(item.birthYear, item.birthMonth, item.birthDay)
              : null
          return (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full min-h-11 items-center gap-3 border-b border-border py-3 text-left last:border-b-0"
                onClick={() => setEditing(item)}
              >
                <span className="w-14 shrink-0 text-[13px] text-secondary">
                  {formatDayMonth(nextKey)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-text">
                    {item.name}
                    {age != null ? (
                      <span className="font-normal text-secondary"> · {age}</span>
                    ) : null}
                  </p>
                  <p className="text-[13px] text-secondary">{daysLeftLabel(left)}</p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <BottomSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Doğum gününü düzenle"
      >
        {editing ? (
          <div className="space-y-4">
            <BirthdayForm initial={editing} onDone={() => setEditing(null)} />
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
        title="Doğum gününü sil?"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        danger
        busy={remove.isPending}
      />
    </section>
  )
}
