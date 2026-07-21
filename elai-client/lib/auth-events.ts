const AUTH_CHANGED_EVENT = 'elai:auth-changed'

/** Notify cart (and others) after login/register/logout. */
export function emitAuthChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export function onAuthChanged(handler: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }
  window.addEventListener(AUTH_CHANGED_EVENT, handler)
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, handler)
}
