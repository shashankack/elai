const CART_ID_KEY = 'elai_cart_id'

export function readCartId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(CART_ID_KEY)
  } catch {
    return null
  }
}

export function writeCartId(cartId: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CART_ID_KEY, cartId)
  } catch {
    // private mode / blocked storage   cart still works for the session
  }
}

export function clearCartId() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CART_ID_KEY)
  } catch {
    // ignore
  }
}
