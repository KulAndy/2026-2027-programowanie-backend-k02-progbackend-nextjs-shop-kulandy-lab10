import { getProducts } from "@/lib/repository";
import ProductCatalog from "@/app/components/product-catalog";

export default async function ProductListPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            PRODUKTY
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Katalog produktów
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Przeglądaj, sortuj i filtruj wszystkie produkty.
          </p>
        </div>
      </header>

      <ProductCatalog products={products} />
    </main>
  );
}
