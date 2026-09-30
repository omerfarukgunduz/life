import { NavLink, Outlet } from 'react-router-dom'
import {
  BookOpen,
  Cake,
  CalendarDays,
  Camera,
  CheckSquare,
  Lightbulb,
  Settings,
  Sun,
} from 'lucide-react'
import { BottomNavigation } from '../components/BottomNavigation'
import { BottomSheet } from '../components/BottomSheet'
import { IconTile } from '../components/IconTile'
import { quickAddOptions } from '../utils/collectionIcons'
import { useAuth } from '../hooks/useAuth'
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
  { to: '/tasks', label: 'İşler', icon: CheckSquare },
  { to: '/calendar', label: 'Takvim', icon: CalendarDays },
  { to: '/collections', label: 'Koleksiyonlar', icon: BookOpen },
  { to: '/settings', label: 'Ayarlar', icon: Settings },
] as const

const sidebarCollections = [
  { to: '/collections/books', label: 'Kitaplar', icon: BookOpen },
  { to: '/collections/birthdays', label: 'Doğum Günleri', icon: Cake },
  { to: '/collections/contests', label: 'Yarışmalar', icon: Camera },
  { to: '/collections/ideas', label: 'Fikirler', icon: Lightbulb },
] as const

const createTitles = {
  task: 'İş ekle',
  birthday: 'Doğum günü ekle',
  contest: 'Yarışma ekle',
  book: 'Kitap ekle',
  idea: 'Fikir ekle',
} as const

export function AppShell() {
  const { logout } = useAuth()
  const online = useOnline()
  const { pickerOpen, createEntity, openPicker, closePicker, openCreate, closeCreate } =
    useQuickAdd()

  return (
    <div className="min-h-dvh bg-bg text-text safe-top">
      {!online ? (
        <div
          className="border-b border-divider bg-surface px-5 py-1.5 text-center caption-text text-secondary"
          role="status"
        >
          İnternet bağlantısı yok
        </div>
      ) : null}

      <div className="lg:flex lg:min-h-dvh">
        <aside className="hidden w-56 shrink-0 border-r border-divider bg-surface px-3 py-6 lg:flex lg:flex-col">
          <div className="mb-6 px-3 text-[20px] font-bold tracking-tight text-text">Life</div>
          <nav className="flex flex-1 flex-col gap-1" aria-label="Yan menü">
            <ul className="space-y-0.5">
              {sidebarMain.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={'end' in item ? item.end : false}
                    className={({ isActive }) =>
                      cn(
                        'flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] transition-colors duration-200',
                        isActive
                          ? 'bg-soft-blue font-semibold text-accent'
                          : 'text-text active:opacity-70',
                      )
                    }
                  >
                    <item.icon size={20} strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mt-0.5 px-0">
              <button
                type="button"
                onClick={logout}
                className="flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 text-[15px] font-medium text-danger transition-opacity duration-200 active:opacity-70"
              >
                Çıkış yap
              </button>
            </div>
            <p className="section-header mb-1 mt-6 px-3">Koleksiyonlar</p>
            <ul className="space-y-0.5">
              {sidebarCollections.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] transition-colors duration-200',
                        isActive
                          ? 'bg-soft-blue font-semibold text-accent'
                          : 'text-secondary active:opacity-70',
                      )
                    }
                  >
                    <item.icon size={18} strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="relative flex-1 pb-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom,0px)+16px)] lg:pb-10">
          <div className="mx-auto w-full max-w-[960px] px-5 pt-3 lg:pt-8">
            <Outlet context={{ openPicker, openCreate }} />
          </div>
        </main>
      </div>

      <BottomNavigation />

      <BottomSheet open={pickerOpen} onClose={closePicker} title="Ekle">
        <ul className="-mx-5 divide-y divide-divider">
          {quickAddOptions.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                className="flex min-h-[56px] w-full items-center gap-3 px-4 text-left active:opacity-70"
                onClick={() => openCreate(opt.id)}
              >
                <IconTile icon={opt.icon} bg={opt.bg} fg={opt.fg} size="sm" />
                <span className="text-[17px] leading-[22px] text-text">{opt.label}</span>
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

export { NavAddButton } from '../components/NavAddButton'
