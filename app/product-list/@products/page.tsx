import type { ProductType } from "@/lib/products";
import { getProducts } from "@/lib/repository";
import { parseCatalogParams } from "@/lib/catalog-params";
import CatalogControls from "@/app/components/catalog-controls";
import ProductCatalog from "@/app/components/product-catalog";
import Link from "next/link";
import { connection } from "next/server";

export default async function ProductsSlot({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  await connection();
  const criteria = parseCatalogParams(raw);

  const products = await getProducts({
    sort: criteria.sort,
    availability: criteria.stock,
    type: criteria.type === "all" ? undefined : (criteria.type as ProductType),
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">
        Katalog produktów
      </h1>

      {criteria.skipped.length > 0 && (
        <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Pominięto błędne ustawienia: {criteria.skipped.join(", ")} — użyto
          wartości domyślnych.
        </p>
      )}

      <CatalogControls
        type={criteria.type}
        stock={criteria.stock}
        sort={criteria.sort === "date" ? "newest" : "name"}
      />

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <p className="text-gray-500">Brak produktów dla wybranych filtrów.</p>
          <Link
            href="/product-list"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
          >
            Wyczyść filtry
          </Link>
        </div>
      ) : (
        <ProductCatalog products={products} />
      )}
    </div>
  );
}
