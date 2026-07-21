'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, busy, error, clearError, isAuthenticated, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const next = searchParams.get('next') || '/account'

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(next)
    }
  }, [loading, isAuthenticated, next, router])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    try {
      await login(email, password)
      router.push(next)
    } catch {
      // error surfaced via context
    }
  }

  return (
    <div className="auth-card">
      <p className="auth-card__eyebrow font-subheading">Welcome back</p>
      <h1 className="auth-card__title font-heading">Sign in</h1>
      <p className="auth-card__lead font-subheading">
        Access your Elai account to place orders and track purchases.
      </p>

      <form className="auth-form font-subheading" onSubmit={onSubmit}>
        {error && <p className="auth-error">{error}</p>}

        <div className="auth-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth-foot font-subheading">
        <Link href="/reset-password">Forgot password?</Link>
        {' · '}
        New here? <Link href="/account/register">Create an account</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="elai-commerce-shell auth-page">
      <Suspense
        fallback={
          <div className="auth-card">
            <h1 className="auth-card__title font-heading">Sign in</h1>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  )
}
