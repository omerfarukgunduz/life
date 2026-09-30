import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, DatePicker, Input, Select, Textarea } from '../../components'
import { useToast } from '../../context/ToastContext'
import { ApiError } from '../../services/api'
import { tasksApi } from '../../services/endpoints'
import type { Priority, Task } from '../../types'
import { toDateOnly } from '../../utils'

const schema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  description: z.string().optional(),
  dueDate: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true
        return value >= '2026-01-01'
      },
      { message: 'Tarih 2026 ve sonrası olmalı' },
    ),
  dueTime: z.string().optional(),
  priority: z.enum(['Low', 'Normal', 'High']),
})

type FormValues = z.infer<typeof schema>

interface TaskFormProps {
  initial?: Task
  onDone: () => void
}

export function TaskForm({ initial, onDone }: TaskFormProps) {
  const { toast } = useToast()
  const qc = useQueryClient()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      dueDate: initial ? (initial.dueDate ?? '') : toDateOnly(new Date()),
      dueTime: initial?.dueTime ?? '',
      priority: (initial?.priority ?? 'Normal') as FormValues['priority'],
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        title: values.title,
        description: values.description || null,
        dueDate: values.dueDate || null,
        dueTime: values.dueTime || null,
        priority: values.priority as Priority,
        category: null,
        isCompleted: initial?.isCompleted ?? false,
      }
      if (initial) return tasksApi.update(initial.id, payload)
      return tasksApi.create(payload)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['tasks'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      await qc.invalidateQueries({ queryKey: ['calendar'] })
      toast(initial ? 'İş güncellendi' : 'İş eklendi')
      onDone()
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) setError('title', { message: err.message })
    },
  })

  const onSubmit = handleSubmit((values) => {
    void mutation.mutateAsync(values)
  })

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Input label="Başlık" error={errors.title?.message} {...register('title')} />
      <Textarea label="Açıklama" {...register('description')} />
      <DatePicker
        label="Tarih"
        mode="date"
        minYear={2026}
        error={errors.dueDate?.message}
        defaultValue={
          initial ? (initial.dueDate ?? '') : toDateOnly(new Date())
        }
        {...register('dueDate')}
      />
      <DatePicker label="Saat" mode="time" className="max-w-[168px]" {...register('dueTime')} />
      <Select
        label="Öncelik"
        options={[
          { value: 'Low', label: 'Düşük' },
          { value: 'Normal', label: 'Normal' },
          { value: 'High', label: 'Yüksek' },
        ]}
        {...register('priority')}
      />
      <Button type="submit" fullWidth disabled={isSubmitting || mutation.isPending}>
        {initial ? 'Kaydet' : 'Ekle'}
      </Button>
    </form>
  )
}
