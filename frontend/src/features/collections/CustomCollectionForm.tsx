import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, CustomCollectionAppearancePicker, Input, Textarea } from '../../components'
import { useToast } from '../../context/ToastContext'
import { ApiError } from '../../services/api'
import { customCollectionsApi } from '../../services/endpoints'
import type { CustomCollection } from '../../types'
import {
  DEFAULT_COLLECTION_COLOR_KEY,
  DEFAULT_COLLECTION_ICON_KEY,
  normalizeCollectionColorKey,
  normalizeCollectionIconKey,
  type CollectionColorKey,
  type CollectionIconKey,
} from '../../utils/customCollectionTheme'

const schema = z.object({
  name: z.string().min(1, 'Ad gerekli').max(200),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CustomCollectionFormProps {
  initial?: CustomCollection
  onDone: () => void
  onCreated?: (collection: CustomCollection) => void
}

export function CustomCollectionForm({ initial, onDone, onCreated }: CustomCollectionFormProps) {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [iconKey, setIconKey] = useState<CollectionIconKey>(
    normalizeCollectionIconKey(initial?.iconKey ?? DEFAULT_COLLECTION_ICON_KEY),
  )
  const [colorKey, setColorKey] = useState<CollectionColorKey>(
    normalizeCollectionColorKey(initial?.colorKey ?? DEFAULT_COLLECTION_COLOR_KEY),
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        name: values.name,
        description: values.description || null,
        iconKey,
        colorKey,
      }
      if (initial) return customCollectionsApi.update(initial.id, payload)
      return customCollectionsApi.create(payload)
    },
    onSuccess: async (saved) => {
      await qc.invalidateQueries({ queryKey: ['custom-collections'] })
      if (initial) {
        await qc.invalidateQueries({ queryKey: ['custom-collection', initial.id] })
      }
      toast(initial ? 'Koleksiyon güncellendi' : 'Koleksiyon oluşturuldu')
      if (!initial) onCreated?.(saved)
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
      <Input label="Ad" error={errors.name?.message} {...register('name')} />
      <Textarea label="Açıklama" {...register('description')} />
      <CustomCollectionAppearancePicker
        iconKey={iconKey}
        colorKey={colorKey}
        onIconChange={setIconKey}
        onColorChange={setColorKey}
      />
      <Button type="submit" fullWidth disabled={isSubmitting || mutation.isPending}>
        {initial ? 'Kaydet' : 'Oluştur'}
      </Button>
    </form>
  )
}
