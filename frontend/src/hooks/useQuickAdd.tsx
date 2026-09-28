import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type CreateEntity = 'task' | 'birthday' | 'contest' | 'book' | 'idea' | null

interface QuickAddContextValue {
  pickerOpen: boolean
  createEntity: CreateEntity
  openPicker: () => void
  closePicker: () => void
  openCreate: (entity: Exclude<CreateEntity, null>) => void
  closeCreate: () => void
}

const QuickAddContext = createContext<QuickAddContextValue | null>(null)

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [createEntity, setCreateEntity] = useState<CreateEntity>(null)

  const openPicker = useCallback(() => setPickerOpen(true), [])
  const closePicker = useCallback(() => setPickerOpen(false), [])
  const openCreate = useCallback((entity: Exclude<CreateEntity, null>) => {
    setPickerOpen(false)
    setCreateEntity(entity)
  }, [])
  const closeCreate = useCallback(() => setCreateEntity(null), [])

  const value = useMemo(
    () => ({
      pickerOpen,
      createEntity,
      openPicker,
      closePicker,
      openCreate,
      closeCreate,
    }),
    [pickerOpen, createEntity, openPicker, closePicker, openCreate, closeCreate],
  )

  return <QuickAddContext.Provider value={value}>{children}</QuickAddContext.Provider>
}

export function useQuickAdd(): QuickAddContextValue {
  const ctx = useContext(QuickAddContext)
  if (!ctx) throw new Error('useQuickAdd must be used within QuickAddProvider')
  return ctx
}
