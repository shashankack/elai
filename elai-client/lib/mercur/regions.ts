import { cache } from 'react'

import { assertMercurConfigured } from './config'
import { storeFetch } from './store-client'

type StoreRegion = {
  id: string
  name?: string
  currency_code?: string
  countries?: { iso_2?: string }[]
}

type RegionListResponse = {
  regions: StoreRegion[]
}

const regionIdFromEnv =
  process.env.MERCUR_REGION_ID ??
  process.env.NEXT_PUBLIC_MERCUR_REGION_ID

/** Medusa needs region_id to calculate variant prices. */
export const getStoreRegionId = cache(async (): Promise<string> => {
  assertMercurConfigured()

  if (regionIdFromEnv) {
    return regionIdFromEnv
  }

  const { regions } = await storeFetch<RegionListResponse>('/store/regions', {
    searchParams: { limit: 50 },
  })

  if (!regions?.length) {
    throw new Error(
      'No store regions found. Run mercur seed or create a region in admin.',
    )
  }

  const india = regions.find(
    (r) =>
      r.currency_code?.toLowerCase() === 'inr' ||
      r.countries?.some((c) => c.iso_2?.toLowerCase() === 'in'),
  )

  return (india ?? regions[0]).id
})
