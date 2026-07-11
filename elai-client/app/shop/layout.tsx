import type { ReactNode } from 'react'

/**
 * Floating fixed navbar sits over content. Shop pages need top clearance
 * so titles/media aren't hidden under the pill.
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return <div className="elai-shop-page">{children}</div>
}
