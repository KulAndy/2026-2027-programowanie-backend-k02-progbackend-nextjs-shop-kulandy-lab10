import Link from "next/link";
import type { ProductType } from "@/lib/products";

const TYPES: ProductType[] = ["cpu", "gpu", "ram", "disk"];

export default function CatalogPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">
        Katalog — przeglądanie po kategoriach
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Sekcja demonstruje Catch-all Segments: kategoria i produkt zapisane w
        ścieżce URL, a nie w parametrach zapytania.
      </p>
      <ul className="flex flex-wrap gap-3">
        {TYPES.map((type) => (
          <li key={type}>
            <Link
              href={`/catalog/${type}`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
            >
              {type}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
