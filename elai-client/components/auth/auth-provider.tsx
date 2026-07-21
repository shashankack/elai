'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearAuthToken,
  readAuthToken,
  writeAuthToken,
} from '@/lib/auth-storage'
import { emitAuthChanged } from '@/lib/auth-events'
import { readCartId } from '@/lib/cart-storage'
import {
  loginCustomer,
  registerCustomer,
  retrieveCustomer,
  transferCartToCustomer,
  updateCustomer,
  type StoreCustomer,
  MercurStoreError,
} from '@/lib/mercur/auth'
import { isMercurConfiguredInBrowser } from '@/lib/mercur/cart'

type AuthContextValue = {
  customer: StoreCustomer | null
  token: string | null
  loading: boolean
  busy: boolean
  error: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: {
    email: string
    password: string
    first_name?: string
    last_name?: string
  }) => Promise<void>
  updateProfile: (input: {
    first_name?: string
    last_name?: string
    phone?: string
  }) => Promise<void>
  logout: () => void
  refreshCustomer: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toMessage(error: unknown): string {
  if (error instanceof MercurStoreError) {
    const msg = (error.message || '').toLowerCase()
    if (
      error.status === 409 ||
      (msg.includes('already exists') && msg.includes('account')) ||
      msg.includes('broken login record')
    ) {
      return (
        error.message ||
        'An account with this email already exists. Sign in, or reset your password.'
      )
    }
    if (
      msg.includes('identity') &&
      (msg.includes('already') || msg.includes('exists'))
    ) {
      return 'An account with this email already exists. Try signing in.'
    }
    if (error.status === 401) {
      if (msg === 'unauthorized' || msg.includes('unauthorized')) {
        return 'Could not finish signing you in. Please try again.'
      }
      return 'Invalid email or password.'
    }
    if (error.status === 400) {
      if (msg.includes('publishable')) {
        return 'Store is misconfigured (missing publishable API key). Check .env and restart Next.js.'
      }
      return error.message || 'Check your details and try again.'
    }
    return error.message || `Something went wrong (${error.status}).`
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<StoreCustomer | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applySession = useCallback(async (nextToken: string) => {
    writeAuthToken(nextToken)
    setToken(nextToken)
    const me = await retrieveCustomer(nextToken)
    setCustomer(me)

    const cartId = readCartId()
    if (cartId) {
      await transferCartToCustomer(cartId, nextToken)
    }
    emitAuthChanged()
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        if (!isMercurConfiguredInBrowser()) {
          setCustomer(null)
          setToken(null)
          return
        }
        const existing = readAuthToken()
        if (!existing) {
          setCustomer(null)
          setToken(null)
          return
        }
        const me = await retrieveCustomer(existing)
        if (cancelled) return
        setToken(existing)
        setCustomer(me)
      } catch {
        if (cancelled) return
        clearAuthToken()
        setToken(null)
        setCustomer(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      setBusy(true)
      setError(null)
      try {
        const nextToken = await loginCustomer(email, password)
        await applySession(nextToken)
      } catch (err) {
        setError(toMessage(err))
        throw err
      } finally {
        setBusy(false)
      }
    },
    [applySession],
  )

  const register = useCallback(
    async (input: {
      email: string
      password: string
      first_name?: string
      last_name?: string
    }) => {
      setBusy(true)
      setError(null)
      try {
        const nextToken = await registerCustomer(input)
        await applySession(nextToken)
      } catch (err) {
        setError(toMessage(err))
        throw err
      } finally {
        setBusy(false)
      }
    },
    [applySession],
  )

  const logout = useCallback(() => {
    clearAuthToken()
    setToken(null)
    setCustomer(null)
    setError(null)
    emitAuthChanged()
  }, [])

  const updateProfile = useCallback(
    async (input: {
      first_name?: string
      last_name?: string
      phone?: string
    }) => {
      const existing = token ?? readAuthToken()
      if (!existing) throw new Error('You need to sign in again.')
      setBusy(true)
      setError(null)
      try {
        const me = await updateCustomer(existing, input)
        setCustomer(me)
      } catch (err) {
        setError(toMessage(err))
        throw err
      } finally {
        setBusy(false)
      }
    },
    [token],
  )

  const refreshCustomer = useCallback(async () => {
    const existing = token ?? readAuthToken()
    if (!existing) {
      setCustomer(null)
      return
    }
    const me = await retrieveCustomer(existing)
    setCustomer(me)
    setToken(existing)
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      token,
      loading,
      busy,
      error,
      isAuthenticated: Boolean(customer && token),
      login,
      register,
      updateProfile,
      logout,
      refreshCustomer,
      clearError: () => setError(null),
    }),
    [
      customer,
      token,
      loading,
      busy,
      error,
      login,
      register,
      updateProfile,
      logout,
      refreshCustomer,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
