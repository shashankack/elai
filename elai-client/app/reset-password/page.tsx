'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useState } from 'react'
import {
  requestPasswordReset,
  updatePasswordWithToken,
  MercurStoreError,
} from '@/lib/mercur/auth'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const emailFromLink = searchParams.get('email') ?? ''

  const [email, setEmail] = useState(emailFromLink)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const isUpdate = Boolean(token)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (isUpdate && token) {
        await updatePasswordWithToken(password, token)
      } else {
        await requestPasswordReset(email)
      }
      setDone(true)
    } catch (err) {
      if (err instanceof MercurStoreError) {
        setError(err.message || 'Could not complete password reset.')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Could not complete password reset.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-card">
      <p className="auth-card__eyebrow font-subheading">Account</p>
      <h1 className="auth-card__title font-heading">
        {isUpdate ? 'Set new password' : 'Reset password'}
      </h1>
      <p className="auth-card__lead font-subheading">
        {isUpdate
          ? 'Choose a new password for your Elai account.'
          : 'Enter your email and we will send a reset link if an account exists.'}
      </p>

      {done ? (
        <p className="auth-card__lead font-subheading" style={{ marginTop: '1.25rem' }}>
          {isUpdate ? (
            <>
              Password updated.{' '}
              <Link href="/account/login">Sign in</Link>
            </>
          ) : (
            <>
              If an account exists for that email, a reset link is on its way.
              Check your inbox.
            </>
          )}
        </p>
      ) : (
        <form className="auth-form font-subheading" onSubmit={onSubmit}>
          {error && <p className="auth-error">{error}</p>}

          {!isUpdate && (
            <div className="auth-field">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {isUpdate && (
            <div className="auth-field">
              <label htmlFor="reset-password">New password</label>
              <input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={busy}>
            {busy
              ? 'Please wait…'
              : isUpdate
                ? 'Update password'
                : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="auth-foot font-subheading">
        <Link href="/account/login">Back to sign in</Link>
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="elai-commerce-shell auth-page">
      <Suspense
        fallback={
          <div className="auth-card">
            <h1 className="auth-card__title font-heading">Reset password</h1>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </main>
  )
}
