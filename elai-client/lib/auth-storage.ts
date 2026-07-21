const AUTH_TOKEN_KEY = 'elai_customer_token'

export function readAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function writeAuthToken(token: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  } catch {
    // private mode   session still works in memory via provider state
  }
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY)
  } catch {
    // ignore
  }
}
