import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Textarea } from '../../components'
import { useToast } from '../../context/ToastContext'
import { ApiError } from '../../services/api'
import { birthdaysApi } from '../../services/endpoints'
import type { Birthday } from '../../types'
import { cn } from '../../utils'

const REMINDERS = [
  { value: 0, label: 'Aynı gün' },
  { value: 1, label: '1 gün önce' },
  { value: 3, label: '3 gün önce' },
  { value: 7, label: '7 gün önce' },
]

const schema = z.object({
  name: z.string().min(1, 'İsim gerekli'),
  birthMonth: z.coerce.number().min(1).max(12),
  birthDay: z.coerce.number().min(1).max(31),
  birthYear: z.string().optional(),
  note: z.string().optional(),
  reminderDaysBefore: z.array(z.number()),
})

type FormValues = z.infer<typeof schema>

interface BirthdayFormProps {
  initial?: Birthday
  onDone: () => void
}

export function BirthdayForm({ initial, onDone }: BirthdayFormProps) {
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
      name: initial?.name ?? '',
      birthMonth: initial?.birthMonth ?? 1,
      birthDay: initial?.birthDay ?? 1,
      birthYear: initial?.birthYear?.toString() ?? '',
      note: initial?.note ?? '',
      reminderDaysBefore: initial?.reminderDaysBefore ?? [0, 1],
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
        name: values.name,
        birthMonth: values.birthMonth,
        birthDay: values.birthDay,
        birthYear: values.birthYear ? Number(values.birthYear) : null,
        note: values.note || null,
        reminderDaysBefore: values.reminderDaysBefore,
      }
      if (initial) return birthdaysApi.update(initial.id, payload)
      return birthdaysApi.create(payload)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['birthdays'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      await qc.invalidateQueries({ queryKey: ['calendar'] })
      toast(initial ? 'Doğum günü güncellendi' : 'Doğum günü eklendi')
      onDone()
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) setError('name', { message: err.message })
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((v) => mutation.mutateAsync(v))}
    >
      <Input label="İsim" error={errors.name?.message} {...register('name')} />
      <div className="grid grid-cols-3 gap-3">
        <Input label="Gün" type="number" min={1} max={31} {...register('birthDay')} />
        <Input label="Ay" type="number" min={1} max={12} {...register('birthMonth')} />
        <Input label="Yıl (ops.)" type="number" {...register('birthYear')} />
      </div>
      <Textarea label="Not" {...register('note')} />
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
