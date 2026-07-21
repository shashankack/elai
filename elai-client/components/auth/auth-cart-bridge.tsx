'use client'

import { useEffect } from 'react'
import { useCart } from '@/components/cart/cart-provider'
import { onAuthChanged } from '@/lib/auth-events'

/** Refresh bag after login/register so transferred carts show up. */
export function AuthCartBridge() {
  const { refreshCart } = useCart()

  useEffect(() => onAuthChanged(() => {
    void refreshCart()
  }), [refreshCart])

  return null
}
