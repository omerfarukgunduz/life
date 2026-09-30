import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate } from 'react-router-dom'
import { Button, Input, TextButton } from '../../components'
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
    <div className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10">
      <div className="w-full max-w-[360px]">
        <p className="footnote mb-2 font-semibold text-secondary">Life</p>
        <h1 className="large-title mb-6 text-text">
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
          {formError ? <p className="footnote text-danger">{formError}</p> : null}
          {registrationClosed ? (
            <p className="footnote text-secondary">Kayıt kapalı</p>
          ) : null}
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}
          </Button>
        </form>
        {!registrationClosed ? (
          <TextButton
            className="mt-3 self-start px-0"
            onClick={() => {
              setMode((m) => (m === 'login' ? 'register' : 'login'))
              setFormError(null)
            }}
          >
            {mode === 'login' ? 'Hesap oluştur' : 'Girişe dön'}
          </TextButton>
        ) : null}
      </div>
    </div>
  )
}

export default AuthPage
