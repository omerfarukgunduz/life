import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { Button, Input, Select, Textarea } from '../../components'
import { useToast } from '../../context/ToastContext'
import { ApiError } from '../../services/api'
import { booksApi } from '../../services/endpoints'
import type { Book, BookStatus } from '../../types'
import { cn } from '../../utils'

const schema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  author: z.string().min(1, 'Yazar gerekli'),
  status: z.enum(['Reading', 'WantToRead', 'Read']),
  rating: z.number().min(0).max(5).nullable(),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface BookFormProps {
  initial?: Book
  onDone: () => void
}

export function BookForm({ initial, onDone }: BookFormProps) {
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
      author: initial?.author ?? '',
      status: initial?.status ?? 'WantToRead',
      rating: initial?.rating ?? null,
      note: initial?.note ?? '',
    },
  })

  const rating = watch('rating')

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        title: values.title,
        author: values.author,
        status: values.status as BookStatus,
        rating: values.rating,
        note: values.note || null,
        startedAt: initial?.startedAt ?? null,
        finishedAt: initial?.finishedAt ?? null,
      }
      if (initial) return booksApi.update(initial.id, payload)
      return booksApi.create(payload)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['books'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast(initial ? 'Kitap güncellendi' : 'Kitap kaydedildi')
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
      <Input label="Yazar" error={errors.author?.message} {...register('author')} />
      <Select
        label="Durum"
        options={[
          { value: 'Reading', label: 'Okuyorum' },
          { value: 'WantToRead', label: 'Okuyacağım' },
          { value: 'Read', label: 'Okudum' },
        ]}
        {...register('status')}
      />
      <div>
        <p className="mb-2 text-[13px] font-medium text-secondary">Puan</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} yıldız`}
              className="touch-target"
              onClick={() =>
                setValue('rating', rating === n ? null : n, { shouldDirty: true })
              }
            >
              <Star
                size={22}
                className={cn(
                  rating !== null && n <= rating ? 'fill-text text-text' : 'text-border',
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <Textarea label="Not" {...register('note')} />
      <Button type="submit" fullWidth disabled={isSubmitting || mutation.isPending}>
        {initial ? 'Kaydet' : 'Ekle'}
      </Button>
    </form>
  )
}
