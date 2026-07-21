'use client'

import { useMemo } from 'react'
import type { StoreCartItem } from '@/lib/mercur/cart'
import { formatCartMoney } from '@/lib/mercur/cart'

type MosaicTile = {
  key: string
  src: string | null
  title: string
  left: number
  top: number
  rotate: number
  size: 'sm' | 'md' | 'lg'
  z: number
  delay: number
}

function hashSeed(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function itemThumb(item: StoreCartItem) {
  return (
    item.thumbnail ||
    item.product?.thumbnail ||
    item.variant?.product?.thumbnail ||
    null
  )
}

function itemTitle(item: StoreCartItem) {
  return (
    item.product_title ||
    item.product?.title ||
    item.title ||
    'Item'
  )
}

function buildTiles(items: StoreCartItem[]): MosaicTile[] {
  const seed = hashSeed(items.map((i) => i.id).join('|') || 'empty')
  const rand = mulberry32(seed)
  const tiles: MosaicTile[] = []

  for (const item of items) {
    const copies = Math.min(Math.max(item.quantity || 1, 1), 3)
    for (let c = 0; c < copies; c++) {
      if (tiles.length >= 14) break
      const sizeRoll = rand()
      const size: MosaicTile['size'] =
        sizeRoll > 0.72 ? 'lg' : sizeRoll > 0.38 ? 'md' : 'sm'
      tiles.push({
        key: `${item.id}-${c}`,
        src: itemThumb(item),
        title: itemTitle(item),
        left: 4 + rand() * 62,
        top: 6 + rand() * 58,
        rotate: -18 + rand() * 36,
        size,
        z: 1 + Math.floor(rand() * 12),
        delay: rand() * 0.35,
      })
    }
  }

  // Soft push inward so tiles don’t hug the edge too hard
  return tiles.map((tile, index) => ({
    ...tile,
    left: Math.min(72, Math.max(2, tile.left + (index % 3 === 0 ? 2 : -1))),
    top: Math.min(68, Math.max(2, tile.top)),
  }))
}

type Props = {
  items: StoreCartItem[]
  itemCount: number
  total: number | null
  currency: string
}

export function CheckoutBagMosaic({
  items,
  itemCount,
  total,
  currency,
}: Props) {
  const tiles = useMemo(() => buildTiles(items), [items])

  return (
    <aside className="checkout-aside" aria-label="Items in this order">
      <div className="checkout-mosaic" aria-hidden={tiles.length === 0}>
        <div className="checkout-mosaic__glow" />
        <div className="checkout-mosaic__stage">
          {tiles.map((tile) => (
            <figure
              key={tile.key}
              className={`checkout-mosaic__tile checkout-mosaic__tile--${tile.size}`}
              style={{
                left: `${tile.left}%`,
                top: `${tile.top}%`,
                transform: `rotate(${tile.rotate}deg)`,
                zIndex: tile.z,
                animationDelay: `${tile.delay}s`,
              }}
            >
              {tile.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tile.src} alt="" loading="lazy" />
              ) : (
                <span className="checkout-mosaic__fallback font-heading">
                  {tile.title.slice(0, 1)}
                </span>
              )}
            </figure>
          ))}
        </div>
      </div>

      <div className="checkout-aside__summary font-subheading">
        <p className="checkout-aside__eyebrow">In your bag</p>
        <p className="checkout-aside__count">
          {itemCount} piece{itemCount === 1 ? '' : 's'}
        </p>
        {total != null && (
          <p className="checkout-aside__total">
            {formatCartMoney(total, currency)}
          </p>
        )}
        <ul className="checkout-aside__list">
          {items.map((item) => (
            <li key={item.id}>
              <span className="checkout-aside__thumb">
                {itemThumb(item) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={itemThumb(item)!} alt="" />
                ) : (
                  <span aria-hidden>●</span>
                )}
              </span>
              <span className="checkout-aside__meta">
                <strong>{itemTitle(item)}</strong>
                <em>×{item.quantity}</em>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
