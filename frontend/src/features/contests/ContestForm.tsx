import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, DatePicker, Input, Select, Textarea } from '../../components'
import { useToast } from '../../context/ToastContext'
import { ApiError } from '../../services/api'
import { contestsApi } from '../../services/endpoints'
import type { Contest, ContestStatus } from '../../types'
import { cn } from '../../utils'

const REMINDERS = [
  { value: 30, label: '30 gün' },
  { value: 7, label: '7 gün' },
  { value: 1, label: '1 gün' },
]

const schema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  deadline: z.string().min(1, 'Son başvuru gerekli'),
  url: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['Interested', 'Applied', 'Completed']),
  reminderDaysBefore: z.array(z.number()),
})

type FormValues = z.infer<typeof schema>

interface ContestFormProps {
  initial?: Contest
  onDone: () => void
}

export function ContestForm({ initial, onDone }: ContestFormProps) {
  const { toast } = useToast()
  const qc = useQueryClient()
  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      deadline: initial?.deadline ?? '',
      url: initial?.url ?? '',
      description: initial?.description ?? '',
      status: initial?.status ?? 'Interested',
      reminderDaysBefore: initial?.reminderDaysBefore ?? [7, 1],
    },
  })

  const selected = watch('reminderDaysBefore')

  const toggleReminder = (day: number) => {
    const next = selected.includes(day)
      ? selected.filter((d) => d !== day)
      : [...selected, day]
    setValue('reminderDaysBefore', next, { shouldDirty: true })
  }

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        title: values.title,
        deadline: values.deadline,
        url: values.url || null,
        description: values.description || null,
        status: values.status as ContestStatus,
        reminderDaysBefore: values.reminderDaysBefore,
      }
      if (initial) return contestsApi.update(initial.id, payload)
      return contestsApi.create(payload)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['contests'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      await qc.invalidateQueries({ queryKey: ['calendar'] })
      toast(initial ? 'Yarışma güncellendi' : 'Yarışma eklendi')
      onDone()
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) setError('title', { message: err.message })
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((v) => mutation.mutateAsync(v))}
    >
      <Input label="Başlık" error={errors.title?.message} {...register('title')} />
      <DatePicker
        label="Son başvuru"
        mode="date"
        error={errors.deadline?.message}
        defaultValue={initial?.deadline ?? ''}
        {...register('deadline')}
      />
      <Input label="Bağlantı" type="url" placeholder="https://" {...register('url')} />
      <Textarea label="Açıklama" {...register('description')} />
      <Select
        label="Durum"
        options={[
          { value: 'Interested', label: 'Katılacağım' },
          { value: 'Applied', label: 'Katıldım' },
          { value: 'Completed', label: 'Sonuçlandı' },
        ]}
        {...register('status')}
      />
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-secondary">Hatırlatma</legend>
        <div className="flex flex-wrap gap-2">
          {REMINDERS.map((r) => {
            const active = selected.includes(r.value)
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => toggleReminder(r.value)}
                className={cn(
                  'touch-target rounded-[10px] border px-3 text-[13px]',
                  active ? 'border-accent text-accent' : 'border-border text-secondary',
                )}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      </fieldset>
      <Button type="submit" fullWidth disabled={isSubmitting || mutation.isPending}>
        {initial ? 'Kaydet' : 'Ekle'}
      </Button>
    </form>
  )
}
