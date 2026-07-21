'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'

export default function RegisterPage() {
  const router = useRouter()
  const { register, busy, error, clearError, isAuthenticated, loading } =
    useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/account')
    }
  }, [loading, isAuthenticated, router])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    setLocalError(null)
    if (password !== confirm) {
      setLocalError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.')
      return
    }
    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      })
      router.push('/account')
    } catch {
      // error via context
    }
  }

  return (
    <main className="elai-commerce-shell auth-page">
      <div className="auth-card">
        <p className="auth-card__eyebrow font-subheading">Join Elai</p>
        <h1 className="auth-card__title font-heading">Create account</h1>
        <p className="auth-card__lead font-subheading">
          Create an account to checkout   Elai requires sign-in to place
          orders so we can confirm and track your purchases.
        </p>

        <form className="auth-form font-subheading" onSubmit={onSubmit}>
          {(localError || error) && (
            <p className="auth-error">{localError || error}</p>
          )}

          <div className="auth-form__row auth-form__row--2">
            <div className="auth-field">
              <label htmlFor="reg-first">First name</label>
              <input
                id="reg-first"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="reg-last">Last name</label>
              <input
                id="reg-last"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-confirm">Confirm password</label>
            <input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-foot font-subheading">
          Already have an account? <Link href="/account/login">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
