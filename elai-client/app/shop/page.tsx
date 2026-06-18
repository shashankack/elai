import { ProductCard } from "@/components/shop/product-card";
import { ShopStatus } from "@/components/shop/shop-status";
import { isMercurStoreError, listProducts } from "@/lib/mercur/products";

export const metadata = {
  title: "Shop | Elai",
  description: "Browse accessories from Elai sellers.",
};

export default async function ShopPage() {
  try {
    const { products, count } = await listProducts();

    if (products.length === 0) {
      return (
        <main className="elai-shell py-16">
          <ShopStatus
            title="No products yet"
            message="Approved sellers haven't listed products yet. Check back soon or apply to sell on Elai."
          />
        </main>
      );
    }

    return (
      <main className="elai-shell py-10 md:py-16">
        <header className="mb-10">
          <p className="font-subheading text-xs font-semibold uppercase tracking-[0.2em] text-[var(--highlight)]">
            Elai Shop
          </p>
          <h1 className="mt-2 font-heading text-4xl text-foreground md:text-5xl">
            Shop accessories
          </h1>
          <p className="mt-3 max-w-2xl font-subheading text-sm text-foreground/70">
            Curated listings from approved Elai sellers. {count} product
            {count === 1 ? "" : "s"} available.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    );
  } catch (error) {
    const message = isMercurStoreError(error)
      ? `Mercur API error (${error.status}): ${error.message}`
      : error instanceof Error
        ? error.message
        : "Could not reach the Mercur store API.";

    return (
      <main className="elai-shell py-16">
        <ShopStatus
          title="Shop unavailable"
          message={`${message} Ensure Mercur API is running on port 9000 and MERCUR_PUBLISHABLE_API_KEY is set in .env.`}
        />
      </main>
    );
  }
}
