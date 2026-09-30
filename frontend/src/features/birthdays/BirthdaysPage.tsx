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
  SegmentControl,
} from '../../components'
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
import { collectionIcons } from '../../utils/collectionIcons'
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
        trailing={
          <NavAddButton onClick={() => openCreate('birthday')} label="Doğum günü ekle" />
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
        <div className="grouped-list px-4 py-3" aria-hidden>
          <div className="h-12 animate-pulse rounded-[8px] bg-bg" />
        </div>
      ) : null}

      {!isLoading && data.length === 0 ? (
        <EmptyState
          message="Doğum günü yok."
          actionLabel="Doğum günü ekle"
          onAction={() => openCreate('birthday')}
        />
      ) : null}

      {data.length > 0 ? (
        <ListSection>
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
                    className="flex min-h-[56px] w-full items-center gap-3 px-4 py-2.5 text-left active:opacity-70"
                    onClick={() => setEditing(item)}
                  >
                    <IconTile {...collectionIcons.birthdays} size="sm" />
                    <span className="w-[52px] shrink-0 text-[13px] font-medium leading-[18px] text-secondary tabular-nums">
                      {formatDayMonth(nextKey)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="headline block truncate text-text">
                        {item.name}
                        {age != null ? (
                          <span className="font-normal text-secondary"> · {age}</span>
                        ) : null}
                      </span>
                      <span className="subheadline mt-0.5 block text-secondary">
                        {daysLeftLabel(left)}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </ListSection>
      ) : null}

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
