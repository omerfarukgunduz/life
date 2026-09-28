import { Button } from './Button'
import { Modal } from './Modal'

type DialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  busy?: boolean
  loading?: boolean
}

export function Dialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Onayla',
  cancelLabel = 'Vazgeç',
  danger,
  busy,
  loading,
}: DialogProps) {
  const pending = busy ?? loading
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {description ? (
        <p className="mb-5 text-[15px] leading-relaxed text-secondary">
          {description}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onClose}
          disabled={pending}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          className={
            danger
              ? 'flex-1 border border-red-200 bg-red-600 text-white'
              : 'flex-1'
          }
          onClick={onConfirm}
          disabled={pending}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
