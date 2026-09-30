import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, LinkButton } from '../../components'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../services/api'
import { useTheme } from '../../hooks/useTheme'

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(1, 'Parola gerekli'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  useTheme()
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values.email, values.password)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message || 'Giriş başarısız')
      } else {
        setFormError('Giriş başarısız')
      }
    }
  })

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10">
      <div className="w-full max-w-[360px]">
        <p className="footnote mb-2 font-semibold text-secondary">Life</p>
        <h1 className="large-title text-text">Giriş</h1>
        <p className="subheadline mt-1 mb-6 text-secondary">Hesabınıza giriş yapın.</p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="E-posta"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Parola"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {formError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {formError}
            </p>
          ) : null}

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Giriş yapılıyor…' : 'Giriş yap'}
          </Button>
        </form>

        <div className="mt-4">
          <p className="subheadline mb-1 text-secondary">Hesabınız yok mu?</p>
          <LinkButton to="/kayit" className="px-0">
            Kayıt ol
          </LinkButton>
        </div>
      </div>
    </div>
  )
}
