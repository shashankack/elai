import { ProductCard } from "@/components/shop/product-card";
import { ShopPagination } from "@/components/shop/shop-pagination";
import { ShopStatus } from "@/components/shop/shop-status";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import {
  getCategoryByHandle,
  isMercurStoreError,
  listProducts,
} from "@/lib/mercur";

export const metadata = {
  title: "Shop | Elai",
  description: "Browse accessories from Elai sellers.",
};

const PAGE_SIZE = 24;

type ShopPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    offset?: string;
    sort?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const categoryHandle = params.category?.trim() || undefined;
  const sort = params.sort?.trim() || undefined;
  const offset = Math.max(0, Number(params.offset) || 0);

  const activeCategory = categoryHandle
    ? await getCategoryByHandle(categoryHandle)
    : null;
  const categoryId = activeCategory?.id;

  try {
    const { products, count } = await listProducts({
      limit: PAGE_SIZE,
      offset,
      q,
      categoryId,
      order: sort,
    });

    const baseParams = {
      q,
      category: categoryHandle,
      sort,
    };

    const categoryLabel = activeCategory
      ? shortName(activeCategory.name)
      : undefined;

    return (
      <main className="elai-commerce-shell py-6 md:py-10">
        <ShopToolbar
          count={count}
          q={q}
          categoryLabel={categoryLabel}
          sort={sort}
          baseParams={baseParams}
        />

        {products.length === 0 ? (
          <ShopStatus
            title="No products found"
            message={
              q || categoryHandle
                ? "Try another category or clear your search."
                : "Approved sellers haven't listed products yet. Check back soon or apply to sell on Elai."
            }
          />
        ) : (
          <>
            <div className="shop-plp-grid">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
            <ShopPagination
              total={count}
              limit={PAGE_SIZE}
              offset={offset}
              baseParams={baseParams}
            />
          </>
        )}
      </main>
    );
  } catch (error) {
    const message = isMercurStoreError(error)
      ? `Mercur API error (${error.status}): ${error.message}`
      : error instanceof Error
        ? error.message
        : "Could not reach the Mercur store API.";

    return (
      <main className="elai-commerce-shell py-16">
        <ShopStatus
          title="Shop unavailable"
          message={`${message} Ensure Mercur API is running and MERCUR_PUBLISHABLE_API_KEY is set.`}
        />
      </main>
    );
  }
}

function shortName(name: string) {
  return name
    .replace(/\s+Accessories$/i, "")
    .replace(/^Bags & Small$/i, "Bags")
    .trim();
}
