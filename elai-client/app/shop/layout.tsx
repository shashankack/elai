import type { ReactNode } from 'react'

/** Shop PLP/PDP wrapper   header chrome lives in the root layout. */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return <div className="elai-shop-page">{children}</div>
}
