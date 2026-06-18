import { sdk } from '@/lib/sdk'
import type { HttpTypes } from '@medusajs/types'
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

type AuthContextType = {
  customer: HttpTypes.StoreCustomer | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>
  logout: () => Promise<void>
  refreshCustomer: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshCustomer = useCallback(async () => {
    try {
      const { customer: fetched } = await sdk.store.customer.retrieve()
      setCustomer(fetched)
    } catch {
      setCustomer(null)
    }
  }, [])

  useEffect(() => {
    refreshCustomer().finally(() => setLoading(false))
  }, [refreshCustomer])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const result = await sdk.auth.login('customer', 'emailpass', {
        email,
        password,
      })

      if (typeof result !== 'string') {
        throw new Error('Additional authentication steps are required.')
      }

      await refreshCustomer()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Check your credentials.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [refreshCustomer])

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
    ) => {
      setError(null)
      setLoading(true)
      try {
        const token = await sdk.auth.register('customer', 'emailpass', {
          email,
          password,
        })

        if (typeof token !== 'string') {
          throw new Error('Registration requires additional steps.')
        }

        await sdk.store.customer.create(
          { email, first_name: firstName, last_name: lastName },
          {},
          { Authorization: `Bearer ${token}` },
        )

        await refreshCustomer()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Registration failed.'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [refreshCustomer],
  )

  const logout = useCallback(async () => {
    setError(null)
    await sdk.auth.logout()
    setCustomer(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        customer,
        loading,
        error,
        login,
        register,
        logout,
        refreshCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
