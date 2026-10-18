import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";

export default function ProductDetails({ product }: { product: Product }) {
  return (
    <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:items-start lg:gap-12">
      <Link
        href={`/product-list/image/${product.id}`}
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-100"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <span className="text-sm font-semibold tracking-wider text-gray-400">
            {product.type.toUpperCase()}
          </span>
        )}
      </Link>

      <div className="flex flex-col py-2">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          {product.type}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {product.name}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Kod: <span className="font-mono font-semibold">{product.code}</span>
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Dodano:{" "}
          <span className="font-semibold">{product.date.substring(0, 10)}</span>
        </p>

        <p className="mt-4 text-base leading-7 text-gray-600">
          {product.description}
        </p>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-3xl font-bold text-gray-900">
            {(product.price / 100).toFixed(2)} zł
          </p>

          <p
            className={`mt-3 text-sm font-medium ${
              product.amount > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.amount > 0
              ? `Dostępny (${product.amount} szt.)`
              : "Niedostępny"}
          </p>
        </div>

        <Link
          href="/product-list"
          className="mt-8 text-sm font-semibold text-blue-600 hover:underline"
        >
          Wróć do katalogu
        </Link>
      </div>
    </section>
  );
}
