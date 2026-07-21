import { assertMercurConfigured } from './config'
import { resolveStoreRegionId } from './cart'
import { storeFetch } from './store-client'
import type { StoreProduct } from './products'

type ProductListResponse = {
  products: StoreProduct[]
  count: number
}

const SEARCH_FIELDS =
  'id,title,handle,thumbnail,*type,*variants.calculated_price'

/**
 * Lightweight product search for typeahead / shop `q` queries.
 * Safe to call from the browser (uses publishable key + region resolve).
 */
export async function searchProducts(
  q: string,
  options?: { limit?: number },
): Promise<{ products: StoreProduct[]; count: number }> {
  const query = q.trim()
  if (!query) return { products: [], count: 0 }

  assertMercurConfigured()
  const region_id = await resolveStoreRegionId()

  const data = await storeFetch<ProductListResponse>('/store/products', {
    searchParams: {
      region_id,
      q: query,
      limit: options?.limit ?? 8,
      offset: 0,
      fields: SEARCH_FIELDS,
    },
    cache: 'no-store',
  })

  return {
    products: data.products ?? [],
    count: data.count ?? data.products?.length ?? 0,
  }
}
