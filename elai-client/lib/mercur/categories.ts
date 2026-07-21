import { cache } from 'react'
import { assertMercurConfigured } from './config'
import { MercurStoreError, storeFetch } from './store-client'

export type StoreCategory = {
  id: string
  name: string
  handle: string
  description?: string | null
  parent_category_id?: string | null
  category_children?: StoreCategory[]
}

type CategoryListResponse = {
  product_categories: StoreCategory[]
  count: number
}

/** Fallback when Mercur categories aren't seeded yet (nav only  no product filter) */
export const FALLBACK_SHOP_CATEGORIES: Pick<StoreCategory, 'name' | 'handle'>[] =
  [
    { name: 'Jewellery', handle: 'jewellery-accessories' },
    { name: 'Fashion', handle: 'fashion-accessories' },
    { name: 'Hair', handle: 'hair-accessories' },
    { name: 'Bags', handle: 'bags-and-small-accessories' },
    { name: 'Beauty', handle: 'beauty-add-on-accessories' },
    { name: 'Tech', handle: 'tech-accessories' },
    { name: 'Lifestyle', handle: 'lifestyle-accessories' },
  ]

export const listStoreCategories = cache(async (): Promise<StoreCategory[]> => {
  try {
    assertMercurConfigured()
    const data = await storeFetch<CategoryListResponse>(
      '/store/product-categories',
      {
        searchParams: {
          limit: 100,
          fields:
            'id,name,handle,description,parent_category_id,*category_children',
        },
      },
    )
    const all = data.product_categories ?? []
    const parents = all.filter((c) => !c.parent_category_id)
    return parents.length ? parents : all
  } catch (error) {
    if (error instanceof MercurStoreError || error instanceof Error) {
      return []
    }
    throw error
  }
})

export async function getCategoryByHandle(
  handle: string,
): Promise<StoreCategory | null> {
  const parents = await listStoreCategories()
  for (const parent of parents) {
    if (parent.handle === handle) return parent
    const child = parent.category_children?.find((c) => c.handle === handle)
    if (child) return child
  }

  try {
    assertMercurConfigured()
    const data = await storeFetch<CategoryListResponse>(
      '/store/product-categories',
      {
        searchParams: {
          handle,
          limit: 1,
          fields: 'id,name,handle,parent_category_id',
        },
      },
    )
    return data.product_categories[0] ?? null
  } catch {
    return null
  }
}

export function navCategories(
  categories: StoreCategory[],
): { id: string; name: string; handle: string }[] {
  if (categories.length) {
    return categories.map((c) => ({
      id: c.id,
      name: shortCategoryName(c.name),
      handle: c.handle,
    }))
  }
  return FALLBACK_SHOP_CATEGORIES.map((c) => ({
    id: `fallback:${c.handle}`,
    name: c.name,
    handle: c.handle,
  }))
}

function shortCategoryName(name: string): string {
  return name
    .replace(/\s+Accessories$/i, '')
    .replace(/^Bags & Small$/i, 'Bags')
    .replace(/^Beauty Add-On$/i, 'Beauty')
    .trim()
}
