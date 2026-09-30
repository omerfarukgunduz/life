import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  BottomSheet,
  Button,
  Dialog,
  EmptyState,
  IconTile,
  ListSection,
  NavAddButton,
  PageHeader,
} from '../../components'
import { useToast } from '../../context/ToastContext'
import { customCollectionsApi } from '../../services/endpoints'
import type { CustomCollectionItem } from '../../types'
import { formatShortDate } from '../../utils'
import { customCollectionAppearance } from '../../utils/customCollectionTheme'
import { CustomCollectionForm } from './CustomCollectionForm'
import { CustomCollectionItemForm } from './CustomCollectionItemForm'

export default function CustomCollectionPage() {
  const { collectionId = '' } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [editMeta, setEditMeta] = useState(false)
  const [createItem, setCreateItem] = useState(false)
  const [editingItem, setEditingItem] = useState<CustomCollectionItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<CustomCollectionItem | null>(null)
  const [deleteCollectionOpen, setDeleteCollectionOpen] = useState(false)

  const collectionQuery = useQuery({
    queryKey: ['custom-collection', collectionId],
    queryFn: () => customCollectionsApi.get(collectionId),
    enabled: Boolean(collectionId),
  })

  const itemsQuery = useQuery({
    queryKey: ['custom-collection', collectionId, 'items'],
    queryFn: () => customCollectionsApi.listItems(collectionId),
    enabled: Boolean(collectionId),
  })

  const removeCollection = useMutation({
    mutationFn: () => customCollectionsApi.remove(collectionId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['custom-collections'] })
      toast('Koleksiyon silindi')
      navigate('/collections', { replace: true })
    },
  })

  const removeItem = useMutation({
    mutationFn: (itemId: string) => customCollectionsApi.removeItem(collectionId, itemId),
    onSuccess: async () => {
      setDeletingItem(null)
      setEditingItem(null)
      await qc.invalidateQueries({ queryKey: ['custom-collection', collectionId, 'items'] })
      await qc.invalidateQueries({ queryKey: ['custom-collections'] })
      await qc.invalidateQueries({ queryKey: ['custom-collection', collectionId] })
      toast('Kayıt silindi')
    },
  })

  const collection = collectionQuery.data
  const items = itemsQuery.data ?? []
  const appearance = customCollectionAppearance(collection?.iconKey, collection?.colorKey)

  if (collectionQuery.isError) {
    return (
      <section>
        <PageHeader title="Koleksiyon" large={false} />
        <p className="subheadline text-secondary">Koleksiyon bulunamadı.</p>
        <Link to="/collections" className="footnote mt-2 inline-block text-accent">
          Koleksiyonlara dön
        </Link>
      </section>
    )
  }

  return (
    <section>
      <header className="mb-5 flex items-start justify-between gap-3">
        {collection ? (
          <>
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <IconTile {...appearance} size="lg" />
              <div className="min-w-0">
                <h1 className="title-2 text-text">{collection.name}</h1>
                {collection.description ? (
                  <p className="subheadline mt-0.5 text-secondary">{collection.description}</p>
                ) : null}
              </div>
            </div>
            <div className="flex h-11 shrink-0 items-center">
              <button
                type="button"
                onClick={() => setEditMeta(true)}
                className="inline-flex h-11 items-center px-2 text-[15px] font-medium text-accent active:opacity-70"
              >
                Düzenle
              </button>
              <NavAddButton onClick={() => setCreateItem(true)} label="Kayıt ekle" />
            </div>
          </>
        ) : (
          <PageHeader title="…" large={false} className="mb-0 w-full" />
        )}
      </header>

      {itemsQuery.isLoading ? (
        <div className="grouped-list px-4 py-3" aria-hidden>
          <div className="h-12 animate-pulse rounded-[8px] bg-bg" />
        </div>
      ) : null}

      {!itemsQuery.isLoading && items.length === 0 ? (
        <EmptyState
          message="Bu koleksiyonda henüz kayıt yok."
          actionLabel="Kayıt ekle"
          onAction={() => setCreateItem(true)}
        />
      ) : null}

      {items.length > 0 ? (
        <ListSection>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex min-h-[56px] w-full items-center gap-3 px-4 py-2.5 text-left active:opacity-70"
                  onClick={() => setEditingItem(item)}
                >
                  <IconTile {...appearance} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="headline block truncate text-text">{item.title}</span>
                    {item.content ? (
                      <span className="subheadline mt-0.5 line-clamp-1 text-secondary">
                        {item.content}
                      </span>
                    ) : null}
                  </span>
                  <time className="footnote shrink-0 text-secondary" dateTime={item.createdAt}>
                    {formatShortDate(item.createdAt)}
                  </time>
                </button>
              </li>
            ))}
          </ul>
        </ListSection>
      ) : null}

      <div className="mt-6">
        <Button variant="danger" fullWidth onClick={() => setDeleteCollectionOpen(true)}>
          Koleksiyonu sil
        </Button>
      </div>

      <BottomSheet open={editMeta} onClose={() => setEditMeta(false)} title="Koleksiyonu düzenle">
        {collection ? (
          <CustomCollectionForm initial={collection} onDone={() => setEditMeta(false)} />
        ) : null}
      </BottomSheet>

      <BottomSheet open={createItem} onClose={() => setCreateItem(false)} title="Kayıt ekle">
        <CustomCollectionItemForm collectionId={collectionId} onDone={() => setCreateItem(false)} />
      </BottomSheet>

      <BottomSheet
        open={editingItem !== null}
        onClose={() => setEditingItem(null)}
        title="Kaydı düzenle"
      >
        {editingItem ? (
          <div className="space-y-4">
            <CustomCollectionItemForm
              collectionId={collectionId}
              initial={editingItem}
              onDone={() => setEditingItem(null)}
            />
            <Button variant="danger" fullWidth onClick={() => setDeletingItem(editingItem)}>
              Sil
            </Button>
          </div>
        ) : null}
      </BottomSheet>

      <Dialog
        open={deletingItem !== null}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => deletingItem && removeItem.mutate(deletingItem.id)}
        title="Kaydı sil?"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        danger
        busy={removeItem.isPending}
      />

      <Dialog
        open={deleteCollectionOpen}
        onClose={() => setDeleteCollectionOpen(false)}
        onConfirm={() => removeCollection.mutate()}
        title="Koleksiyonu sil?"
        description="Koleksiyon ve içindeki tüm kayıtlar silinir."
        confirmLabel="Sil"
        danger
        busy={removeCollection.isPending}
      />
    </section>
  )
}
