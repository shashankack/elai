'use client'

import { AuthCartBridge } from '@/components/auth/auth-cart-bridge'
import { AuthProvider } from '@/components/auth/auth-provider'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { CartProvider } from '@/components/cart/cart-provider'
import { GoToTop } from '@/components/go-to-top'

export function CartShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <AuthCartBridge />
        {children}
        <CartDrawer />
        <GoToTop />
      </CartProvider>
    </AuthProvider>
  )
}
