import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/repository";

export default async function ProductListPage() {
  const products = await getProducts({
    sort: "name",
  });

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
        </div>

        <p className="text-sm text-gray-500">
          {products.length} {products.length === 1 ? "produkt" : "produktów"}
        </p>
      </header>

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
          Brak produktów do wyświetlenia.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
            >
              <Link
                href={`/product-list/${product.id}`}
                className="flex h-full flex-col"
              >
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gray-100">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-sm font-semibold tracking-wider text-gray-400">
                      {product.type.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                    {product.type}
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                    {product.name}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                    {product.description}
                  </p>

                  <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                    <div>
                      <p className="text-xl font-bold text-gray-900">
                        {(product.price / 100).toFixed(2)} zł
                      </p>

                      <p
                        className={`mt-1 text-sm font-medium ${
                          product.amount > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {product.amount > 0
                          ? `Dostępny (${product.amount} szt.)`
                          : "Niedostępny"}
                      </p>
                    </div>

                    <span className="text-2xl text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
