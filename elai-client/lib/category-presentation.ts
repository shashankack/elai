import { SITE_CATEGORIES } from './site-content'
import type { StoreCategory } from './mercur/categories'

export type CategoryCard = {
  id: string
  /** Full display title, e.g. "Jewellery Accessories" */
  title: string
  handle: string
  /** Short descriptive line of what's inside */
  items: string
  /** Image filename under /public */
  img: string
}

const PRESENTATION = new Map(
  SITE_CATEGORIES.map((c) => [c.handle, { items: c.items, img: c.img }]),
)

const FALLBACK_IMAGES = SITE_CATEGORIES.map((c) => c.img)

const STATIC_CARDS: CategoryCard[] = SITE_CATEGORIES.map((c) => ({
  id: `static:${c.handle}`,
  title: c.title,
  handle: c.handle,
  items: c.items,
  img: c.img,
}))

function childrenPreview(category: StoreCategory): string {
  const names = (category.category_children ?? [])
    .map((c) => c.name)
    .filter(Boolean)
  if (names.length) {
    return names.slice(0, 6).join(', ')
  }
  return category.description?.trim() || 'Explore the collection'
}

/**
 * Merge live Mercur parent categories with curated presentation data.
 * Known handles keep their art + blurb; new categories fall back to a
 * cycled image and a preview built from their children/description.
 * If Mercur returns nothing, use the fully curated static list.
 */
export function buildCategoryCards(
  categories: StoreCategory[],
): CategoryCard[] {
  if (!categories.length) {
    return STATIC_CARDS
  }

  return categories.map((category, index) => {
    const preset = PRESENTATION.get(category.handle)
    return {
      id: category.id,
      title: category.name,
      handle: category.handle,
      items: preset?.items ?? childrenPreview(category),
      img: preset?.img ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    }
  })
}
