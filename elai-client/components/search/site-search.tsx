'use client'

import { Search, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from 'react'
import { getProductPrice, type StoreProduct } from '@/lib/mercur/products'
import { searchProducts } from '@/lib/mercur/search'
import { isMercurConfiguredInBrowser } from '@/lib/mercur/cart'

type SiteSearchProps = {
  initialQuery?: string
  categoryHandle?: string | null
  /** Compact variant for mobile menu */
  mobile?: boolean
  onNavigate?: () => void
  className?: string
}

type Suggestion = {
  product: StoreProduct
  price: string | null
}

const RECENT_KEY = 'elai_recent_searches'
const MAX_RECENT = 6

function readRecent(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string').slice(0, MAX_RECENT)
      : []
  } catch {
    return []
  }
}

function pushRecent(term: string) {
  const next = [term, ...readRecent().filter((t) => t !== term)].slice(
    0,
    MAX_RECENT,
  )
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export function SiteSearch({
  initialQuery = '',
  categoryHandle,
  mobile = false,
  onNavigate,
  className,
}: SiteSearchProps) {
  const router = useRouter()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState(initialQuery)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [, startTransition] = useTransition()
  const debounceRef = useRef<number | null>(null)
  const reqId = useRef(0)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    setRecent(readRecent())
  }, [])

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (debounceRef.current) window.clearTimeout(debounceRef.current)

    if (q.length < 2 || !isMercurConfiguredInBrowser()) {
      setSuggestions([])
      setLoading(false)
      return
    }

    setLoading(true)
    const id = ++reqId.current
    debounceRef.current = window.setTimeout(async () => {
      try {
        const { products } = await searchProducts(q, { limit: 6 })
        if (id !== reqId.current) return
        setSuggestions(
          products.map((product) => ({
            product,
            price: getProductPrice(product),
          })),
        )
      } catch {
        if (id !== reqId.current) return
        setSuggestions([])
      } finally {
        if (id === reqId.current) setLoading(false)
      }
    }, 220)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [query])

  function goToShop(term: string) {
    const q = term.trim()
    const params = new URLSearchParams()
    if (q) {
      params.set('q', q)
      pushRecent(q)
      setRecent(readRecent())
    }
    if (categoryHandle) params.set('category', categoryHandle)
    const qs = params.toString()
    setOpen(false)
    setActiveIndex(-1)
    onNavigate?.()
    startTransition(() => {
      router.push(qs ? `/shop?${qs}` : '/shop')
    })
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      const handle = suggestions[activeIndex].product.handle
      pushRecent(query.trim())
      setOpen(false)
      onNavigate?.()
      router.push(`/shop/products/${handle}`)
      return
    }
    goToShop(query)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) return
    const total = suggestions.length
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % Math.max(total, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? total - 1 : i - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const showPanel =
    open &&
    (query.trim().length >= 2 || recent.length > 0 || loading)

  return (
    <div
      ref={rootRef}
      className={`site-search${mobile ? ' site-search--mobile' : ''} ${className ?? ''}`.trim()}
    >
      <form
        onSubmit={onSubmit}
        className={`site-header__search${mobile ? ' site-header__search--mobile' : ''}`}
        role="search"
        autoComplete="off"
      >
        <span className="site-header__search-glyph" aria-hidden>
          <Search size={16} strokeWidth={2.25} />
        </span>
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search accessories…"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showPanel}
          className="font-subheading"
        />
        {query && (
          <button
            type="button"
            className="site-search__clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery('')
              setSuggestions([])
              setActiveIndex(-1)
              if (initialQuery) {
                goToShop('')
              }
            }}
          >
            <X size={14} strokeWidth={2.5} aria-hidden />
          </button>
        )}
        <button
          type="submit"
          className="site-header__search-submit"
          aria-label="Search"
        >
          <Search size={16} strokeWidth={2.5} aria-hidden />
        </button>
      </form>

      {showPanel && (
        <div className="site-search__panel" id={listId} role="listbox">
          {query.trim().length >= 2 ? (
            <>
              <div className="site-search__panel-head font-subheading">
                {loading ? 'Searching…' : 'Products'}
              </div>
              {!loading && suggestions.length === 0 && (
                <p className="site-search__empty font-subheading">
                  No matches for “{query.trim()}”
                </p>
              )}
              <ul className="site-search__list">
                {suggestions.map((item, index) => (
                  <li key={item.product.id} role="option" aria-selected={index === activeIndex}>
                    <Link
                      href={`/shop/products/${item.product.handle}`}
                      className={`site-search__hit${index === activeIndex ? ' is-active' : ''}`}
                      onClick={() => {
                        pushRecent(query.trim())
                        setOpen(false)
                        onNavigate?.()
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <span className="site-search__thumb">
                        {item.product.thumbnail ? (
                          <Image
                            src={item.product.thumbnail}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="site-search__hit-body">
                        <span className="site-search__hit-title font-subheading">
                          {item.product.title}
                        </span>
                        {item.product.type?.value && (
                          <span className="site-search__hit-meta font-subheading">
                            {item.product.type.value}
                          </span>
                        )}
                      </span>
                      {item.price && (
                        <span className="site-search__hit-price font-subheading">
                          {item.price}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="site-search__all font-subheading"
                onClick={() => goToShop(query)}
              >
                See all results for “{query.trim()}”
              </button>
            </>
          ) : (
            recent.length > 0 && (
              <>
                <div className="site-search__panel-head font-subheading">
                  Recent
                </div>
                <ul className="site-search__recent">
                  {recent.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        className="site-search__recent-item font-subheading"
                        onClick={() => {
                          setQuery(term)
                          goToShop(term)
                        }}
                      >
                        <Search size={14} strokeWidth={2} aria-hidden />
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )
          )}
        </div>
      )}
    </div>
  )
}
