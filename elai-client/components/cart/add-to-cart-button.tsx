'use client'

import { useState, type MouseEvent } from 'react'
import { useCart } from '@/components/cart/cart-provider'

type AddToCartButtonProps = {
  variantId?: string | null
  quantity?: number
  label?: string
  className?: string
  disabled?: boolean
}

export function AddToCartButton({
  variantId,
  quantity = 1,
  label = 'Add to bag',
  className,
  disabled,
}: AddToCartButtonProps) {
  const { addToCart, busy } = useCart()
  const [pending, setPending] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  const isDisabled = disabled || !variantId || busy || pending

  async function onClick(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!variantId || isDisabled) return
    setPending(true)
    setFlash(null)
    try {
      await addToCart(variantId, quantity)
      setFlash('Added')
      window.setTimeout(() => setFlash(null), 1400)
    } catch {
      setFlash('Try again')
      window.setTimeout(() => setFlash(null), 1800)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      className={className}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={label}
    >
      {pending ? 'Adding…' : flash || label}
    </button>
  )
}
