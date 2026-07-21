'use client'

import { Menu, ShoppingBag, Store, User, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { useCart } from '@/components/cart/cart-provider'
import { SiteSearch } from '@/components/search/site-search'
import { VENDOR_PORTAL_URL } from '@/lib/vendor-portal-url'

export type NavCategory = {
  id: string
  name: string
  handle: string
}

type SiteHeaderProps = {
  categories: NavCategory[]
  searchQuery?: string
  activeCategory?: string | null
}

function BagButton({ className }: { className?: string }) {
  const { itemCount, openCart } = useCart()

  return (
    <button
      type="button"
      className={`site-header__icon-btn ${className ?? ''}`.trim()}
      onClick={openCart}
      aria-label={
        itemCount > 0 ? `Open bag, ${itemCount} items` : 'Open shopping bag'
      }
    >
      <ShoppingBag size={18} strokeWidth={2} aria-hidden />
      {itemCount > 0 && (
        <span className="site-header__bag-count">{itemCount}</span>
      )}
    </button>
  )
}

function AccountButton({ className }: { className?: string }) {
  const { isAuthenticated, loading } = useAuth()
  const href = isAuthenticated ? '/account' : '/account/login'

  return (
    <Link
      href={href}
      className={`site-header__icon-btn ${className ?? ''}`.trim()}
      aria-label={isAuthenticated ? 'Your account' : 'Sign in'}
      aria-busy={loading}
    >
      <User size={18} strokeWidth={2} aria-hidden />
    </Link>
  )
}

/** Stable chrome   no useSearchParams, safe as Suspense fallback. */
export function SiteHeader({
  categories,
  searchQuery = '',
  activeCategory = null,
}: SiteHeaderProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [catsHidden, setCatsHidden] = useState(false)
  const lastScrollY = useRef(0)
  const catsHiddenRef = useRef(false)
  const ignoreScrollUntil = useRef(0)

  const isShop = pathname.startsWith('/shop')
  const { isAuthenticated } = useAuth()

  function setCatsHiddenSafe(next: boolean) {
    if (catsHiddenRef.current === next) return
    catsHiddenRef.current = next
    setCatsHidden(next)
    // Collapsing the strip shortens the sticky header and shifts scrollY,
    // which used to re-trigger show/hide in a loop.
    ignoreScrollUntil.current = performance.now() + 420
  }

  useEffect(() => {
    lastScrollY.current = window.scrollY
    setScrolled(window.scrollY > 8)
    catsHiddenRef.current = false
    setCatsHidden(false)
    ignoreScrollUntil.current = 0
  }, [pathname])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY

      if (performance.now() < ignoreScrollUntil.current) {
        lastScrollY.current = y
        return
      }

      const delta = y - lastScrollY.current
      setScrolled(y > 8)

      if (menuOpen || y < 72) {
        setCatsHiddenSafe(false)
      } else if (delta > 16) {
        setCatsHiddenSafe(true)
      } else if (delta < -16) {
        setCatsHiddenSafe(false)
      }

      lastScrollY.current = y
    }

    lastScrollY.current = window.scrollY
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  const headerClass = [
    'site-header',
    scrolled ? 'is-scrolled' : '',
    catsHidden ? 'is-cats-hidden' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={headerClass}>
      <div className="site-header__top elai-shell">
        <Link href="/" className="site-header__brand" aria-label="ELAI home">
          <img src="/logo.png" alt="" width={48} height={48} />
        </Link>

        <SiteSearch
          initialQuery={searchQuery}
          categoryHandle={activeCategory}
          className="site-header__search-wrap"
        />

        <nav className="site-header__actions font-subheading" aria-label="Primary">
          <Link
            href="/shop"
            className={`site-header__nav-link${isShop ? ' is-active' : ''}`}
          >
            Shop
          </Link>
          <AccountButton />
          <BagButton />
          <a href={VENDOR_PORTAL_URL} className="site-header__cta">
            <Store size={15} strokeWidth={2.25} aria-hidden />
            <span>Sell On Elai</span>
          </a>
        </nav>

        <div className="site-header__mobile-tools">
          <AccountButton />
          <BagButton />
          <button
            type="button"
            className={`site-header__burger${menuOpen ? ' is-open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X size={20} strokeWidth={2.25} aria-hidden />
            ) : (
              <Menu size={20} strokeWidth={2.25} aria-hidden />
            )}
          </button>
        </div>
      </div>

      <div className="site-header__cats" aria-hidden={catsHidden}>
        <div className="site-header__cats-clip">
          <div className="elai-shell site-header__cats-inner">
            <Link
              href={
                searchQuery
                  ? `/shop?q=${encodeURIComponent(searchQuery)}`
                  : '/shop'
              }
              className={`site-header__chip font-subheading ${
                isShop && !activeCategory ? 'is-active' : ''
              }`}
            >
              All
            </Link>
            {categories.map((cat) => {
              const href = new URLSearchParams()
              if (searchQuery) href.set('q', searchQuery)
              href.set('category', cat.handle)
              return (
                <Link
                  key={cat.id}
                  href={`/shop?${href.toString()}`}
                  className={`site-header__chip font-subheading ${
                    activeCategory === cat.handle ? 'is-active' : ''
                  }`}
                >
                  {cat.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="site-header__mobile font-subheading">
          <SiteSearch
            initialQuery={searchQuery}
            categoryHandle={activeCategory}
            mobile
            onNavigate={() => setMenuOpen(false)}
            className="site-header__search-wrap site-header__search-wrap--mobile"
          />

          <Link
            href="/shop"
            className="site-header__mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            <ShoppingBag size={18} strokeWidth={2} aria-hidden />
            <span>Shop</span>
          </Link>

          <Link
            href={isAuthenticated ? '/account' : '/account/login'}
            className="site-header__mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            <User size={18} strokeWidth={2} aria-hidden />
            <span>{isAuthenticated ? 'Account' : 'Sign in'}</span>
          </Link>

          <MobileBagLink onClose={() => setMenuOpen(false)} />

          <a
            href={VENDOR_PORTAL_URL}
            className="site-header__mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            <Store size={18} strokeWidth={2} aria-hidden />
            <span>Sell on Elai</span>
          </a>
        </div>
      )}
    </header>
  )
}

/** Reads URL search params; must sit under Suspense. */
export function SiteHeaderWithSearchParams({
  categories,
}: {
  categories: NavCategory[]
}) {
  const searchParams = useSearchParams()
  return (
    <SiteHeader
      categories={categories}
      searchQuery={searchParams.get('q') ?? ''}
      activeCategory={searchParams.get('category')}
    />
  )
}

function MobileBagLink({ onClose }: { onClose: () => void }) {
  const { itemCount, openCart } = useCart()
  return (
    <button
      type="button"
      className="site-header__mobile-link"
      onClick={() => {
        onClose()
        openCart()
      }}
    >
      <ShoppingBag size={18} strokeWidth={2} aria-hidden />
      <span>Bag{itemCount > 0 ? ` (${itemCount})` : ''}</span>
    </button>
  )
}
