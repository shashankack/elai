import { Suspense } from 'react'
import {
  SiteHeader,
  SiteHeaderWithSearchParams,
  type NavCategory,
} from '@/components/site-header'

export function SiteHeaderShell({ categories }: { categories: NavCategory[] }) {
  return (
    <Suspense fallback={<SiteHeader categories={categories} />}>
      <SiteHeaderWithSearchParams categories={categories} />
    </Suspense>
  )
}
