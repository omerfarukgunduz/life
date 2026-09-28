import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { Button, Dialog, PageHeader, SegmentControl } from '../../components'
import { useToast } from '../../context/ToastContext'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { useTheme } from '../../hooks/useTheme'
import { ApiError } from '../../services/api'
import { dataApi, pushApi, settingsApi } from '../../services/endpoints'
import type { ExportData, ThemeMode, UserSettings } from '../../types'
import { getTimeZone, urlBase64ToUint8Array } from '../../utils'

const themeItems: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'Sistem' },
  { id: 'light', label: 'Açık' },
  { id: 'dark', label: 'Koyu' },
]

export default function SettingsPage() {
  const { preference, setPreference } = useTheme()
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

  const updateSettings = useMutation({
    mutationFn: (next: UserSettings) => settingsApi.update(next),
    onSuccess: (saved) => {
      qc.setQueryData(['settings'], saved)
      toast('Ayarlar kaydedildi')
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiError ? err.message : 'Ayarlar kaydedilemedi')
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
    <section className="space-y-8">
      <PageHeader title="Ayarlar" />

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-text">Görünüm</h2>
        <SegmentControl
          ariaLabel="Tema"
          items={themeItems}
          value={preference}
          onChange={(id) => setPreference(id as ThemeMode)}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-text">Bildirimler</h2>
        <Button
          variant="secondary"
          onClick={() => void enableNotifications()}
          disabled={pushBusy}
        >
          Bildirimlere izin ver
        </Button>
        <ul className="divide-y divide-border rounded-[12px] border border-border">
          {(
            [
              ['notifyTasks', 'Görevler'] as const,
              ['notifyBirthdays', 'Doğum günleri'] as const,
              ['notifyContests', 'Yarışmalar'] as const,
            ] as const
          ).map(([key, label]) => (
            <li key={key} className="flex items-center justify-between gap-3 px-3 py-3">
              <span className="text-[15px] text-text">{label}</span>
              <input
                type="checkbox"
                className="size-5 accent-[var(--accent)]"
                checked={settings?.[key] ?? true}
                onChange={(e) => patch({ [key]: e.target.checked })}
                aria-label={label}
              />
            </li>
          ))}
        </ul>
        <p className="text-[13px] text-secondary">
          Saat dilimi: {settings?.timeZone ?? getTimeZone()}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-text">PWA</h2>
        {isInstalled ? (
          <p className="text-[14px] text-secondary">Yüklü</p>
        ) : canInstall ? (
          <Button
            variant="secondary"
            onClick={() => void promptInstall().then((ok) => ok && toast('Kurulum başlatıldı'))}
          >
            Uygulamayı yükle
          </Button>
        ) : (
          <p className="text-[14px] text-secondary">
            Yükleme istemi şu an kullanılamıyor. Destekleyen bir tarayıcıda ana ekrana eklenebilir.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-text">Veri</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={() => void exportData()}>
            Dışa aktar
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
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
      </section>

      <section className="space-y-1">
        <h2 className="text-[15px] font-semibold text-text">Hakkında</h2>
        <p className="text-[14px] text-secondary">Life · sürüm 0.1.0</p>
      </section>

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
