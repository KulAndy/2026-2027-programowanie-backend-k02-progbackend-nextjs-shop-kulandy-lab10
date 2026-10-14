"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product, ProductType } from "@/lib/products";
import { getProducts } from "@/lib/repository";

const types: ProductType[] = ["cpu", "gpu", "ram", "disk"];

export default function ProductCatalog({
  category,
}: {
  category?: ProductType;
}) {
  const [sort, setSort] = useState<"name" | "date">("name");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({
      sort,
      availability: onlyAvailable ? "available" : "all",
      type: category,
    }).then((data) => {
      setProducts(data);
    });
  }, [category, onlyAvailable, sort]);

  return (
    <>
      <nav aria-label="Kategorie" className="mb-8 flex flex-wrap gap-3">
        {types.map((type) => (
          <Link
            key={type}
            href={`/product-list/${type}`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
          >
            {type}
          </Link>
        ))}
      </nav>

      <section
        aria-label="Filtrowanie produktów"
        className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4"
      >
        <label className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-700">
          Sortowanie:
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as "name" | "date")}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="name">Alfabetycznie</option>
            <option value="date">Najnowsze</option>
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(event) => setOnlyAvailable(event.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          Tylko dostępne
        </label>

        <p className="w-full text-sm text-gray-500 sm:w-auto">
          Wyświetlono: {products.length}
        </p>
      </section>

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
          Brak produktów do wyświetlenia.
        </p>
      ) : (
        <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg"
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
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Typ: {product.type}
                  </p>

                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                    {product.name}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                    {product.description}
                  </p>

                  <div className="mt-auto space-y-2 pt-5">
                    <p className="text-sm text-gray-700">
                      Ilość:{" "}
                      <span className="font-semibold">
                        {product.amount} szt.
                      </span>
                    </p>

                    <p className="text-xl font-bold text-gray-900">
                      {(product.price / 100).toFixed(2)} zł
                    </p>

                    <p
                      className={`text-sm font-medium ${
                        product.amount > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {product.amount > 0 ? "Dostępny" : "Niedostępny"}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
