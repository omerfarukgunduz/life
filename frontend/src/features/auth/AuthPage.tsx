import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate } from 'react-router-dom'
import { Button, Input } from '../../components'
import { useAuth } from '../../hooks/useAuth'
import { ApiError } from '../../services/api'

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta gir'),
  password: z.string().min(6, 'En az 6 karakter'),
})

type FormValues = z.infer<typeof schema>

export function AuthPage() {
  const { login, register, isAuthenticated, loading } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [registrationClosed, setRegistrationClosed] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register: reg,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      if (mode === 'login') await login(values.email, values.password)
      else await register(values.email, values.password)
    } catch (err) {
      if (err instanceof ApiError) {
        if (mode === 'register' && err.status === 403) {
          setRegistrationClosed(true)
          setMode('login')
          return
        }
        setFormError(err.message)
        return
      }
      setFormError('Bir hata oluştu')
    }
  })

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <p className="mb-8 text-center text-[20px] font-semibold tracking-tight">Life</p>
        <h1 className="mb-6 text-[22px] font-semibold">
          {mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}
        </h1>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <Input
            label="E-posta"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...reg('email')}
          />
          <Input
            label="Parola"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            error={errors.password?.message}
            {...reg('password')}
          />
          {formError ? <p className="text-[13px] text-red-600">{formError}</p> : null}
          {registrationClosed ? (
            <p className="text-[13px] text-secondary">Kayıt kapalı</p>
          ) : null}
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}
          </Button>
        </form>
        {!registrationClosed ? (
          <button
            type="button"
            className="mt-4 w-full text-center text-[14px] text-accent"
            onClick={() => {
              setMode((m) => (m === 'login' ? 'register' : 'login'))
              setFormError(null)
            }}
          >
            {mode === 'login' ? 'Hesap oluştur' : 'Girişe dön'}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default AuthPage
