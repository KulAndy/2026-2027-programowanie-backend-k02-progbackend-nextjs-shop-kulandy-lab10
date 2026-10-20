import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";

export default function ProductCatalog({
  products,
  basePath = "/product-list",
}: {
  products: Product[];
  basePath?: string;
}) {
  return (
    <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <li
          key={product.id}
          className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          <Link
            href={
              basePath === "/product-list"
                ? `${basePath}/${product.id}`
                : `${basePath}/${product.type}/${product.id}`
            }
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
                  <span className="font-semibold">{product.amount} szt.</span>
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
  );
}
