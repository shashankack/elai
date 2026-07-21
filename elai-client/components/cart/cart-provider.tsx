'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { clearCartId, readCartId, writeCartId } from '@/lib/cart-storage'
import {
  addLineItem,
  createCart,
  deleteLineItem,
  getCartItemCount,
  isMercurConfiguredInBrowser,
  resolveStoreRegionId,
  retrieveCart,
  updateLineItem,
  type StoreCart,
} from '@/lib/mercur/cart'
import { MercurStoreError } from '@/lib/mercur/store-client'

type CartContextValue = {
  cart: StoreCart | null
  itemCount: number
  loading: boolean
  busy: boolean
  error: string | null
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addToCart: (variantId: string, quantity?: number) => Promise<void>
  updateQuantity: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  refreshCart: () => Promise<void>
  clearLocalCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<StoreCart | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const cartRef = useRef<StoreCart | null>(null)
  const createInFlight = useRef<Promise<StoreCart> | null>(null)

  useEffect(() => {
    cartRef.current = cart
  }, [cart])

  const createCartOnce = useCallback(async () => {
    if (createInFlight.current) return createInFlight.current
    createInFlight.current = (async () => {
      const created = await createCart()
      writeCartId(created.id)
      setCart(created)
      cartRef.current = created
      return created
    })().finally(() => {
      createInFlight.current = null
    })
    return createInFlight.current
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        if (!isMercurConfiguredInBrowser()) {
          setCart(null)
          return
        }

        void resolveStoreRegionId().catch(() => undefined)

        const id = readCartId()
        if (id) {
          try {
            const existing = await retrieveCart(id)
            if (!cancelled) {
              setCart(existing)
              cartRef.current = existing
            }
            return
          } catch (err) {
            clearCartId()
            if (
              !(err instanceof MercurStoreError && err.status === 404) &&
              !cancelled
            ) {
              setError(
                err instanceof Error ? err.message : 'Could not load bag',
              )
            }
          }
        }

        // Prefetch empty cart so the first add is usually a single request.
        const created = await createCartOnce()
        if (!cancelled) {
          setCart(created)
          cartRef.current = created
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not prepare bag')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [createCartOnce])

  const removeItem = useCallback(async (lineId: string) => {
    const currentId = readCartId()
    if (!currentId) return
    setBusy(true)
    setError(null)
    try {
      const updated = await deleteLineItem(currentId, lineId)
      setCart(updated)
      cartRef.current = updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove item')
      throw err
    } finally {
      setBusy(false)
    }
  }, [])

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (quantity < 1) {
        await removeItem(lineId)
        return
      }
      const currentId = readCartId()
      if (!currentId) return
      setBusy(true)
      setError(null)
      try {
        const updated = await updateLineItem(currentId, lineId, quantity)
        setCart(updated)
        cartRef.current = updated
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not update item')
        throw err
      } finally {
        setBusy(false)
      }
    },
    [removeItem],
  )

  const addToCart = useCallback(
    async (variantId: string, quantity = 1) => {
      setBusy(true)
      setError(null)
      try {
        let cartId = cartRef.current?.id ?? readCartId()
        if (!cartId) {
          const created = await createCartOnce()
          cartId = created.id
        }

        try {
          const updated = await addLineItem(cartId, variantId, quantity)
          setCart(updated)
          cartRef.current = updated
          writeCartId(updated.id)
          setIsOpen(true)
        } catch (err) {
          if (
            err instanceof MercurStoreError &&
            (err.status === 404 || err.status === 400)
          ) {
            clearCartId()
            cartRef.current = null
            const created = await createCartOnce()
            const updated = await addLineItem(created.id, variantId, quantity)
            setCart(updated)
            cartRef.current = updated
            writeCartId(updated.id)
            setIsOpen(true)
          } else {
            throw err
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Could not add to bag'
        setError(message)
        throw err
      } finally {
        setBusy(false)
      }
    },
    [createCartOnce],
  )

  const refreshCart = useCallback(async () => {
    const id = readCartId()
    if (!id) return
    try {
      const updated = await retrieveCart(id)
      setCart(updated)
      cartRef.current = updated
    } catch (err) {
      if (err instanceof MercurStoreError && err.status === 404) {
        clearCartId()
        setCart(null)
        cartRef.current = null
      }
    }
  }, [])

  const clearLocalCart = useCallback(async () => {
    clearCartId()
    setCart(null)
    cartRef.current = null
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount: getCartItemCount(cart),
      loading,
      busy,
      error,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((v) => !v),
      addToCart,
      updateQuantity,
      removeItem,
      refreshCart,
      clearLocalCart,
    }),
    [
      cart,
      loading,
      busy,
      error,
      isOpen,
      addToCart,
      updateQuantity,
      removeItem,
      refreshCart,
      clearLocalCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider')
  }
  return ctx
}
