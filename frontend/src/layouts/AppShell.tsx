import { NavLink, Outlet } from 'react-router-dom'
import {
  BookOpen,
  Cake,
  CalendarDays,
  Camera,
  CheckSquare,
  Lightbulb,
  Plus,
  Settings,
  Sun,
} from 'lucide-react'
import { BottomNavigation } from '../components/BottomNavigation'
import { BottomSheet } from '../components/BottomSheet'
import { Button } from '../components/Button'
import { useOnline } from '../hooks/useOnline'
import { useQuickAdd } from '../hooks/useQuickAdd'
import { TaskForm } from '../features/tasks/TaskForm'
import { BirthdayForm } from '../features/birthdays/BirthdayForm'
import { ContestForm } from '../features/contests/ContestForm'
import { BookForm } from '../features/books/BookForm'
import { IdeaForm } from '../features/ideas/IdeaForm'
import { cn } from '../utils/cn'

const sidebarMain = [
  { to: '/', label: 'Bugün', icon: Sun, end: true },
  { to: '/tasks', label: 'Görevler', icon: CheckSquare },
  { to: '/calendar', label: 'Takvim', icon: CalendarDays },
] as const

const sidebarCollections = [
  { to: '/collections/books', label: 'Kitaplar', icon: BookOpen },
  { to: '/collections/birthdays', label: 'Doğum Günleri', icon: Cake },
  { to: '/collections/contests', label: 'Yarışmalar', icon: Camera },
  { to: '/collections/ideas', label: 'Fikirler', icon: Lightbulb },
] as const

const createOptions = [
  { id: 'task' as const, label: 'Görev', icon: CheckSquare },
  { id: 'birthday' as const, label: 'Doğum günü', icon: Cake },
  { id: 'contest' as const, label: 'Yarışma', icon: Camera },
  { id: 'book' as const, label: 'Kitap', icon: BookOpen },
  { id: 'idea' as const, label: 'Fikir', icon: Lightbulb },
]

const createTitles = {
  task: 'Görev ekle',
  birthday: 'Doğum günü ekle',
  contest: 'Yarışma ekle',
  book: 'Kitap ekle',
  idea: 'Fikir ekle',
} as const

export function AppShell() {
  const online = useOnline()
  const { pickerOpen, createEntity, openPicker, closePicker, openCreate, closeCreate } =
    useQuickAdd()

  return (
    <div className="min-h-dvh bg-bg text-text">
      {!online ? (
        <div
          className="border-b border-border bg-surface px-4 py-1.5 text-center text-[12px] text-secondary"
          role="status"
        >
          İnternet bağlantısı yok
        </div>
      ) : null}

      <div className="lg:flex lg:min-h-dvh">
        <aside className="hidden w-60 shrink-0 border-r border-border bg-surface px-4 py-6 lg:flex lg:flex-col">
          <div className="mb-8 px-2 text-[18px] font-semibold tracking-tight">Life</div>
          <nav className="flex flex-1 flex-col gap-6" aria-label="Yan menü">
            <ul className="space-y-1">
              {sidebarMain.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={'end' in item ? item.end : false}
                    className={({ isActive }) =>
                      cn(
                        'flex touch-target items-center gap-3 rounded-[12px] px-3 text-[14px]',
                        isActive ? 'text-accent' : 'text-secondary hover:text-text',
                      )
                    }
                  >
                    <item.icon size={18} strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div>
              <p className="mb-2 px-3 text-[12px] font-medium uppercase tracking-wide text-secondary">
                Koleksiyonlar
              </p>
              <ul className="space-y-1">
                {sidebarCollections.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex touch-target items-center gap-3 rounded-[12px] px-3 text-[14px]',
                          isActive ? 'text-accent' : 'text-secondary hover:text-text',
                        )
                      }
                    >
                      <item.icon size={18} strokeWidth={1.75} />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-auto">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cn(
                    'flex touch-target items-center gap-3 rounded-[12px] px-3 text-[14px]',
                    isActive ? 'text-accent' : 'text-secondary hover:text-text',
                  )
                }
              >
                <Settings size={18} strokeWidth={1.75} />
                Ayarlar
              </NavLink>
            </div>
          </nav>
        </aside>

        <main className="relative flex-1 pb-28 lg:pb-8">
          <div className="mx-auto w-full max-w-[1120px] px-4 pt-6 lg:px-8 lg:pt-8">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNavigation />

      <button
        type="button"
        aria-label="Ekle"
        onClick={openPicker}
        className="fixed right-4 bottom-[calc(64px+env(safe-area-inset-bottom,0px))] z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-fg shadow-soft lg:hidden"
      >
        <Plus size={22} />
      </button>

      <BottomSheet open={pickerOpen} onClose={closePicker} title="Ekle">
        <ul className="space-y-1">
          {createOptions.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                className="flex touch-target w-full items-center gap-3 rounded-[12px] px-2 text-left text-[15px]"
                onClick={() => openCreate(opt.id)}
              >
                <opt.icon size={18} className="text-secondary" />
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>

      <BottomSheet
        open={createEntity !== null}
        onClose={closeCreate}
        title={createEntity ? createTitles[createEntity] : ''}
      >
        {createEntity === 'task' ? <TaskForm onDone={closeCreate} /> : null}
        {createEntity === 'birthday' ? <BirthdayForm onDone={closeCreate} /> : null}
        {createEntity === 'contest' ? <ContestForm onDone={closeCreate} /> : null}
        {createEntity === 'book' ? <BookForm onDone={closeCreate} /> : null}
        {createEntity === 'idea' ? <IdeaForm onDone={closeCreate} /> : null}
      </BottomSheet>
    </div>
  )
}

export function DesktopAddButton({
  onClick,
  label = 'Ekle',
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <Button variant="secondary" onClick={onClick} className="!min-h-10 px-3 text-[13px]">
      <Plus size={16} />
      {label}
    </Button>
  )
}
