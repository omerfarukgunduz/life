import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Textarea } from '../../components'
import { useToast } from '../../context/ToastContext'
import { ApiError } from '../../services/api'
import { customCollectionsApi } from '../../services/endpoints'
import type { CustomCollectionItem } from '../../types'

const schema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  content: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CustomCollectionItemFormProps {
  collectionId: string
  initial?: CustomCollectionItem
  onDone: () => void
}

export function CustomCollectionItemForm({
  collectionId,
  initial,
  onDone,
}: CustomCollectionItemFormProps) {
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
      content: initial?.content ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        title: values.title,
        content: values.content || null,
      }
      if (initial) return customCollectionsApi.updateItem(collectionId, initial.id, payload)
      return customCollectionsApi.createItem(collectionId, payload)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['custom-collection', collectionId, 'items'] })
      await qc.invalidateQueries({ queryKey: ['custom-collections'] })
      await qc.invalidateQueries({ queryKey: ['custom-collection', collectionId] })
      toast(initial ? 'Kayıt güncellendi' : 'Kayıt eklendi')
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
      <Textarea label="Not" {...register('content')} />
      <Button type="submit" fullWidth disabled={isSubmitting || mutation.isPending}>
        {initial ? 'Kaydet' : 'Ekle'}
      </Button>
    </form>
  )
}
