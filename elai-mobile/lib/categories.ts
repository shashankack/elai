import { sdk } from '@/lib/sdk';

export type StoreCategory = {
  id: string;
  name: string;
  handle: string;
  description?: string | null;
  parent_category_id?: string | null;
  category_children?: StoreCategory[];
};

/** Fallback when Mercur categories aren't seeded yet (matches elai-client). */
export const FALLBACK_SHOP_CATEGORIES: Pick<StoreCategory, 'name' | 'handle'>[] = [
  { name: 'Jewellery', handle: 'jewellery-accessories' },
  { name: 'Fashion', handle: 'fashion-accessories' },
  { name: 'Hair', handle: 'hair-accessories' },
  { name: 'Bags', handle: 'bags-and-small-accessories' },
  { name: 'Beauty', handle: 'beauty-add-on-accessories' },
  { name: 'Tech', handle: 'tech-accessories' },
  { name: 'Lifestyle', handle: 'lifestyle-accessories' },
];

/** Short labels for the Nykaa-style circular strip. */
export const CATEGORY_SHORT_LABELS: Record<string, string> = {
  'jewellery-accessories': 'Jewellery',
  'fashion-accessories': 'Fashion',
  'hair-accessories': 'Hair',
  'bags-and-small-accessories': 'Bags',
  'beauty-add-on-accessories': 'Beauty',
  'tech-accessories': 'Tech',
  'lifestyle-accessories': 'Lifestyle',
};

export function shortCategoryLabel(name: string, handle?: string): string {
  if (handle && CATEGORY_SHORT_LABELS[handle]) {
    return CATEGORY_SHORT_LABELS[handle];
  }
  return name.split(' ')[0] || name;
}

type CategoryListResponse = {
  product_categories: StoreCategory[];
  count: number;
};

export async function listStoreCategories(): Promise<StoreCategory[]> {
  try {
    const data = await sdk.client.fetch<CategoryListResponse>('/store/product-categories', {
      method: 'GET',
      query: {
        limit: 100,
        fields: 'id,name,handle,description,parent_category_id,*category_children',
      },
    });
    const all = data.product_categories ?? [];
    const parents = all.filter((c) => !c.parent_category_id);
    return parents.length ? parents : all;
  } catch (err) {
    console.warn('Failed to load categories from API, using fallbacks', err);
    return FALLBACK_SHOP_CATEGORIES.map((c) => ({
      id: `fallback-${c.handle}`,
      name: c.name,
      handle: c.handle,
    }));
  }
}
