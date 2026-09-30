import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layouts/AppShell'
import { useAuth } from './hooks/useAuth'
import { AuthPage } from './features/auth/AuthPage'
import { QuickAddProvider } from './hooks/useQuickAdd'

const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'))
const TasksPage = lazy(() => import('./features/tasks/TasksPage'))
const CollectionsPage = lazy(
  () => import('./features/collections/CollectionsPage'),
)
const CustomCollectionPage = lazy(
  () => import('./features/collections/CustomCollectionPage'),
)
const BirthdaysPage = lazy(() => import('./features/birthdays/BirthdaysPage'))
const ContestsPage = lazy(() => import('./features/contests/ContestsPage'))
const BooksPage = lazy(() => import('./features/books/BooksPage'))
const IdeasPage = lazy(() => import('./features/ideas/IdeasPage'))
const CalendarPage = lazy(() => import('./features/calendar/CalendarPage'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-[14px] text-secondary">
        Yükleniyor…
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <QuickAddProvider>
      <AppShell />
    </QuickAddProvider>
  )
}

function Lazy({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 py-2">
          <div className="h-8 w-40 animate-pulse rounded-[10px] bg-surface" />
          <div className="h-12 animate-pulse rounded-[12px] bg-surface" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route element={<ProtectedLayout />}>
        <Route
          index
          element={
            <Lazy>
              <DashboardPage />
            </Lazy>
          }
        />
        <Route
          path="tasks"
          element={
            <Lazy>
              <TasksPage />
            </Lazy>
          }
        />
        <Route
          path="collections"
          element={
            <Lazy>
              <CollectionsPage />
            </Lazy>
          }
        />
        <Route
          path="collections/birthdays"
          element={
            <Lazy>
              <BirthdaysPage />
            </Lazy>
          }
        />
        <Route
          path="collections/contests"
          element={
            <Lazy>
              <ContestsPage />
            </Lazy>
          }
        />
        <Route
          path="collections/books"
          element={
            <Lazy>
              <BooksPage />
            </Lazy>
          }
        />
        <Route
          path="collections/ideas"
          element={
            <Lazy>
              <IdeasPage />
            </Lazy>
          }
        />
        <Route
          path="collections/c/:collectionId"
          element={
            <Lazy>
              <CustomCollectionPage />
            </Lazy>
          }
        />
        <Route
          path="calendar"
          element={
            <Lazy>
              <CalendarPage />
            </Lazy>
          }
        />
        <Route
          path="settings"
          element={
            <Lazy>
              <SettingsPage />
            </Lazy>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
