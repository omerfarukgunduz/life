import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../services/api'
import { useTheme } from '../../hooks/useTheme'

const schema = z
  .object({
    email: z.string().email('Geçerli bir e-posta girin'),
    password: z.string().min(8, 'Parola en az 8 karakter olmalı'),
    confirmPassword: z.string().min(1, 'Parola tekrarı gerekli'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Parolalar eşleşmiyor',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  useTheme()
  const { register: registerUser, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await registerUser(values.email, values.password)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setFormError('Kayıt kapalı')
      } else if (err instanceof ApiError) {
        setFormError(err.message || 'Kayıt başarısız')
      } else {
        setFormError('Kayıt başarısız')
      }
    }
  })

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="mb-8 text-sm font-semibold tracking-tight text-text">
          Life
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Kayıt
        </h1>
        <p className="mt-1 mb-8 text-sm text-secondary">
          Yeni bir hesap oluşturun.
        </p>

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
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Parola tekrar"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {formError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {formError}
            </p>
          ) : null}

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Kaydediliyor…' : 'Kayıt ol'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-secondary">
          Zaten hesabınız var mı?{' '}
          <Link to="/giris" className="font-medium text-accent">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  )
}
