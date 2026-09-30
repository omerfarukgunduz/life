import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Button,
  Checkbox,
  Dialog,
  Input,
  ListSection,
  PageHeader,
  ThemeToggle,
} from '../../components'
import { reminderScheduleHint } from '../dashboard/todayNotifications'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { ApiError } from '../../services/api'
import { authApi, dataApi, pushApi, settingsApi } from '../../services/endpoints'
import type { ExportData, UserSettings } from '../../types'
import { getTimeZone, urlBase64ToUint8Array } from '../../utils'

const emailSchema = z.object({
  newEmail: z.string().email('Geçerli bir e-posta girin'),
  currentPassword: z.string().min(1, 'Mevcut parola gerekli'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mevcut parola gerekli'),
    newPassword: z.string().min(8, 'En az 8 karakter'),
    confirmPassword: z.string().min(1, 'Parolayı tekrar girin'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Parolalar eşleşmiyor',
    path: ['confirmPassword'],
  })

type EmailFormValues = z.infer<typeof emailSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const { user, refresh, logout } = useAuth()
  const { canInstall, promptInstall, isInstalled } = useInstallPrompt()
  const { toast } = useToast()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importPayload, setImportPayload] = useState<ExportData | null>(null)
  const [pushBusy, setPushBusy] = useState(false)

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
  })

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { newEmail: user?.email ?? '', currentPassword: '' },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const updateSettings = useMutation({
    mutationFn: (next: UserSettings) => settingsApi.update(next),
    onSuccess: async (saved) => {
      qc.setQueryData(['settings'], saved)
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast('Ayarlar kaydedildi')
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiError ? err.message : 'Ayarlar kaydedilemedi')
    },
  })

  const changeEmail = useMutation({
    mutationFn: (values: EmailFormValues) =>
      authApi.changeEmail(values.newEmail, values.currentPassword),
    onSuccess: async (_data, variables) => {
      await refresh()
      emailForm.reset({ newEmail: variables.newEmail, currentPassword: '' })
      toast('E-posta güncellendi')
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiError ? err.message : 'E-posta güncellenemedi')
    },
  })

  const changePassword = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      authApi.changePassword(values.currentPassword, values.newPassword),
    onSuccess: () => {
      passwordForm.reset()
      toast('Parola güncellendi')
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiError ? err.message : 'Parola güncellenemedi')
    },
  })

  const importMutation = useMutation({
    mutationFn: (payload: ExportData) => dataApi.import(payload),
    onSuccess: async () => {
      setImportOpen(false)
      setImportPayload(null)
      await qc.invalidateQueries()
      toast('Veriler içe aktarıldı')
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiError ? err.message : 'İçe aktarma başarısız')
    },
  })

  const patch = (partial: Partial<UserSettings>) => {
    const base: UserSettings = settings ?? {
      timeZone: getTimeZone(),
      notifyTasks: true,
      notifyBirthdays: true,
      notifyContests: true,
      reminderTime: '09:00',
    }
    updateSettings.mutate({
      ...base,
      ...partial,
      timeZone: getTimeZone(),
    })
  }

  const enableNotifications = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      toast('Bu tarayıcı bildirimleri desteklemiyor')
      return
    }
    setPushBusy(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast('Bildirim izni verilmedi')
        return
      }
      const { publicKey } = await pushApi.vapidPublicKey()
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        }))
      const json = sub.toJSON()
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error('Abonelik anahtarları eksik')
      }
      await pushApi.subscribe({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      })
      patch({})
      toast('Bildirimler açıldı')
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Bildirim aboneliği başarısız')
    } finally {
      setPushBusy(false)
    }
  }

  const exportData = async () => {
    try {
      const data = await dataApi.export()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `life-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast('Dışa aktarma tamam')
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Dışa aktarma başarısız')
    }
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as ExportData
      if (!parsed || typeof parsed.version !== 'number') {
        toast('Geçersiz dosya')
        return
      }
      setImportPayload(parsed)
      setImportOpen(true)
    } catch {
      toast('Dosya okunamadı')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <section className="pb-4">
      <PageHeader title="Ayarlar" />

      <ListSection title="Hesap" settingsStyle>
        <div className="space-y-4 px-4 py-3">
          <p className="footnote text-secondary">
            Mevcut e-posta: <span className="text-text">{user?.email ?? '—'}</span>
          </p>

        <form
          className="space-y-3 border-t border-divider pt-4"
          onSubmit={emailForm.handleSubmit((values) => changeEmail.mutate(values))}
          noValidate
        >
          <p className="headline text-text">E-posta değiştir</p>
          <Input
            label="Yeni e-posta"
            type="email"
            autoComplete="email"
            error={emailForm.formState.errors.newEmail?.message}
            {...emailForm.register('newEmail')}
          />
          <Input
            label="Mevcut parola"
            type="password"
            autoComplete="current-password"
            error={emailForm.formState.errors.currentPassword?.message}
            {...emailForm.register('currentPassword')}
          />
          <Button type="submit" variant="secondary" fullWidth disabled={changeEmail.isPending}>
            E-postayı kaydet
          </Button>
        </form>

        <form
          className="space-y-3 border-t border-divider pt-4"
          onSubmit={passwordForm.handleSubmit((values) => changePassword.mutate(values))}
          noValidate
        >
          <p className="headline text-text">Parola değiştir</p>
          <Input
            label="Mevcut parola"
            type="password"
            autoComplete="current-password"
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register('currentPassword')}
          />
          <Input
            label="Yeni parola"
            type="password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register('newPassword')}
          />
          <Input
            label="Yeni parola (tekrar)"
            type="password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword')}
          />
          <Button type="submit" variant="secondary" fullWidth disabled={changePassword.isPending}>
            Parolayı kaydet
          </Button>
        </form>
        </div>
      </ListSection>

      <ListSection title="Görünüm" settingsStyle>
        <div className="flex min-h-[56px] items-center justify-between gap-3 px-4">
          <span className="text-[17px] leading-[22px] text-text">Tema</span>
          <ThemeToggle />
        </div>
      </ListSection>

      <ListSection title="Bildirimler" settingsStyle>
        <div className="space-y-3 px-4 py-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => void enableNotifications()}
            disabled={pushBusy}
          >
            Bildirimlere izin ver
          </Button>
        </div>
        <ul>
          {(
            [
              ['notifyTasks', 'İşler'] as const,
              ['notifyBirthdays', 'Doğum günleri'] as const,
              ['notifyContests', 'Yarışmalar'] as const,
            ] as const
          ).map(([key, label]) => (
            <li key={key}>
              <div className="flex min-h-[56px] items-center justify-between gap-3 px-4">
                <span className="text-[17px] leading-[22px] text-text">{label}</span>
                <Checkbox
                  checked={settings?.[key] ?? true}
                  onChange={(checked) => patch({ [key]: checked })}
                  aria-label={label}
                />
              </div>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-divider px-4 py-3">
          <Input
            label="Varsayılan bildirim saati"
            type="time"
            value={settings?.reminderTime ?? '09:00'}
            onChange={(event) => patch({ reminderTime: event.target.value.slice(0, 5) })}
            hint="Doğum günü ve yarışmalarda; vade saati olmayan işlerde kullanılır."
          />
          <p className="footnote text-secondary">
            Saat dilimi: {settings?.timeZone ?? getTimeZone()}
          </p>
          <p className="footnote leading-relaxed text-secondary">
            {reminderScheduleHint(settings?.reminderTime ?? '09:00')}
          </p>
        </div>
      </ListSection>

      <ListSection title="PWA" settingsStyle>
        <div className="px-4 py-3">
          {isInstalled ? (
            <p className="subheadline text-secondary">Yüklü</p>
          ) : canInstall ? (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => void promptInstall().then((ok) => ok && toast('Kurulum başlatıldı'))}
            >
              Uygulamayı yükle
            </Button>
          ) : (
            <p className="subheadline text-secondary">
              Yükleme istemi şu an kullanılamıyor. Destekleyen bir tarayıcıda ana ekrana eklenebilir.
            </p>
          )}
        </div>
      </ListSection>

      <ListSection title="Veri" settingsStyle>
        <div className="flex flex-col gap-2 px-4 py-3">
          <Button variant="secondary" fullWidth onClick={() => void exportData()}>
            Dışa aktar
          </Button>
          <Button variant="secondary" fullWidth onClick={() => fileRef.current?.click()}>
            İçe aktar
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </div>
      </ListSection>

      <div className="grouped-list lg:hidden">
        <button
          type="button"
          onClick={logout}
          className="flex min-h-[56px] w-full items-center justify-center px-4 text-[17px] font-semibold text-danger active:opacity-70"
        >
          Çıkış yap
        </button>
      </div>

      <Dialog
        open={importOpen}
        onClose={() => {
          setImportOpen(false)
          setImportPayload(null)
        }}
        onConfirm={() => importPayload && importMutation.mutate(importPayload)}
        title="Verileri içe aktar?"
        description="Mevcut verilerin yerine yazılır."
        confirmLabel="İçe aktar"
        danger
        busy={importMutation.isPending}
      />
    </section>
  )
}
